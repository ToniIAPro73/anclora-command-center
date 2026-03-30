param(
    [string]$TaskName = "Anclora Daily Contract Governance",
    [string]$Time = "09:00"
)

$ErrorActionPreference = "Stop"

$cycleScript = Join-Path $PSScriptRoot "run-contract-governance-cycle.ps1"

if (-not (Test-Path $cycleScript)) {
    throw "Cycle script not found: $cycleScript"
}

if ($Time -notmatch '^\d{2}:\d{2}$') {
    throw "Time must be in HH:mm format."
}

$taskCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$cycleScript`""

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
Write-Output "Script: $cycleScript"
