#!/usr/bin/env bash
# One-time setup (safe to re-run). Installs playwright-core + fonts into a cache dir and checks ffmpeg / python / Chrome.
#   bash setup.sh                      → default font (plus-jakarta-sans)
#   bash setup.sh inter montserrat     → extra @fontsource packages
set -e
CACHE="${MOTION_CACHE:-$HOME/.cache/motion-infografis}"
mkdir -p "$CACHE"
cd "$CACHE"
[ -f package.json ] || echo '{ "name": "motion-infografis-cache", "private": true }' > package.json
PKGS="playwright-core"
for f in plus-jakarta-sans "$@"; do PKGS="$PKGS @fontsource/$f"; done
npm install --silent --no-audit --no-fund $PKGS
echo "node deps ok → $CACHE"

ok=1
command -v ffmpeg >/dev/null && ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264 && echo "ffmpeg ok (libx264)" \
  || { echo "MISSING: ffmpeg with libx264  (Linux: apt-get install -y ffmpeg · macOS: brew install ffmpeg · Windows: winget install Gyan.FFmpeg)"; ok=0; }
PY=$(command -v python3 || command -v python)
$PY -c "import numpy" 2>/dev/null && echo "python numpy ok" || { $PY -m pip install -q numpy pillow && echo "installed numpy pillow"; }
$PY -c "import PIL" 2>/dev/null || $PY -m pip install -q pillow
node -e "
const fs=require('fs'),os=require('os'),p=require('path');
const c=[process.env.CHROME_PATH,'/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome',
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
p.join(os.homedir(),'AppData','Local','Google','Chrome','Application','chrome.exe')];
try{for(const d of fs.readdirSync('/opt/pw-browsers'))if(d.startsWith('chromium-'))c.push('/opt/pw-browsers/'+d+'/chrome-linux/chrome')}catch{}
const f=c.find(x=>x&&fs.existsSync(x));console.log(f?'chrome ok → '+f:'MISSING: Chrome/Chromium (install Google Chrome, or: npx playwright install chromium, then set CHROME_PATH)');"
$PY -c "import faster_whisper" 2>/dev/null && echo "faster-whisper ok (auto transcription available)" \
  || echo "note: faster-whisper not installed → transcription needs an SRT/VTT file, or: pip install faster-whisper (downloads a model from Hugging Face on first use)"
[ $ok = 1 ] || exit 1
