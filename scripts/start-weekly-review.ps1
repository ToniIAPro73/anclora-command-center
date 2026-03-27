param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd')
)

$ErrorActionPreference = "Stop"

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
    Set-Content -LiteralPath $dailyPath -Value $dailyTemplate
}

$content = Get-Content -Raw $dailyPath

if ($content -notmatch '## 🧹 Mantenimiento de Bóveda') {
    Add-Content -LiteralPath $dailyPath -Value @(
        '',
        '## 🧹 Mantenimiento de Bóveda',
        '',
        '- Notas Promovidas:',
        '- Enlaces Reparados:',
        '- Nuevas Entidades:',
        '- Estado de Salud:',
        '',
        '## 🐙 Estado Semanal de Repositorios',
        '',
        '- Repositorios Verificados:',
        '- Alertas de Actividad:',
        '- Sincronización de Documentación:',
        '- Nuevos Contribuyentes:'
    )
}

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'sync-skills.ps1')

$runTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$resultBlock = @(
    '## 🤖 Resultado de tarea automática',
    '',
    "- Última ejecución automática: $runTimestamp",
    '- Estado: preparación completada correctamente',
    '- Acciones ejecutadas: sincronización de skills, validación/creación de daily note, preparación de bloques semanales',
    '- Playbook sugerido: [[Revisión Semanal Completa de la Bóveda y Repositorios]]'
) -join "`r`n"

$updatedContent = Get-Content -Raw $dailyPath

if ($updatedContent -match '(?ms)^## 🤖 Resultado de tarea automática\s*.*?(?=^## |\z)') {
    $updatedContent = [regex]::Replace(
        $updatedContent,
        '(?ms)^## 🤖 Resultado de tarea automática\s*.*?(?=^## |\z)',
        $resultBlock + "`r`n`r`n"
    )
} else {
    $updatedContent = $updatedContent.TrimEnd() + "`r`n`r`n" + $resultBlock + "`r`n"
}

Set-Content -LiteralPath $dailyPath -Value $updatedContent

Add-Content -LiteralPath $logPath -Value "[$runTimestamp] Weekly review prepared for $Date"

Write-Output "Weekly review prepared in: $dailyPath"
Write-Output "Suggested playbook: [[Revisión Semanal Completa de la Bóveda y Repositorios]]"
Write-Output "Recommended schedule: every Friday at 15:00"
Write-Output "Run log written to: $logPath"

Send-ReviewNotification `
    -Title "Anclora Weekly Review" `
    -Message "La revisión semanal ya está preparada en $Date."
