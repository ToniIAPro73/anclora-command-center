param(
    [string]$TaskName = "Anclora Contract Governance Reminder",
    [string]$Time = "09:15"
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "send-contract-governance-reminder.ps1"

if (-not (Test-Path $scriptPath)) {
    throw "Reminder script not found: $scriptPath"
}

if ($Time -notmatch '^\d{2}:\d{2}$') {
    throw "Time must be in HH:mm format."
}

$taskCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""

schtasks.exe /Delete /TN $TaskName /F | Out-Null 2>$null

$createArgs = @(
    "/Create",
    "/TN", $TaskName,
    "/TR", $taskCommand,
    "/SC", "DAILY",
    "/ST", $Time,
    "/F"
)

$createResult = & schtasks.exe @createArgs 2>&1
if ($LASTEXITCODE -ne 0) {
    throw ($createResult -join [Environment]::NewLine)
}

Write-Output "Scheduled task registered: $TaskName"
Write-Output "Schedule: daily at $Time"
Write-Output "Script: $scriptPath"
