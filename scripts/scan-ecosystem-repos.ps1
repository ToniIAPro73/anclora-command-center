param(
    [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
    [switch]$AsJson
)

$ErrorActionPreference = "Stop"

$inventoryPath = Join-Path $VaultRoot "docs\governance\ecosystem-repos.json"

if (-not (Test-Path -LiteralPath $inventoryPath)) {
    throw "Ecosystem inventory not found: $inventoryPath"
}

function Get-RepoPath {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Repo
    )

    $candidates = @(
        $Repo.path_windows,
        $Repo.path_wsl
    ) | Where-Object { $_ -and $_.ToString().Trim() }

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    return $null
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoPath,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $previousNativePreference = $null
    $hasNativePreference = Test-Path Variable:PSNativeCommandUseErrorActionPreference

    if ($hasNativePreference) {
        $previousNativePreference = $PSNativeCommandUseErrorActionPreference
    }

    try {
        $PSNativeCommandUseErrorActionPreference = $false
        $output = & git -C $RepoPath @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    } finally {
        if ($hasNativePreference) {
            $PSNativeCommandUseErrorActionPreference = $previousNativePreference
        } else {
            Remove-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue
        }
    }

    if ($exitCode -ne 0) {
        return [pscustomobject]@{
            Success  = $false
            ExitCode = $exitCode
            Output   = @($output)
        }
    }

    return [pscustomobject]@{
        Success  = $true
        ExitCode = 0
        Output   = @($output)
    }
}

function Get-GitOutputText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoPath,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $result = Invoke-Git -RepoPath $RepoPath -Arguments $Arguments
    if (-not $result.Success) {
        return $null
    }

    $text = ($result.Output -join "`n").Trim()
    if ([string]::IsNullOrWhiteSpace($text)) {
        return $null
    }

    return $text
}

function Get-ChangedFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoPath
    )

    $result = Invoke-Git -RepoPath $RepoPath -Arguments @("status", "--porcelain=v1", "-uall", "--", ".")
    if (-not $result.Success) {
        return [pscustomobject]@{
            Dirty = $null
            Files = @()
        }
    }

    $files = New-Object System.Collections.Generic.List[object]

    foreach ($line in $result.Output) {
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        if ($line.Length -lt 4) {
            continue
        }

        $statusCode = $line.Substring(0, 2)
        $pathText = $line.Substring(3)
        $path = $pathText
        $previousPath = $null

        if ($pathText -match '^(?<before>.+?)\s+->\s+(?<after>.+)$') {
            $previousPath = $matches.before
            $path = $matches.after
        }

        $files.Add([pscustomobject]@{
            status_code   = $statusCode
            path          = $path
            previous_path = $previousPath
            raw           = $line
        }) | Out-Null
    }

    return [pscustomobject]@{
        Dirty = ($files.Count -gt 0)
        Files = @($files.ToArray())
    }
}

function Get-Classification {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Repo,

        [object[]]$ChangedFiles
    )

    if ($null -eq $ChangedFiles) {
        $ChangedFiles = @()
    }

    $signals = New-Object System.Collections.Generic.List[string]
    $categories = New-Object System.Collections.Generic.List[string]

    function Add-Category {
        param(
            [string]$Category,
            [string]$Signal
        )

        if ($Category) {
            if (-not ($categories -contains $Category)) {
                $categories.Add($Category) | Out-Null
            }
        }
        if ($Signal) {
            $signals.Add($Signal) | Out-Null
        }
    }

    foreach ($file in $ChangedFiles) {
        $path = $file.path
        if (-not $path) {
            continue
        }

        switch -Regex ($path) {
            '^(docs[\\/](governance|contracts|standards)[\\/])' {
                Add-Category -Category 'governance' -Signal "changed:$path"
                continue
            }
            '^(README\.md|docs[\\/])' {
                Add-Category -Category 'docs' -Signal "changed:$path"
                continue
            }
            '^(app[\\/]|src[\\/]|components[\\/]|lib[\\/]|public[\\/]|packages[\\/]|tokens[\\/]|assets[\\/]|ui_kits[\\/])' {
                Add-Category -Category 'code' -Signal "changed:$path"
                continue
            }
        }
    }

    $metadataSignals = @()
    if ($Repo.contracts_role) { $metadataSignals += "contracts_role:$($Repo.contracts_role)" }
    if ($Repo.design_system_role) { $metadataSignals += "design_system_role:$($Repo.design_system_role)" }
    if ($Repo.family) { $metadataSignals += "family:$($Repo.family)" }
    if ($Repo.tier) { $metadataSignals += "tier:$($Repo.tier)" }
    if ($Repo.status) { $metadataSignals += "status:$($Repo.status)" }

    foreach ($signal in $metadataSignals) {
        $signals.Add($signal) | Out-Null
    }

    $primary =
        if ($categories.Contains('governance')) { 'governance' }
        elseif ($categories.Contains('docs')) { 'docs' }
        elseif ($categories.Contains('code')) { 'code' }
        elseif ($Repo.design_system_role -eq 'source') { 'design-system-source' }
        elseif ($Repo.contracts_role -eq 'reference' -or $Repo.design_system_role -eq 'reference') { 'reference' }
        elseif ($Repo.tier -eq 'shared') { 'shared-platform' }
        elseif ($Repo.tier -eq 'core') { 'core-reference' }
        else { 'consumer-app' }

    return [pscustomobject]@{
        primary    = $primary
        categories = @($categories | Select-Object -Unique)
        signals    = @($signals | Select-Object -Unique)
    }
}

