param(
  [Parameter(Mandatory = $true)]
  [string]$ChangeId,
  [Parameter(Mandatory = $true)]
  [string]$ClosureNote,
  [string]$VaultRoot = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora"
)

$ErrorActionPreference = "Stop"

$queuePath = Join-Path $VaultRoot "docs\cambios\CONTRACT_CHANGE_QUEUE.md"
$historyPath = Join-Path $VaultRoot "docs\cambios\CONTRACT_CHANGE_HISTORY.md"

if (-not (Test-Path $queuePath)) {
  throw "No existe la cola de cambios: $queuePath"
}

if (-not (Test-Path $historyPath)) {
  throw "No existe el histórico de cambios: $historyPath"
}

$queueLines = Get-Content $queuePath
$historyLines = Get-Content $historyPath

$targetLine = ($queueLines | Where-Object { $_ -like "*$ChangeId*" -and $_.Trim().StartsWith("|") } | Select-Object -First 1)

if (-not $targetLine) {
  throw "No se encontró el cambio $ChangeId en la cola."
}

$cells = $targetLine.Split('|').ForEach({ $_.Trim() })

if ($cells.Count -lt 14) {
  throw "La fila de $ChangeId no tiene el formato esperado."
}

$historyRow = "| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} |" -f `
  $cells[1], `
  (Get-Date -Format "yyyy-MM-dd"), `
  $cells[3], `
  $cells[4], `
  $cells[5], `
  $cells[6], `
  $cells[7], `
  $cells[9], `
  $ClosureNote

$updatedQueueLines = foreach ($line in $queueLines) {
  if ($line -like "*$ChangeId*" -and $line.Trim().StartsWith("|")) {
    continue
  }
  $line
}

$historyPlaceholder = "| _Sin registros todavía_ |  |  |  |  |  |  |  |  |"
$updatedHistoryLines = foreach ($line in $historyLines) {
  if ($line -eq $historyPlaceholder) {
    $historyRow
  } else {
    $line
  }
}

if (-not ($updatedHistoryLines -contains $historyRow)) {
  $updatedHistoryLines += $historyRow
}

Set-Content -Path $queuePath -Value $updatedQueueLines
Set-Content -Path $historyPath -Value $updatedHistoryLines

Write-Host "Cambio $ChangeId movido a histórico."
