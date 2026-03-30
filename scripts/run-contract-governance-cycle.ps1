param(
    [string]$VaultRoot = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora",
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

function Invoke-And-Log {
    param(
        [string[]]$CommandArgs,
        [string]$Path
    )

    $output = & powershell @CommandArgs 2>&1
    foreach ($line in @($output)) {
        $text = [string]$line
        Write-Output $text
        Write-LogLine -Path $Path -Message $text
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
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Anclora Contract Governance")
        $notifier.Show($toast)
    } catch {
        Write-Output "Notification unavailable: $Message"
    }
}

$repoRoot = $VaultRoot
Set-Location $repoRoot

$logDir = Join-Path $repoRoot "logs"
$logPath = Join-Path $logDir "contract-governance.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

$detectScript = Join-Path $repoRoot "scripts\detect-contract-changes.ps1"
$processScript = Join-Path $repoRoot "scripts\process-contract-change-queue.ps1"
$auditScript = Join-Path $repoRoot "scripts\audit-contract-sync.ps1"
$planScript = Join-Path $repoRoot "scripts\generate-contract-action-plan.ps1"

foreach ($script in @($detectScript, $processScript, $auditScript, $planScript)) {
    if (-not (Test-Path $script)) {
        throw "Required script not found: $script"
    }
}

Write-LogLine -Path $logPath -Message "[$timestamp] Starting contract governance cycle"

$commonArgs = @('-ExecutionPolicy', 'Bypass')

$detectArgs = @($commonArgs + @('-File', $detectScript, '-VaultRoot', $repoRoot))
$processArgs = @($commonArgs + @('-File', $processScript, '-VaultRoot', $repoRoot))
$planArgs = @($commonArgs + @('-File', $planScript, '-VaultRoot', $repoRoot))

if ($WhatIfOnly) {
    $detectArgs += '-WhatIfOnly'
    $processArgs += '-WhatIfOnly'
    $planArgs += '-WhatIfOnly'
}

Invoke-And-Log -CommandArgs $detectArgs -Path $logPath
Invoke-And-Log -CommandArgs $processArgs -Path $logPath
Invoke-And-Log -CommandArgs @('-ExecutionPolicy', 'Bypass', '-File', $auditScript, '-VaultRoot', $repoRoot) -Path $logPath
Invoke-And-Log -CommandArgs $planArgs -Path $logPath

$endTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-LogLine -Path $logPath -Message "[$endTimestamp] Contract governance cycle finished"

$message = if ($WhatIfOnly) {
    "Daily cycle simulated successfully."
} else {
    "Daily cycle completed. Review logs and action plan."
}

Write-Output "Contract governance cycle finished."
Write-Output "Log written to: $logPath"

Send-GovernanceNotification -Title "Anclora Contract Governance" -Message $message
