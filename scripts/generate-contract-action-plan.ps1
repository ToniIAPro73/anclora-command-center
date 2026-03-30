param(
  [string]$VaultRoot = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora",
  [switch]$AsJson,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

$matrixPath = Join-Path $VaultRoot "docs\governance\CONTRACT_COMPLIANCE_MATRIX.md"
$outputPath = Join-Path $VaultRoot "docs\governance\CONTRACT_ACTION_PLAN.md"

if (-not (Test-Path $matrixPath)) {
  throw "No existe la matriz de cumplimiento: $matrixPath"
}

$lines = Get-Content -LiteralPath $matrixPath -Encoding UTF8

function Get-TableRows {
  param(
    [string[]]$Content,
    [string]$StartHeading,
    [string]$EndHeading
  )

  $startIndex = [Array]::IndexOf($Content, $StartHeading)
  if ($startIndex -lt 0) { return @() }

  $endIndex = [Array]::IndexOf($Content, $EndHeading)
  if ($endIndex -lt 0 -or $endIndex -le $startIndex) { $endIndex = $Content.Count }

  $rows = @()
  for ($i = $startIndex + 1; $i -lt $endIndex; $i++) {
    $line = $Content[$i].Trim()
    if ($line -match '^\|') {
      $rows += $line
    }
  }

  return $rows
}

function Parse-SummaryRow {
  param([string]$Row)

  $cells = $Row.Trim('|').Split('|') | ForEach-Object { $_.Trim() }
  if ($cells.Count -lt 10) { return $null }
  if ($cells[0] -eq "Aplicación" -or $cells[1] -eq "Familia") { return $null }

  return [pscustomobject]@{
    App = $cells[0].Trim('`')
    Family = $cells[1]
    UniversalMotion = $cells[2]
    UniversalModal = $cells[3]
    UniversalLocalization = $cells[4]
    FamilyContract = $cells[5]
    OverridesLocales = $cells[6]
    GlobalStatus = $cells[7]
    Gap = $cells[8]
    LastAudit = $cells[9]
  }
}

function Get-PriorityScore {
  param(
    [string]$Family,
    [string]$GlobalStatus,
    [string]$Gap
  )

  $base = switch ($Family) {
    "Premium" { 10 }
    "Ultra Premium" { 20 }
    "Internal" { 30 }
    "Portfolio / Showcase" { 40 }
    default { 50 }
  }

  if ($GlobalStatus -eq "NO") { $base -= 5 }
  elseif ($GlobalStatus -eq "PARTIAL") { $base -= 2 }

  if ($Gap -match "producción|override|credenciales|error") {
    $base -= 1
  }

  return $base
}

function Get-RecommendedAction {
  param(
    [string]$App,
    [string]$Family,
    [string]$Gap,
    [string]$GlobalStatus
  )

  switch -Regex ($Gap) {
    'pantalla por pantalla|detallada' { return "Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil." }
    'producción|produccion' { return "Validar el flujo completo en producción y cerrar el pass final." }
    'backoffice y workspace' { return "Recorrer todas las rutas del backoffice/workspace y cerrar i18n, tema y layout." }
    'backoffice' { return "Auditar todas las rutas del backoffice y corregir inconsistencias residuales." }
    'override' { return "Revisar overrides locales y documentarlos en la matriz." }
    'dashboard' { return "Revisar vistas secundarias y estados densos del dashboard." }
    'portfolio|showcase' { return "Auditar páginas públicas, responsive y jerarquía visual." }
    default {
      if ($Family -eq "Internal") { return "Completar auditoría visual de pantallas internas y validar contrato base." }
      if ($Family -eq "Premium") { return "Cerrar auditoría visual desktop/móvil y validar contratos premium comunes." }
      if ($Family -eq "Ultra Premium") { return "Validar excepciones ultra premium y revisar el contrato específico de la app." }
      if ($Family -eq "Portfolio / Showcase") { return "Auditar experiencia pública y responsive con foco en conversión." }
      return "Abrir auditoría visual completa de la aplicación."
    }
  }
}

$summaryRows = Get-TableRows -Content $lines -StartHeading "## Vista resumida por aplicación" -EndHeading "## Vista detallada por contrato"
$items = foreach ($row in $summaryRows) {
  if ($row -like '*---*') { continue }
  $parsed = Parse-SummaryRow -Row $row
  if ($null -eq $parsed) { continue }

  $priorityScore = Get-PriorityScore -Family $parsed.Family -GlobalStatus $parsed.GlobalStatus -Gap $parsed.Gap
  $nextAction = Get-RecommendedAction -App $parsed.App -Family $parsed.Family -Gap $parsed.Gap -GlobalStatus $parsed.GlobalStatus

  [pscustomobject]@{
    PriorityScore = $priorityScore
    Priority = "P$priorityScore"
    App = $parsed.App
    Family = $parsed.Family
    GlobalStatus = $parsed.GlobalStatus
    Gap = $parsed.Gap
    NextAction = $nextAction
    LastAudit = $parsed.LastAudit
  }
}

$sorted = $items | Sort-Object PriorityScore, Family, App

if ($AsJson) {
  $sorted | ConvertTo-Json -Depth 4
  exit 0
}

$familySummary = $sorted |
  Group-Object Family |
  ForEach-Object {
    $group = $_.Group
    [pscustomobject]@{
      Family = $_.Name
      Apps = $group.Count
      Partial = @($group | Where-Object GlobalStatus -eq "PARTIAL").Count
      NoCount = @($group | Where-Object GlobalStatus -eq "NO").Count
      Ok = @($group | Where-Object GlobalStatus -eq "OK").Count
    }
  } | Sort-Object Family

$builder = New-Object System.Text.StringBuilder
[void]$builder.AppendLine("# Contract Action Plan")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("## Objetivo")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("Convertir la matriz de cumplimiento en una lista priorizada de acciones para la bóveda.")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("Estados prioritarios del plan:")
[void]$builder.AppendLine("- `P10` y menores: más urgentes")
[void]$builder.AppendLine("- El score favorece apps premium y ultra premium antes que internal y portfolio")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("## Resumen por familia")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("| Familia | Apps | OK | PARTIAL | NO |")
[void]$builder.AppendLine("| --- | --- | --- | --- | --- |")
foreach ($row in $familySummary) {
  [void]$builder.AppendLine(('| `' + $row.Family + '` | ' + $row.Apps + ' | ' + $row.Ok + ' | ' + $row.Partial + ' | ' + $row.NoCount + ' |'))
}
[void]$builder.AppendLine("")
[void]$builder.AppendLine("## Plan priorizado")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("| Prioridad | Aplicación | Familia | Estado | Gap abierto | Próxima acción | Última auditoría |")
[void]$builder.AppendLine("| --- | --- | --- | --- | --- | --- | --- |")
foreach ($item in $sorted) {
  $gap = $item.Gap -replace '\|','/'
  [void]$builder.AppendLine(('| `' + $item.Priority + '` | `' + $item.App + '` | ' + $item.Family + ' | ' + $item.GlobalStatus + ' | ' + $gap + ' | ' + $item.NextAction + ' | ' + $item.LastAudit + ' |'))
}
[void]$builder.AppendLine("")
[void]$builder.AppendLine("## Uso")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("1. Revisar primero las filas con prioridad más baja (`P10`, `P11`, etc.).")
[void]$builder.AppendLine("2. Abrir o actualizar la entrada correspondiente en `docs/cambios/CONTRACT_CHANGE_QUEUE.md` si el gap requiere propagación.")
[void]$builder.AppendLine("3. Ejecutar la auditoría o la corrección en la app afectada.")
[void]$builder.AppendLine("4. Actualizar la matriz y cerrar el gap cuando la validación visual y contractual quede completa.")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("La matriz mide cumplimiento; este documento convierte el cumplimiento en trabajo pendiente.")

$content = $builder.ToString()

if ($WhatIfOnly) {
  $content
  exit 0
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, $content, $utf8)
Write-Host "Plan de acción generado en $outputPath"
