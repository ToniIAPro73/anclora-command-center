param(
    [string]$TaskName = "Anclora Weekly Review",
    [string]$Day = "Friday",
    [string]$Time = "15:00"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$startScript = Join-Path $PSScriptRoot "start-weekly-review.ps1"

if (-not (Test-Path $startScript)) {
    throw "Start script not found: $startScript"
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`""

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Day -At $Time

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Launch the weekly Obsidian and repository review workflow for the Anclora vault." `
    -Force | Out-Null

Write-Output "Scheduled task registered: $TaskName"
Write-Output "Schedule: $Day at $Time"
Write-Output "Script: $startScript"
