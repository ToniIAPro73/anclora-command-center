param(
  [string]$VaultRoot = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora",
  [switch]$AsJson
)

$ErrorActionPreference = "Stop"

function Get-FileHashSafe {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return $null
  }

  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash
}

$sourceStandards = Join-Path $VaultRoot "docs\standards"

if (-not (Test-Path $sourceStandards)) {
  throw "No existe la ruta de contratos maestra: $sourceStandards"
}

$universalFiles = @(
  "ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md",
  "UI_MOTION_CONTRACT.md",
  "MODAL_CONTRACT.md",
  "LOCALIZATION_CONTRACT.md"
)

$familyFiles = @{
  Internal = @("ANCLORA_INTERNAL_APP_CONTRACT.md")
  Premium = @("ANCLORA_PREMIUM_APP_CONTRACT.md")
  UltraPremium = @("ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md")
  Portfolio = @("ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT.md")
}

$repoMap = @(
  @{ Name = "anclora-group"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-group"; Family = "Internal" },
  @{ Name = "anclora-advisor-ai"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-advisor-ai"; Family = "Internal" },
  @{ Name = "anclora-nexus"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-nexus"; Family = "Internal" },
  @{ Name = "anclora-content-generator-ai"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-content-generator-ai"; Family = "Internal" },
  @{ Name = "anclora-impulso"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-impulso"; Family = "Premium" },
  @{ Name = "anclora-data-lab"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-data-lab"; Family = "Premium" },
  @{ Name = "anclora-synergi"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-synergi"; Family = "Premium" },
  @{ Name = "Boveda-Anclora/dashboard"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora\dashboard"; Family = "Premium" },
  @{ Name = "anclora-private-estates"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-private-estates"; Family = "UltraPremium" },
  @{ Name = "anclora-portfolio"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-portfolio"; Family = "Portfolio" },
  @{ Name = "anclora-azure-bay-landing"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-azure-bay-landing"; Family = "Portfolio" },
  @{ Name = "anclora-playa-viva-uniestate"; Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-playa-viva-uniestate"; Family = "Portfolio" }
)

$results = @()

foreach ($repo in $repoMap) {
  $targetStandards = Join-Path $repo.Path "docs\standards"
  $expectedFiles = @($universalFiles + $familyFiles[$repo.Family] | Select-Object -Unique)

  foreach ($fileName in $expectedFiles) {
    $sourceFile = Join-Path $sourceStandards $fileName
    $targetFile = Join-Path $targetStandards $fileName
    $sourceHash = Get-FileHashSafe -Path $sourceFile
    $targetHash = Get-FileHashSafe -Path $targetFile

    $status =
      if (-not $targetHash) { "MISSING" }
      elseif ($sourceHash -eq $targetHash) { "OK" }
      else { "OUTDATED" }

    $results += [pscustomobject]@{
      Repo = $repo.Name
      Family = $repo.Family
      Contract = $fileName
      Status = $status
      SourceHash = $sourceHash
      TargetHash = $targetHash
    }
  }
}

if ($AsJson) {
  $results | ConvertTo-Json -Depth 4
  exit 0
}

$summary = $results |
  Group-Object Repo |
  ForEach-Object {
    $group = $_.Group
    [pscustomobject]@{
      Repo = $_.Name
      Family = ($group | Select-Object -First 1).Family
      OK = ($group | Where-Object Status -eq "OK").Count
      OUTDATED = ($group | Where-Object Status -eq "OUTDATED").Count
      MISSING = ($group | Where-Object Status -eq "MISSING").Count
    }
  }

Write-Host ""
Write-Host "=== Contract Sync Summary ==="
$summary | Format-Table -AutoSize

$problems = $results | Where-Object { $_.Status -ne "OK" }
if ($problems.Count -gt 0) {
  Write-Host ""
  Write-Host "=== Contract Sync Issues ==="
  $problems | Format-Table Repo, Family, Contract, Status -AutoSize
} else {
  Write-Host ""
  Write-Host "Todos los contratos auditados están sincronizados."
}
