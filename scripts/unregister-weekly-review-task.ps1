param(
    [string]$TaskName = "Anclora Weekly Review"
)

$ErrorActionPreference = "Stop"

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false

Write-Output "Scheduled task removed: $TaskName"
