param(
    [string]$TaskName = "Anclora Weekly Review",
    [string]$Day = "Friday",
    [string]$Time = "15:00"
)

$ErrorActionPreference = "Stop"

$startScript = Join-Path $PSScriptRoot "start-weekly-review.ps1"

if (-not (Test-Path $startScript)) {
    throw "Start script not found: $startScript"
}

$dayMap = @{
    "Monday"    = "MON"
    "Tuesday"   = "TUE"
    "Wednesday" = "WED"
    "Thursday"  = "THU"
    "Friday"    = "FRI"
    "Saturday"  = "SAT"
    "Sunday"    = "SUN"
}

if (-not $dayMap.ContainsKey($Day)) {
    throw "Day must be one of: $($dayMap.Keys -join ', ')"
}

if ($Time -notmatch '^\d{2}:\d{2}$') {
    throw "Time must be in HH:mm format."
}

$dayCode = $dayMap[$Day]
$taskCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$startScript`""

schtasks.exe /Delete /TN $TaskName /F | Out-Null 2>$null

$createArgs = @(
    "/Create",
    "/TN", $TaskName,
    "/TR", $taskCommand,
    "/SC", "WEEKLY",
    "/D", $dayCode,
    "/ST", $Time,
    "/F"
)

$createResult = & schtasks.exe @createArgs 2>&1
if ($LASTEXITCODE -ne 0) {
    throw ($createResult -join [Environment]::NewLine)
}

Write-Output "Scheduled task registered: $TaskName"
Write-Output "Schedule: $Day at $Time"
Write-Output "Script: $startScript"
