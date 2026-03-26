param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd')
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$dailyDir = Join-Path $repoRoot "daily-notes"
$dailyPath = Join-Path $dailyDir "$Date.md"

if (-not (Test-Path $dailyDir)) {
    New-Item -ItemType Directory -Force $dailyDir | Out-Null
}

if (-not (Test-Path $dailyPath)) {
    $dailyTemplate = @(
        '---',
        "title: $Date",
        "date: $Date",
        'tags: [daily]',
        'related: []',
        '---',
        '',
        "# $Date",
        '',
        '## 🎯 Foco del día',
        '',
        '1.',
        '2.',
        '3.',
        '',
        '## 📝 Notas / Braindump',
        '',
        '## ✅ Completado',
        '',
        '-',
        '',
        '## 🔗 Referencias',
        '',
        '- [[Revisión Semanal Completa de la Bóveda y Repositorios]]',
        '',
        '#daily'
    )
    Set-Content -LiteralPath $dailyPath -Value $dailyTemplate
}

$content = Get-Content -Raw $dailyPath

if ($content -notmatch '## 🧹 Mantenimiento de Bóveda') {
    Add-Content -LiteralPath $dailyPath -Value @(
        '',
        '## 🧹 Mantenimiento de Bóveda',
        '',
        '- Notas Promovidas:',
        '- Enlaces Reparados:',
        '- Nuevas Entidades:',
        '- Estado de Salud:',
        '',
        '## 🐙 Estado Semanal de Repositorios',
        '',
        '- Repositorios Verificados:',
        '- Alertas de Actividad:',
        '- Sincronización de Documentación:',
        '- Nuevos Contribuyentes:'
    )
}

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'sync-skills.ps1')

Write-Output "Weekly review prepared in: $dailyPath"
Write-Output "Suggested playbook: [[Revisión Semanal Completa de la Bóveda y Repositorios]]"
Write-Output "Recommended schedule: every Friday at 15:00"
