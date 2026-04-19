param(
    [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
    [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

$standardsRoot = Join-Path $VaultRoot "docs\standards"
$queuePath = Join-Path $VaultRoot "docs\cambios\CONTRACT_CHANGE_QUEUE.md"
$stateDir = Join-Path $VaultRoot "logs"
$statePath = Join-Path $stateDir "contract-standards-state.json"

if (-not (Test-Path $standardsRoot)) {
    throw "Contracts root not found: $standardsRoot"
}

if (-not (Test-Path $queuePath)) {
    throw "Contract change queue not found: $queuePath"
}

if (-not (Test-Path $stateDir)) {
    New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
}

function Get-ScopeFromFileName {
    param([string]$FileName)

    switch ($FileName) {
        "UI_MOTION_CONTRACT.md" { return "UNIVERSAL" }
        "MODAL_CONTRACT.md" { return "UNIVERSAL" }
        "LOCALIZATION_CONTRACT.md" { return "UNIVERSAL" }
        "ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md" { return "UNIVERSAL" }
        "ANCLORA_INTERNAL_APP_CONTRACT.md" { return "INTERNAL" }
        "ANCLORA_PREMIUM_APP_CONTRACT.md" { return "PREMIUM" }
        "ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md" { return "ULTRA_PREMIUM" }
        "ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT.md" { return "PORTFOLIO" }
        default { return "UNIVERSAL" }
    }
}

function Get-TargetReposLabel {
    param([string]$Scope)

    switch ($Scope) {
        "UNIVERSAL" { return '`todos los repos de aplicaciones`' }
        "INTERNAL" { return '`familia internal`' }
        "PREMIUM" { return '`familia premium`' }
        "ULTRA_PREMIUM" { return '`familia ultra premium`' }
        "PORTFOLIO" { return '`familia portfolio`' }
        default { return '`por determinar`' }
    }
}

function Get-CurrentState {
    $files = Get-ChildItem -Path $standardsRoot -File | Sort-Object Name
    foreach ($file in $files) {
        [pscustomobject]@{
            Name = $file.Name
            Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash
        }
    }
}

function Load-PreviousState {
    if (-not (Test-Path $statePath)) {
        return @()
    }

    $raw = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8
    if (-not $raw.Trim()) {
        return @()
    }

    $data = $raw | ConvertFrom-Json
    if ($data -is [System.Array]) {
        return @($data)
    }

    return @($data)
}

function Get-NextChangeId {
    param([string[]]$QueueLines)

    $ids = @(
        $QueueLines |
            ForEach-Object {
                if ($_ -match 'CHG-(\d{4})') { [int]$matches[1] }
            } |
            Where-Object { $_ -ne $null }
    )

    if (-not $ids -or $ids.Count -eq 0) {
        return "CHG-0001"
    }

    return ("CHG-{0:D4}" -f (($ids | Measure-Object -Maximum).Maximum + 1))
}

$currentState = @(Get-CurrentState)
$hadPreviousState = Test-Path $statePath
$previousState = @(Load-PreviousState)
$previousMap = @{}
foreach ($entry in $previousState) {
    $previousMap[$entry.Name] = $entry.Hash
}

$changedFiles = @()
foreach ($entry in $currentState) {
    if (-not $previousMap.ContainsKey($entry.Name) -or $previousMap[$entry.Name] -ne $entry.Hash) {
        $changedFiles += $entry.Name
    }
}

if ($WhatIfOnly) {
    if (-not $hadPreviousState) {
        Write-Host "No state file found. First real run will create a baseline snapshot."
        exit 0
    }

    if ($changedFiles.Count -eq 0) {
        Write-Host "No contract changes detected."
    } else {
        Write-Host "Detected contract changes:"
        $changedFiles | ForEach-Object { Write-Host "- $_" }
    }
    exit 0
}

if (-not $hadPreviousState) {
    $currentState | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath -Encoding UTF8
    Write-Host "Contract state baseline created."
    exit 0
}

if ($changedFiles.Count -eq 0) {
    $currentState | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath -Encoding UTF8
    Write-Host "No contract changes detected."
    exit 0
}

$queueLines = Get-Content -LiteralPath $queuePath -Encoding UTF8
$newRows = @()

foreach ($fileName in $changedFiles) {
    $alreadyOpen = $queueLines | Where-Object {
        $_ -match '^\|' -and
        $_ -notmatch '^\| ---' -and
        $_ -match [regex]::Escape($fileName) -and
        $_ -match '\|\s*`?(DETECTED|ANALYSIS_REQUIRED|PLAN_READY|APPROVED|IN_PROGRESS|VERIFYING)`?\s*\|'
    }

    if ($alreadyOpen) {
        continue
    }

    $scope = Get-ScopeFromFileName -FileName $fileName
    $changeId = Get-NextChangeId -QueueLines ($queueLines + $newRows)
    $reviewRef = '`docs/cambios/revisiones/' + $changeId + '.md`'
    $targetRepos = Get-TargetReposLabel -Scope $scope
    $date = Get-Date -Format 'yyyy-MM-dd'
    $row = '| `' + $changeId + '` | ' + $date + ' | `' + $fileName + '` | `por clasificar` | `MODIFY` | `' + $scope + '` | Cambio detectado automaticamente en contrato maestro. | `Boveda-Anclora` | ' + $targetRepos + ' | `pendiente de analisis` | `ANALYSIS_REQUIRED` |  |  |  | ' + $reviewRef + ' |  | Detectado por `detect-contract-changes.ps1` |'
    $newRows += $row
}

if ($newRows.Count -eq 0) {
    $currentState | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath -Encoding UTF8
    Write-Host "Contract changes were already registered."
    exit 0
}

$updatedQueue = @()
$inserted = $false
foreach ($line in $queueLines) {
    $updatedQueue += $line
    if (-not $inserted -and $line -match '^\| ---') {
        $updatedQueue += $newRows
        $inserted = $true
    }
}

if (-not $inserted) {
    $updatedQueue += $newRows
}

[System.IO.File]::WriteAllLines($queuePath, $updatedQueue, (New-Object System.Text.UTF8Encoding($true)))
$currentState | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath -Encoding UTF8

Write-Host "Registered contract changes:"
$newRows | ForEach-Object { Write-Host $_ }
