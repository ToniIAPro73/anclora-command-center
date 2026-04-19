param(
    [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
    [int]$StaleAfterDays = 3,
    [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

function Write-LogLine {
    param(
        [string]$Path,
        [string]$Message
    )

    Add-Content -LiteralPath $Path -Value $Message -Encoding UTF8
}

function Load-DotEnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) {
            continue
        }

        $eqIndex = $trimmed.IndexOf('=')
        if ($eqIndex -lt 1) {
            continue
        }

        $name = $trimmed.Substring(0, $eqIndex).Trim()
        $value = $trimmed.Substring($eqIndex + 1).Trim().Trim('"')

        if (-not [Environment]::GetEnvironmentVariable($name, 'Process')) {
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
}

function Send-GovernanceNotification {
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
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Anclora Contract Governance Reminder")
        $notifier.Show($toast)
    } catch {
        Write-Output "Notification unavailable: $Message"
    }
}

function Parse-QueueRow {
    param([string]$Line)

    $cells = @($Line.Trim().Split('|') | ForEach-Object { $_.Trim() })
    if ($cells.Count -lt 18) { return $null }
    if ($cells[1] -eq 'ID') { return $null }
    if ($cells[1] -match '^-+$') { return $null }

    [pscustomobject]@{
        Id = $cells[1].Trim('`')
        Date = $cells[2]
        Contracts = $cells[3]
        Conditions = $cells[4]
        Type = $cells[5]
        Scope = $cells[6]
        Change = $cells[7]
        SourceRepo = $cells[8]
        TargetRepos = $cells[9]
        PropagationAction = $cells[10]
        Status = $cells[11].Trim('`')
        Decision = $cells[12].Trim('`')
        ApprovedBy = $cells[13]
        ApprovedAt = $cells[14]
        ActionPlan = $cells[15]
        AppliedIn = $cells[16]
        Notes = $cells[17]
    }
}

function Get-QueueRows {
    param([string[]]$Lines)

    foreach ($line in $Lines) {
        $row = Parse-QueueRow -Line $line
        if ($null -ne $row) { $row }
    }
}

function Send-SmtpReminder {
    param(
        [string]$Subject,
        [string]$Body
    )

    $smtpHost = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_SMTP_HOST', 'Process')
    $port = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_SMTP_PORT', 'Process')
    $user = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_SMTP_USER', 'Process')
    $pass = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_SMTP_PASS', 'Process')
    $from = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_EMAIL_FROM', 'Process')
    $to = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_EMAIL_TO', 'Process')
    $ssl = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_SMTP_SSL', 'Process')
    $tls = [Environment]::GetEnvironmentVariable('CONTRACT_GOVERNANCE_SMTP_TLS', 'Process')

    if (-not $smtpHost) { $smtpHost = [Environment]::GetEnvironmentVariable('SMTP_HOST', 'Process') }
    if (-not $port) { $port = [Environment]::GetEnvironmentVariable('SMTP_PORT', 'Process') }
    if (-not $user) { $user = [Environment]::GetEnvironmentVariable('SMTP_USERNAME', 'Process') }
    if (-not $pass) { $pass = [Environment]::GetEnvironmentVariable('SMTP_PASSWORD', 'Process') }
    if (-not $ssl) { $ssl = [Environment]::GetEnvironmentVariable('SMTP_USE_SSL', 'Process') }
    if (-not $tls) { $tls = [Environment]::GetEnvironmentVariable('SMTP_USE_TLS', 'Process') }

    if (-not $from) {
        $fallbackFromEmail = [Environment]::GetEnvironmentVariable('SMTP_FROM_EMAIL', 'Process')
        $fallbackFromName = [Environment]::GetEnvironmentVariable('SMTP_FROM_NAME', 'Process')
        if ($fallbackFromEmail) {
            if ($fallbackFromName) {
                $from = "$fallbackFromName <$fallbackFromEmail>"
            } else {
                $from = $fallbackFromEmail
            }
        }
    }

    if (-not $to) {
        $to = 'antonio@anclora.com'
    }

    if (-not $from) {
        $from = 'Anclora Alerts <antonio@anclora.com>'
    }

    if (-not $smtpHost -or -not $from -or -not $to) {
        return $false
    }

    $mail = New-Object System.Net.Mail.MailMessage
    $mail.From = New-Object System.Net.Mail.MailAddress($from)
    foreach ($recipient in ($to -split ';|,' | ForEach-Object { $_.Trim() } | Where-Object { $_ })) {
        $null = $mail.To.Add($recipient)
    }
    $mail.Subject = $Subject
    $mail.Body = $Body
    $mail.IsBodyHtml = $false

    $smtpPort = 587
    if ($port) {
        $smtpPort = [int]$port
    }

    $useSsl = ($ssl -match '^(1|true|yes)$')
    $useTls = ($tls -match '^(1|true|yes)$')

    if (-not $useSsl -and -not $useTls -and $smtpPort -eq 465) {
        $useSsl = $true
    }

    $client = New-Object System.Net.Mail.SmtpClient($smtpHost, $smtpPort)
    $client.EnableSsl = ($useSsl -or $useTls)

    if ($user -and $pass) {
        $securePass = ConvertTo-SecureString $pass -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($user, $securePass)
        $client.Credentials = $credential.GetNetworkCredential()
    }

    $client.Send($mail)
    return $true
}

$repoRoot = $VaultRoot
$queuePath = Join-Path $repoRoot "docs\cambios\CONTRACT_CHANGE_QUEUE.md"
$envPath = Join-Path $repoRoot ".env.local"
$logPath = Join-Path $repoRoot "logs\contract-governance.log"

Load-DotEnvFile -Path $envPath

if (-not (Test-Path $queuePath)) {
    throw "Queue not found: $queuePath"
}

$rows = @(Get-QueueRows -Lines (Get-Content -LiteralPath $queuePath -Encoding UTF8))
$pendingStates = @('ANALYSIS_REQUIRED', 'PLAN_READY', 'APPROVED', 'IN_PROGRESS', 'VERIFYING')
$pendingRows = @($rows | Where-Object { $_.Status -in $pendingStates })

if ($pendingRows.Count -eq 0) {
    Write-Host "No pending contract governance items."
    exit 0
}

$today = Get-Date
$staleRows = @()
foreach ($row in $pendingRows) {
    try {
        $parsedDate = [datetime]::Parse($row.Date, [System.Globalization.CultureInfo]::InvariantCulture)
        if (($today - $parsedDate).TotalDays -ge $StaleAfterDays) {
            $staleRows += $row
        }
    } catch {
        continue
    }
}

$premiumRows = @($pendingRows | Where-Object { $_.Scope -match 'PREMIUM|UNIVERSAL' })
$subjectDate = $today.ToString('d/M/yy, H:mm:ss')
$subject = "[Anclora] Contract Governance pendiente - $($pendingRows.Count) abiertos / $($staleRows.Count) estancados - $subjectDate"

$lines = @()
$lines += "Resumen de cambios contractuales pendientes"
$lines += ""
$lines += "Generado: $($today.ToString('yyyy-MM-dd HH:mm:ss'))"
$lines += "Pendientes totales: $($pendingRows.Count)"
$lines += "Pendientes premium/universal: $($premiumRows.Count)"
$lines += "Pendientes antiguos (>= $StaleAfterDays dias): $($staleRows.Count)"
$lines += ""
$lines += "Cambios abiertos:"
foreach ($row in $pendingRows) {
    $lines += "- $($row.Id) | estado $($row.Status) | ambito $($row.Scope) | contrato $($row.Contracts) | cambio $($row.Change)"
}

$body = $lines -join [Environment]::NewLine

if ($WhatIfOnly) {
    $body
    exit 0
}

$sent = $false
try {
    $sent = Send-SmtpReminder -Subject $subject -Body $body
} catch {
    Write-LogLine -Path $logPath -Message "[$($today.ToString('yyyy-MM-dd HH:mm:ss'))] Reminder send failed: $($_.Exception.Message)"
}

if ($sent) {
    Write-LogLine -Path $logPath -Message "[$($today.ToString('yyyy-MM-dd HH:mm:ss'))] Reminder email sent: $subject"
    Write-Host "Reminder email sent."
} else {
    Send-GovernanceNotification -Title "Anclora Contract Governance" -Message "$($pendingRows.Count) cambios pendientes sin resolver."
    Write-LogLine -Path $logPath -Message "[$($today.ToString('yyyy-MM-dd HH:mm:ss'))] Reminder fallback notification emitted."
    Write-Host "Reminder fallback notification emitted."
}
