# SKD Video Studio: setup di disk D: (Windows, PowerShell).
# Jalankan sebagai user biasa (bukan Administrator):  powershell -ExecutionPolicy Bypass -File setup-d-drive.ps1
# Belum diuji di mesinmu. Kalau ada langkah yang gagal, baca pesan merahnya dan kirim ke Claude.
$ErrorActionPreference = 'Stop'
$Root   = 'D:\SKD-Video-Studio'
$Repo   = 'https://github.com/aljihadjundy-oss/jundy-aljihad.git'
$Branch = 'claude/compassionate-bardeen-4wo5cn'

if (-not (Test-Path 'D:\')) { throw 'Disk D: tidak ditemukan.' }

# 1) cek prasyarat
$missing = @()
function Need($cmd, $winget) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Host "ok       $cmd" }
  else { Write-Host "KURANG   $cmd  ->  winget install $winget"; $script:missing += $winget }
}
Need git    'Git.Git'
Need node   'OpenJS.NodeJS.LTS'
Need python 'Python.Python.3.12'
Need ffmpeg 'Gyan.FFmpeg'
if (-not (Test-Path 'C:\Program Files\Google\Chrome\Application\chrome.exe')) { Write-Host 'KURANG   Google Chrome  ->  winget install Google.Chrome'; $missing += 'Google.Chrome' }
if (-not (Test-Path 'C:\Program Files\Git\bin\bash.exe')) { Write-Host 'KURANG   Git Bash (ikut terpasang bersama Git for Windows)'; $missing += 'Git.Git' }
if ($missing.Count -gt 0) {
  Write-Host "`nPasang dulu yang kurang, lalu TUTUP dan BUKA LAGI PowerShell, lalu jalankan ulang script ini."
  exit 1
}

# 2) clone hanya bagian yang perlu (sparse checkout), langsung ke D:
New-Item -ItemType Directory -Force -Path $Root | Out-Null
if (-not (Test-Path "$Root\.git")) {
  git clone --filter=blob:none --no-checkout --branch $Branch $Repo $Root
  Set-Location $Root
  git sparse-checkout init --cone
  git sparse-checkout set .claude/skills/motion-infografis shape-teaser shape-teaser-v2 shape-motion siaga-sumatra-motion motion video-studio
  git checkout
} else {
  Set-Location $Root
  git pull origin $Branch
}

# 3) cache (playwright + font) juga di D:, bukan di C:
$cache = 'D:/SKD-Video-Studio/.cache/motion-infografis'   # pakai garis miring biasa supaya aman di Git Bash dan Node
[Environment]::SetEnvironmentVariable('MOTION_CACHE', $cache, 'User')
$env:MOTION_CACHE = $cache

# 4) Python: numpy, scipy, pillow (dipakai sound design dan contact sheet)
python -m pip install --upgrade pip
python -m pip install numpy scipy pillow

# 5) setup.sh bawaan skill (jalan lewat Git Bash)
$bash = 'C:\Program Files\Git\bin\bash.exe'
& $bash -lc "cd /d/SKD-Video-Studio && export MOTION_CACHE=$cache && bash .claude/skills/motion-infografis/scripts/setup.sh poppins jetbrains-mono montserrat ibm-plex-mono instrument-serif"

# 6) struktur folder kerja
foreach ($d in 'brand-kits','projects\founder','projects\internal','projects\client','queue\inbox','queue\running','queue\done','queue\failed') {
  New-Item -ItemType Directory -Force -Path "$Root\$d" | Out-Null
}

Write-Host "`nSelesai. Tes cepat (harus menghasilkan PNG di shape-teaser\out\stills):"
Write-Host "  cd $Root"
Write-Host "  node .claude\skills\motion-infografis\scripts\render.mjs shape-teaser --stills 5,25"
