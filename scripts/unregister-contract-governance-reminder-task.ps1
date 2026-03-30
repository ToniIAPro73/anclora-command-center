param(
    [string]$TaskName = "Anclora Contract Governance Reminder"
)

$ErrorActionPreference = "Stop"

$result = & schtasks.exe /Delete /TN $TaskName /F 2>&1
if ($LASTEXITCODE -ne 0) {
    throw ($result -join [Environment]::NewLine)
}

Write-Output "Scheduled task removed: $TaskName"