$inventory = Get-Content -Raw -LiteralPath $inventoryPath -Encoding UTF8 | ConvertFrom-Json
$repos = @($inventory.repos)
$scanTimestamp = Get-Date -Format "o"
$results = New-Object System.Collections.Generic.List[object]

foreach ($repo in $repos) {
    $repoPath = $null
    $accessStatus = "missing"
    $accessDetail = $null
    $branch = $null
    $lastCommit = [pscustomobject]@{
        short_hash = $null
        date       = $null
        author     = $null
        message    = $null
    }
    $dirty = $null
    $readmeExists = $false
    $changedFiles = @()
    $classification = [pscustomobject]@{
        primary    = "unclassified"
        categories = @()
        signals    = @()
    }

    try {
        $repoPath = Get-RepoPath -Repo $repo

        if (-not $repoPath) {
            $accessStatus = "inaccessible"
            $accessDetail = "Repo path not found or not mounted"
        } else {
            $accessStatus = "path_found"
            $gitResult = Invoke-Git -RepoPath $repoPath -Arguments @("rev-parse", "--is-inside-work-tree")
            if (-not $gitResult.Success) {
                $gitError = (@($gitResult.Output | ForEach-Object { $_.ToString() }) -join "`n").Trim()
                if ($gitError -match "dubious ownership") {
                    $accessStatus = "git_untrusted"
                    $accessDetail = $gitError
                } else {
                    $accessStatus = "git_error"
                    $accessDetail = $gitError
                }
                $readmeExists = Test-Path -LiteralPath (Join-Path $repoPath "README.md")
                $classification = Get-Classification -Repo $repo -ChangedFiles @()
            } elseif ((($gitResult.Output | Select-Object -First 1).ToString().Trim() -ne "true")) {
                $accessStatus = "not_git_repo"
                $accessDetail = "Path exists but is not a git work tree"
                $readmeExists = Test-Path -LiteralPath (Join-Path $repoPath "README.md")
                $classification = Get-Classification -Repo $repo -ChangedFiles @()
            } else {
                $accessStatus = "accessible"
                $branch = Get-GitOutputText -RepoPath $repoPath -Arguments @("branch", "--show-current")
                if ([string]::IsNullOrWhiteSpace($branch)) {
                    $branch = Get-GitOutputText -RepoPath $repoPath -Arguments @("rev-parse", "--short", "HEAD")
                    if ($branch) {
                        $branch = "(detached)"
                    }
                }

                $commitInfo = Get-GitOutputText -RepoPath $repoPath -Arguments @("log", "-1", "--format=%h|%ad|%an|%s", "--date=iso-strict")
                if ($commitInfo -and $commitInfo -match '^(?<hash>[^|]+)\|(?<date>[^|]+)\|(?<author>[^|]+)\|(?<message>.*)$') {
                    $lastCommit = [pscustomobject]@{
                        short_hash = $matches.hash
                        date       = $matches.date
                        author     = $matches.author
                        message    = $matches.message
                    }
                }

                $readmeExists = Test-Path -LiteralPath (Join-Path $repoPath "README.md")

                try {
                    $changedFilesResult = Get-ChangedFiles -RepoPath $repoPath
                    $changedFiles = @($changedFilesResult.Files)
                    $dirty = $changedFilesResult.Dirty
                    $classification = Get-Classification -Repo $repo -ChangedFiles $changedFiles
                } catch {
                    $dirty = $null
                    $changedFiles = @()
                    $classification = Get-Classification -Repo $repo -ChangedFiles @()
                    $accessDetail = "Changed-file scan skipped: $($_.Exception.Message)"
                }
            }
        }
    } catch {
        $accessStatus = "error"
        $accessDetail = $_.Exception.Message
    }

    $results.Add([pscustomobject]@{
        repo_id            = $repo.id
        repo_name          = $repo.name
        repo_family        = $repo.family
        repo_family_label   = $repo.family_label
        repo_tier          = $repo.tier
        obsidian_note      = $repo.obsidian_note
        repo_path          = $repoPath
        access_status      = $accessStatus
        access_detail      = $accessDetail
        branch             = $branch
        last_commit        = $lastCommit
        dirty              = $dirty
        readme_exists      = $readmeExists
        changed_files      = @($changedFiles)
        classification     = $classification
    }) | Out-Null
}

$summary = [ordered]@{
    total_repos       = $results.Count
    accessible_repos  = @($results | Where-Object { $_.access_status -eq "accessible" }).Count
    inaccessible_repos = @($results | Where-Object { $_.access_status -ne "accessible" }).Count
    dirty_repos       = @($results | Where-Object { $_.dirty }).Count
    readme_count      = @($results | Where-Object { $_.readme_exists }).Count
}

$output = [ordered]@{
    generated_at = $scanTimestamp
    vault_root   = $VaultRoot
    inventory    = $inventoryPath
    summary      = $summary
    repos        = @($results.ToArray())
}

if ($AsJson) {
    $output | ConvertTo-Json -Depth 8
    exit 0
}

Write-Host "=== Ecosystem Repo Scan ==="
Write-Host "Vault root: $VaultRoot"
Write-Host "Inventory: $inventoryPath"
Write-Host "Repos scanned: $($summary.total_repos)"
Write-Host "Accessible: $($summary.accessible_repos)"
Write-Host "Inaccessible: $($summary.inaccessible_repos)"
Write-Host "Dirty: $($summary.dirty_repos)"
Write-Host "README present: $($summary.readme_count)"
Write-Host ""

$results |
    Select-Object repo_id, repo_name, access_status, branch, dirty, readme_exists, @{Name = 'last_commit'; Expression = { $_.last_commit.short_hash }}, @{Name = 'classification'; Expression = { $_.classification.primary }} |
    Format-Table -AutoSize
