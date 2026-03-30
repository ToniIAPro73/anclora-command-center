param(
  [string]$VaultRoot = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora",
  [string[]]$Families,
  [string[]]$IncludeFiles,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

$sourceStandards = Join-Path $VaultRoot "docs\standards"
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
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-group"; Family = "Internal" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-advisor-ai"; Family = "Internal" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-nexus"; Family = "Internal" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-content-generator-ai"; Family = "Internal" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-impulso"; Family = "Premium" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-data-lab"; Family = "Premium" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-synergi"; Family = "Premium" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora\dashboard"; Family = "Premium" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-private-estates"; Family = "UltraPremium" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-portfolio"; Family = "Portfolio" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-azure-bay-landing"; Family = "Portfolio" },
  @{ Path = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\anclora-playa-viva-uniestate"; Family = "Portfolio" }
)

if (-not (Test-Path $sourceStandards)) {
  throw "No existe la ruta de contratos maestra: $sourceStandards"
}

$allKnownFiles = Get-ChildItem -Path $sourceStandards -File | Select-Object -ExpandProperty Name
$selectedFamilies = if ($Families -and $Families.Count -gt 0) { @($Families) } else { @("Internal", "Premium", "UltraPremium", "Portfolio") }
$selectedFiles = if ($IncludeFiles -and $IncludeFiles.Count -gt 0) { @($IncludeFiles | Select-Object -Unique) } else { $null }

foreach ($repoEntry in $repoMap) {
  $repo = $repoEntry.Path
  $family = $repoEntry.Family
  $targetStandards = Join-Path $repo "docs\standards"

  if ($family -notin $selectedFamilies) {
    continue
  }

  if (-not (Test-Path $repo)) {
    Write-Warning "Repositorio no encontrado: $repo"
    continue
  }

  if (-not (Test-Path $targetStandards)) {
    if ($WhatIfOnly) {
      Write-Host "[WhatIf] Crearía carpeta: $targetStandards"
    } else {
      New-Item -ItemType Directory -Path $targetStandards -Force | Out-Null
    }
  }

  $filesToCopy = @($universalFiles + $familyFiles[$family] | Select-Object -Unique)

  if ($selectedFiles) {
    $filesToCopy = @($filesToCopy | Where-Object { $_ -in $selectedFiles } | Select-Object -Unique)
  }

  foreach ($fileName in $filesToCopy) {
    if ($fileName -notin $allKnownFiles) {
      Write-Warning "Contrato no encontrado en origen: $fileName"
      continue
    }

    $sourceFile = Join-Path $sourceStandards $fileName
    $destination = Join-Path $targetStandards $fileName

    if ($WhatIfOnly) {
      Write-Host "[WhatIf] Copiaría $sourceFile -> $destination"
    } else {
      Copy-Item -LiteralPath $sourceFile -Destination $destination -Force
      Write-Host "Copiado $fileName -> $targetStandards"
    }
  }
}
