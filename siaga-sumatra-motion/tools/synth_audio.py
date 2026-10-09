"""Synthesize the soundtrack from out/meta.json cues: a quiet ambient pad + UI sound effects.

Everything is generated here (no samples, no third-party audio), so it is licence-free.
Usage: python3 tools/synth_audio.py out/meta.json out/audio.wav [start end]
"""
import json, math, re, subprocess, sys, wave
import numpy as np

SR = 48000
meta = json.load(open(sys.argv[1]))
out_path = sys.argv[2]
T0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
T1 = float(sys.argv[4]) if len(sys.argv) > 4 else meta['duration']
DUR = meta['duration']
N = int(round(DUR * SR))
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)
t_all = np.arange(N) / SR


def db(x):
    return 10 ** (x / 20)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    n = min(len(sig), N - i)
    gl, gr = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    L[i:i + n] += sig[:n] * gain * gl * math.sqrt(2)
    R[i:i + n] += sig[:n] * gain * gr * math.sqrt(2)


def svf_bandpass(x, f0, f1, q=1.2):
    """State-variable band-pass with a cutoff sweeping f0 → f1 (log)."""
    n = len(x)
    f = np.exp(np.linspace(math.log(f0), math.log(f1), n))
    g = np.tan(np.pi * f / SR)
    k = 1 / q
    y = np.zeros(n)
    ic1 = ic2 = 0.0
    for i in range(n):
        a1 = 1 / (1 + g[i] * (g[i] + k))
        v1 = a1 * ic1 + g[i] * a1 * (x[i] - ic2)
        v2 = ic2 + g[i] * v1
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        y[i] = v1
    return y


def env(n, attack, release, shape=2.0):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    r = np.clip((n / SR - t) / max(release, 1e-4), 0, 1)
    return (np.sin(a * np.pi / 2) ** shape) * (np.sin(r * np.pi / 2) ** shape)


def whoosh(length=0.7, f0=250, f1=2600, q=0.9):
    n = int(length * SR)
    x = rng.standard_normal(n)
    y = svf_bandpass(x, f0, f1, q) + 0.5 * svf_bandpass(x, f1 * 0.5, f0 * 2, q)
    return y * env(n, length * 0.55, length * 0.45) * 0.55


def pop(freq):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.35 * np.exp(-t / 0.012))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.07) + 0.25 * np.sin(2 * ph) * np.exp(-t / 0.03)
    click = rng.standard_normal(n) * np.exp(-t / 0.002) * 0.15
    return (body + click) * env(n, 0.002, 0.05, 1)


def tick(freq=2100):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.018) + 0.4 * np.sin(2 * np.pi * freq * 1.5 * t) * np.exp(-t / 0.01)
    return s * env(n, 0.001, 0.03, 1)


def swell(length=1.6):
    n = int(length * SR)
    x = rng.standard_normal(n)
    y = svf_bandpass(x, 400, 5000, 0.7)
    t = np.arange(n) / SR
    return y * (t / length) ** 2.2 * env(n, 0.01, 0.12, 1) * 0.5


# ---------------------------------------------------------------- pad bed
# Cmaj7 → Am7 → Fmaj7 → G6, 8 s per chord, additive mellow tones, slow cross-fades.
CH = [
    [130.81, 164.81, 196.00, 246.94],
    [110.00, 130.81, 164.81, 196.00],
    [87.31, 110.00, 130.81, 164.81],
    [98.00, 123.47, 146.83, 164.81],
]
SEG = 8.0
pad = np.zeros(N)
for ci in range(int(DUR / SEG) + 2):
    chord = CH[ci % len(CH)]
    a, b = ci * SEG - 1.5, (ci + 1) * SEG + 1.5
    i0, i1 = max(0, int(a * SR)), min(N, int(b * SR))
    if i0 >= i1:
        continue
    tt = t_all[i0:i1]
    w = np.clip((tt - a) / 3.0, 0, 1) * np.clip((b - tt) / 3.0, 0, 1)
    w = np.sin(w * np.pi / 2) ** 2
    seg = np.zeros(i1 - i0)
    for vi, f in enumerate(chord):
        for det in (-0.12, 0.12):
            ff = f * (1 + det / 100)
            for hmn in range(1, 6):
                seg += np.sin(2 * np.pi * ff * hmn * tt + vi * 1.3 + hmn) / hmn ** 1.8
    seg *= (1 + 0.08 * np.sin(2 * np.pi * 0.11 * tt))
    pad[i0:i1] += seg * w
pad /= np.max(np.abs(pad)) + 1e-9
# fade in / out, and keep the bed a touch lower under the documentation photos + BNPB note
lvl = np.clip(t_all / 2.5, 0, 1) * np.clip((DUR - t_all) / 2.5, 0, 1)
tl = {s['id']: s for s in meta['timeline']}
ctx_scene = next((s for s in meta['timeline'] if s['id'].startswith('02a')), None)
if ctx_scene:
    duck = np.clip((t_all - ctx_scene['start']) / 1.5, 0, 1) * np.clip((ctx_scene['end'] - t_all) / 1.5, 0, 1)
    lvl *= 1 - 0.35 * duck
pad *= lvl * db(-30)
L += pad
R += pad * 0.98

# ---------------------------------------------------------------- cues
NOTES = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0]  # C6 D6 E6 G6 A6
for i, c in enumerate(meta['cues']):
    g = c.get('gain', 1.0)
    pan = float(np.clip(rng.normal(0, 0.25), -0.6, 0.6))
    kind = c['type']
    if kind == 'whoosh':
        add(whoosh(0.75), c['t'] - 0.35, db(-17) * g, pan)
    elif kind == 'swoosh':
        add(whoosh(0.45, 600, 4200, 1.1), c['t'] - 0.2, db(-20) * g, pan)
    elif kind == 'soft':
        add(whoosh(0.6, 300, 1500, 0.8), c['t'] - 0.25, db(-25) * g, pan)
    elif kind == 'pop':
        add(pop(NOTES[i % len(NOTES)] / 2), c['t'], db(-22) * g, pan)
    elif kind == 'tick':
        add(tick(1900 + (i % 3) * 180), c['t'], db(-25) * g, pan)
    elif kind == 'swell':
        add(swell(1.6), c['t'] - 1.4, db(-22) * g, 0)

# ---------------------------------------------------------------- master
TARGET_LUFS = -19.0


def write(path, st):
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])


st = np.stack([L, R], axis=1)
peak = np.max(np.abs(st))
st /= peak
write(out_path, st)  # measure the full mix, then set one static gain (no pumping)
st *= db(TARGET_LUFS - lufs(out_path))
st = np.tanh(st / db(-1.5)) * db(-1.5)  # soft ceiling at -1.5 dBFS
a, b = int(T0 * SR), int(T1 * SR)
st = st[a:b]
write(out_path, st)
rms = 20 * math.log10(np.sqrt(np.mean(st ** 2)) + 1e-12)
print(f'audio → {out_path}  {len(st) / SR:.2f}s  rms {rms:.1f} dBFS  {len(meta["cues"])} cues')
