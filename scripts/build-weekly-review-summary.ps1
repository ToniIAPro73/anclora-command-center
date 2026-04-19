param(
    [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
    [int]$RecentDays = 7,
    [switch]$AsJson
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Invoke-EcosystemRepoScan {
    param(
        [Parameter(Mandatory = $true)]
        [string]$VaultRoot
    )

    $scannerPath = Join-Path $PSScriptRoot 'scan-ecosystem-repos.ps1'
    if (-not (Test-Path -LiteralPath $scannerPath)) {
        throw "Scanner script not found: $scannerPath"
    }

    $scanJson = & $scannerPath -VaultRoot $VaultRoot -AsJson
    if ($LASTEXITCODE -ne 0) {
        throw "Scanner script failed with exit code $LASTEXITCODE"
    }

    if ([string]::IsNullOrWhiteSpace($scanJson)) {
        throw "Scanner script returned no JSON output."
    }

    return $scanJson | ConvertFrom-Json
}

function ConvertTo-RepoIdText {
    param(
        [object[]]$Repos
    )

    if ($null -eq $Repos -or $Repos.Count -eq 0) {
        return ''
    }

    $ids = @($Repos | ForEach-Object { $_.repo_id } | Where-Object { $_ } | Sort-Object)
    return ($ids -join ', ')
}

function TryParse-RepoDate {
    param(
        [string]$DateText
    )

    if ([string]::IsNullOrWhiteSpace($DateText)) {
        return $null
    }

    $parsed = [datetimeoffset]::MinValue
    if ([datetimeoffset]::TryParse($DateText, [ref]$parsed)) {
        return $parsed
    }

    return $null
}

function Get-SyncAlertReason {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Repo
    )

    $reasons = New-Object System.Collections.Generic.List[string]

    if ($Repo.dirty -eq $true) {
        $reasons.Add('dirty') | Out-Null
    }

    $primary = $Repo.classification.primary
    switch ($primary) {
        'governance' { $reasons.Add('governance') | Out-Null }
        'docs' { $reasons.Add('docs') | Out-Null }
        'reference' { $reasons.Add('reference') | Out-Null }
        'design-system-source' { $reasons.Add('design-system-source') | Out-Null }
        'shared-platform' { $reasons.Add('shared-platform') | Out-Null }
        'core-reference' { $reasons.Add('core-reference') | Out-Null }
    }

    foreach ($category in @($Repo.classification.categories)) {
        if ($category -eq 'governance' -and -not ($reasons -contains 'governance')) {
            $reasons.Add('governance-category') | Out-Null
        }
        if ($category -eq 'docs' -and -not ($reasons -contains 'docs')) {
            $reasons.Add('docs-category') | Out-Null
        }
    }

    return @($reasons | Select-Object -Unique)
}

$scan = Invoke-EcosystemRepoScan -VaultRoot $VaultRoot
$repos = @($scan.repos)

$accessibleRepos = @($repos | Where-Object { $_.access_status -eq 'accessible' })
$limitedAccessRepos = @($repos | Where-Object { $_.access_status -eq 'git_untrusted' })
$inaccessibleRepos = @($repos | Where-Object {
    $_.access_status -in @('inaccessible', 'not_git_repo', 'git_error', 'error')
})

$recentThreshold = (Get-Date).AddDays(-$RecentDays)
$recentRepos = @(
    $accessibleRepos |
        ForEach-Object {
            $commitDate = TryParse-RepoDate -DateText $_.last_commit.date
            if ($commitDate -and $commitDate -ge $recentThreshold) {
                [pscustomobject]@{
                    repo_id     = $_.repo_id
                    repo_name   = $_.repo_name
                    date        = $commitDate
                    short_hash  = $_.last_commit.short_hash
                    branch      = $_.branch
                    access_status = $_.access_status
                }
            }
        } |
        Sort-Object -Property @{ Expression = { $_.date }; Descending = $true }, @{ Expression = { $_.repo_id }; Descending = $false }
)

$syncAlertRepos = @(
    $accessibleRepos |
        ForEach-Object {
            $reasons = Get-SyncAlertReason -Repo $_
            if ($reasons.Count -gt 0) {
                [pscustomobject]@{
                    repo_id   = $_.repo_id
                    repo_name = $_.repo_name
                    reasons   = @($reasons)
                    branch    = $_.branch
                    dirty     = $_.dirty
                }
            }
        } |
        Sort-Object repo_id
)

$summaryObject = [pscustomobject]@{
    generated_at            = $scan.generated_at
    vault_root              = $scan.vault_root
    total_repos             = $repos.Count
    accessible_repos        = $accessibleRepos.Count
    limited_access_repos    = $limitedAccessRepos.Count
    inaccessible_repos      = $inaccessibleRepos.Count
    recent_activity_repos   = $recentRepos.Count
    sync_alert_candidates   = $syncAlertRepos.Count
    accessible_repo_ids     = ConvertTo-RepoIdText -Repos $accessibleRepos
    limited_access_repo_ids = ConvertTo-RepoIdText -Repos $limitedAccessRepos
    inaccessible_repo_ids   = ConvertTo-RepoIdText -Repos $inaccessibleRepos
    recent_repo_ids         = ConvertTo-RepoIdText -Repos $recentRepos
    sync_alert_repo_ids     = ConvertTo-RepoIdText -Repos $syncAlertRepos
    next_action             = if ($syncAlertRepos.Count -gt 0) {
        'Revisar las alertas candidatas antes de cerrar la revisión semanal.'
    } elseif ($limitedAccessRepos.Count -gt 0) {
        'Resolver el acceso limitado para recuperar visibilidad completa.'
    } elseif ($inaccessibleRepos.Count -gt 0) {
        'Restaurar el acceso a los repos inaccesibles antes de confiar en la lectura semanal.'
    } else {
        'Sin bloqueos de sincronización detectados.'
    }
}

if ($AsJson) {
    $summaryObject | ConvertTo-Json -Depth 8
    exit 0
}

function Format-RepoList {
    param(
        [object[]]$Items,
        [scriptblock]$Formatter
    )

    if ($null -eq $Items -or $Items.Count -eq 0) {
        return 'ninguno'
    }

    return @(
        $Items | ForEach-Object { & $Formatter $_ }
    ) -join ', '
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('## 🐙 Estado Semanal de Repositorios') | Out-Null
$lines.Add('') | Out-Null
$lines.Add(('- Repositorios verificados / accesibles ({0}/{1}): {2}' -f $accessibleRepos.Count, $repos.Count, (Format-RepoList -Items $accessibleRepos -Formatter {
    param($Repo)
    if ($Repo.branch) {
        '{0} [{1}]' -f $Repo.repo_id, $Repo.branch
    } else {
        $Repo.repo_id
    }
}))) | Out-Null
$lines.Add(('- Repositorios inaccesibles ({0}): {1}' -f $inaccessibleRepos.Count, (Format-RepoList -Items $inaccessibleRepos -Formatter {
    param($Repo)
    if ($Repo.access_detail) {
        '{0} ({1}: {2})' -f $Repo.repo_id, $Repo.access_status, $Repo.access_detail
    } else {
        '{0} ({1})' -f $Repo.repo_id, $Repo.access_status
    }
}))) | Out-Null
$lines.Add(('- Repositorios con acceso limitado ({0}): {1}' -f $limitedAccessRepos.Count, (Format-RepoList -Items $limitedAccessRepos -Formatter {
    param($Repo)
    if ($Repo.access_detail) {
        '{0} ({1}: {2})' -f $Repo.repo_id, $Repo.access_status, $Repo.access_detail
    } else {
        '{0} ({1})' -f $Repo.repo_id, $Repo.access_status
    }
}))) | Out-Null

if ($recentRepos.Count -gt 0) {
    $lines.Add(('- Repos con actividad reciente (últimos {0} días): {1}' -f $RecentDays, (Format-RepoList -Items $recentRepos -Formatter {
        param($Repo)
        '{0} ({1}, {2}, {3})' -f $Repo.repo_id, $Repo.date.ToString('yyyy-MM-dd'), $Repo.short_hash, $Repo.branch
    }))) | Out-Null
} else {
    $lines.Add(('- Repos con actividad reciente (últimos {0} días): ninguno' -f $RecentDays)) | Out-Null
}

if ($syncAlertRepos.Count -gt 0) {
    $lines.Add(('- Alertas de sincronización candidatas: {0}' -f (Format-RepoList -Items $syncAlertRepos -Formatter {
        param($Repo)
        '{0} ({1})' -f $Repo.repo_id, ($Repo.reasons -join ', ')
    }))) | Out-Null
} else {
    $lines.Add('- Alertas de sincronización candidatas: ninguna') | Out-Null
}
$lines -join "`r`n"
