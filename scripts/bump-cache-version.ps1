param(
  [string]$Version,
  [switch]$IncludePhp,
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Version)) {
  $Version = (Get-Date -Format 'yyyyMMdd') + 'v1'
}

$root = Split-Path -Parent $PSScriptRoot
$patterns = @('*.html')
if ($IncludePhp) {
  $patterns += '*.php'
}

$files = foreach ($pattern in $patterns) {
  Get-ChildItem -Path $root -Recurse -File -Filter $pattern
}

if (-not $files) {
  Write-Host 'No target files found.'
  exit 0
}

# Matches query-string cache version tokens like ?v=old or &v=old.
$regex = '(?<prefix>[?&]v=)(?<value>[^"''\s)]+)'
$updatedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
  $original = Get-Content -Path $file.FullName -Raw
  $count = 0

  $updated = [System.Text.RegularExpressions.Regex]::Replace(
    $original,
    $regex,
    {
      param($m)
      if ($m.Groups['value'].Value -eq $Version) {
        return $m.Value
      }
      $script:count++
      return $m.Groups['prefix'].Value + $Version
    }
  )

  if ($count -gt 0) {
    $updatedFiles++
    $totalReplacements += $count

    if (-not $DryRun) {
      Set-Content -Path $file.FullName -Value $updated -NoNewline -Encoding UTF8
    }

    $relative = $file.FullName.Substring($root.Length + 1)
    $prefix = ''
    if ($DryRun) {
      $prefix = '[DRY-RUN] '
    }
    Write-Host ($prefix + "$relative -> $count replacement(s)")
  }
}

if ($updatedFiles -eq 0) {
  Write-Host "No changes needed. All versions already set to '$Version'."
  exit 0
}

if ($DryRun) {
  Write-Host "`nDry run complete."
} else {
  Write-Host "`nUpdate complete."
}

Write-Host "Version: $Version"
Write-Host "Files updated: $updatedFiles"
Write-Host "Total replacements: $totalReplacements"
