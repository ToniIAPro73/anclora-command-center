param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repoRoot ".codex\skills"
$target = Join-Path $repoRoot ".claude\skills"

if (-not (Test-Path $source)) {
    throw "Source skills folder not found: $source"
}

New-Item -ItemType Directory -Force $target | Out-Null

if ($Clean) {
    Get-ChildItem -LiteralPath $target -Force | Remove-Item -Recurse -Force
}

Get-ChildItem -LiteralPath $source -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $target -Recurse -Force
}

$readmeLines = @(
    '# Claude Skills Compatibility Layer',
    '',
    'La fuente canonica de skills de este repositorio es `.codex/skills/`.',
    '',
    'La carpeta `.claude/skills/` se mantiene como capa de compatibilidad para herramientas o agentes que esperan esa ruta.',
    '',
    'No edites esta carpeta manualmente salvo necesidad puntual. Para actualizarla, sincroniza desde `.codex/skills/`:',
    '',
    '```powershell',
    'powershell -ExecutionPolicy Bypass -File .\scripts\sync-skills.ps1 -Clean',
    '```'
)

$readmePath = Join-Path $target 'README.md'
Set-Content -LiteralPath $readmePath -Value $readmeLines

Write-Output "Synced skills from $source to $target"
