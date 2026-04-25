param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd')
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Get-Utf8FileContent {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Set-Utf8FileContent {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    [System.IO.File]::WriteAllText($Path, ($Content.TrimEnd() + "`r`n"), $Utf8NoBom)
}

function Set-MarkdownSection {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,
        [Parameter(Mandatory = $true)]
        [string]$HeadingPattern,
        [Parameter(Mandatory = $true)]
        [string]$SectionBody
    )

    $replacement = $SectionBody.Trim() + "`r`n`r`n"
    $escapedHeading = [regex]::Escape($HeadingPattern)
    $pattern = '(?ms)^## [^\r\n]*' + $escapedHeading + '[^\r\n]*\r?\n.*?(?=^## |\z)'

    if ($Content -match $pattern) {
        return [regex]::Replace($Content, $pattern, $replacement)
    }

    return $Content.TrimEnd() + "`r`n`r`n" + $replacement
}

function Send-ReviewNotification {
    param(
        [string]$Title,
        [string]$Message
    )

    try {
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml(@"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>$Title</text>
      <text>$Message</text>
    </binding>
  </visual>
</toast>
"@)

        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Anclora Weekly Review")
        $notifier.Show($toast)
    } catch {
        Write-Output "Notification unavailable: $Message"
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$dailyDir = Join-Path $repoRoot "daily-notes"
$dailyPath = Join-Path $dailyDir "$Date.md"
$logDir = Join-Path $repoRoot "logs"
$logPath = Join-Path $logDir "weekly-review.log"
$summaryStatePath = Join-Path $logDir "weekly-review-latest.json"

if (-not (Test-Path $dailyDir)) {
    New-Item -ItemType Directory -Force $dailyDir | Out-Null
}

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Force $logDir | Out-Null
}

if (-not (Test-Path $dailyPath)) {
    $dailyTemplate = @(
        '---',
        "title: $Date",
        "date: $Date",
        'tags: [daily]',
        'related: []',
        '---',
        '',
        "# $Date",
        '',
        '## 🎯 Foco del día',
        '',
        '1.',
        '2.',
        '3.',
        '',
        '## 🤖 Estado de automatizaciones',
        '',
        '- Última ejecución relevante:',
        '- Fallos detectados:',
        '- Acción de seguimiento:',
        '',
        '## 📝 Notas / Braindump',
        '',
        '## ✅ Completado',
        '',
        '-',
        '',
        '## 🔗 Referencias',
        '',
        '- [[Revisión Semanal Completa de la Bóveda y Repositorios]]',
        '',
        '#daily'
    )
    Set-Utf8FileContent -Path $dailyPath -Content ($dailyTemplate -join "`r`n")
}

$content = Get-Utf8FileContent -Path $dailyPath

$maintenanceBlock = @(
    '## 🧹 Mantenimiento de Bóveda',
    '',
    '- Notas Promovidas:',
    '- Enlaces Reparados:',
    '- Nuevas Entidades:',
    '- Estado de Salud:'
) -join "`r`n"

$content = Set-MarkdownSection -Content $content -HeadingPattern 'Mantenimiento de Bóveda' -SectionBody $maintenanceBlock
$runTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$startedMessage = "[$runTimestamp] Weekly review started for $Date"

Set-Utf8FileContent -Path $dailyPath -Content $content
Add-Content -LiteralPath $logPath -Value $startedMessage

try {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'sync-skills.ps1')

    $summaryPackageJson = & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build-weekly-review-summary.ps1') -VaultRoot $repoRoot -AsPackage
    if ([string]::IsNullOrWhiteSpace($summaryPackageJson)) {
        throw 'Weekly review summary builder returned no output.'
    }

    $summaryPackage = $summaryPackageJson | ConvertFrom-Json
    $summaryMarkdown = ([string]$summaryPackage.markdown).Trim()
    $scanResult = $summaryPackage.summary
    [System.IO.File]::WriteAllText($summaryStatePath, (($scanResult | ConvertTo-Json -Depth 8).TrimEnd() + "`r`n"), $Utf8NoBom)

    $resultBlock = @(
        '## 🤖 Resultado de tarea automática',
        '',
        "- Última ejecución automática: $runTimestamp",
        '- Estado: revisión semanal preparada con escaneo WSL',
        "- Repos auditados: $($scanResult.total_repos)",
        "- Repos accesibles: $($scanResult.accessible_repos)",
        "- Repos con acceso limitado: $($scanResult.limited_access_repos)",
        "- Alertas detectadas: $($scanResult.sync_alert_candidates)",
        "- Nodos de referencia vigilados: $($scanResult.sync_watch_candidates)",
        "- Siguiente acción sugerida: $($scanResult.next_action)",
        "- Estado máquina: [[logs/weekly-review-latest.json]]",
        '- Playbook sugerido: [[Revisión Semanal Completa de la Bóveda y Repositorios]]'
    ) -join "`r`n"

    $automationBlock = @(
        '## 🤖 Estado de automatizaciones',
        '',
        "- Última ejecución relevante: Revisión semanal preparada el $runTimestamp",
        "- Fallos detectados: ninguno en la ejecución actual",
        "- Acción de seguimiento: $($scanResult.next_action)"
    ) -join "`r`n"

    $updatedContent = $content
    $updatedContent = Set-MarkdownSection -Content $updatedContent -HeadingPattern 'Estado de automatizaciones' -SectionBody $automationBlock
    $updatedContent = Set-MarkdownSection -Content $updatedContent -HeadingPattern 'Estado Semanal de Repositorios' -SectionBody $summaryMarkdown
    $updatedContent = Set-MarkdownSection -Content $updatedContent -HeadingPattern 'Resultado de tarea automática' -SectionBody $resultBlock

    Set-Utf8FileContent -Path $dailyPath -Content $updatedContent

    Add-Content -LiteralPath $logPath -Value "[$runTimestamp] Weekly review prepared for $Date"

    Write-Output "Weekly review prepared in: $dailyPath"
    Write-Output "Suggested playbook: [[Revisión Semanal Completa de la Bóveda y Repositorios]]"
    Write-Output "Recommended schedule: every Friday at 15:00"
    Write-Output "Run log written to: $logPath"
}
catch {
    $failureMessage = $_.Exception.Message
    $errorBlock = @(
        '## ⚠️ Revisión semanal incompleta',
        '',
        "- Error: $failureMessage",
        '- Acción: Reintenta `scripts/start-weekly-review.ps1` y valida `logs/weekly-review-latest.json`.',
        '- Estado máquina: [[logs/weekly-review-latest.json]]',
        '- Playbook sugerido: [[Revisión Semanal Completa de la Bóveda y Repositorios]]'
    ) -join "`r`n"

    $failedContent = Set-MarkdownSection -Content $content -HeadingPattern 'Resultado de tarea automática' -SectionBody $errorBlock
    $failedContent = Set-MarkdownSection -Content $failedContent -HeadingPattern 'Estado de automatizaciones' -SectionBody @(
        '## 🤖 Estado de automatizaciones',
        '',
        "- Última ejecución relevante: Revisión semanal fallida el $runTimestamp",
        "- Fallos detectados: $failureMessage",
        '- Acción de seguimiento: Reintentar la ejecución y validar los logs'
    ) -join "`r`n"
    Set-Utf8FileContent -Path $dailyPath -Content $failedContent
    Add-Content -LiteralPath $logPath -Value "[$runTimestamp] Weekly review failed for ${Date}: $failureMessage"
    throw
}

Send-ReviewNotification `
    -Title "Anclora Weekly Review" `
    -Message "La revisión semanal ya está preparada en $Date."
