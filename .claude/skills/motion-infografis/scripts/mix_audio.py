#!/usr/bin/env python3
"""Soundtrack for a motion-infografis project: original voice + synthesized UI sound effects
(+ optional ambient pad, + optional music bed ducked under the voice), normalised to a loudness target.

  python3 mix_audio.py <project> <out.wav> [start end]      (render.mjs calls this automatically)

project.json → "audio": {"voice": true, "sfx": 1.0, "pad": "auto", "music": null, "music_gain_db": -20, "target_lufs": -14}
Sound effects are generated here (no samples), so they are licence-free.
"""
import json, math, os, re, subprocess, sys
import numpy as np

SR = 48000
P = sys.argv[1]
OUTW = sys.argv[2]
proj = json.load(open(os.path.join(P, 'project.json')))
meta = json.load(open(os.path.join(P, 'out', 'meta.json')))
T0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
T1 = float(sys.argv[4]) if len(sys.argv) > 4 else meta['duration']
cfg = {'voice': True, 'sfx': 1.0, 'pad': 'auto', 'music': None, 'music_gain_db': -20, 'target_lufs': -14, **(proj.get('audio') or {})}
DUR = meta['duration']
N = int(round(DUR * SR))
rng = np.random.default_rng(11)
db = lambda x: 10 ** (x / 20)


def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True)
    a = np.frombuffer(r.stdout, dtype='<f4').reshape(-1, 2).astype(np.float64)
    out = np.zeros((N, 2))
    n = min(N, len(a))
    out[:n] = a[:n]
    return out


def svf_bandpass(x, f0, f1, q):
    n = len(x)
    g = np.tan(np.pi * np.exp(np.linspace(math.log(f0), math.log(f1), n)) / SR)
    k = 1 / q
    y = np.zeros(n)
    ic1 = ic2 = 0.0
    for i in range(n):
        a1 = 1 / (1 + g[i] * (g[i] + k))
        v1 = a1 * ic1 + g[i] * a1 * (x[i] - ic2)
        v2 = ic2 + g[i] * v1
        ic1, ic2 = 2 * v1 - ic1, 2 * v2 - ic2
        y[i] = v1
    return y


def env(n, att, rel, shape=2.0):
    t = np.arange(n) / SR
    return (np.sin(np.clip(t / max(att, 1e-4), 0, 1) * np.pi / 2) ** shape) * (np.sin(np.clip((n / SR - t) / max(rel, 1e-4), 0, 1) * np.pi / 2) ** shape)


def whoosh(length=0.7, f0=250, f1=2600, q=0.9):
    n = int(length * SR)
    x = rng.standard_normal(n)
    return (svf_bandpass(x, f0, f1, q) + 0.5 * svf_bandpass(x, f1 * 0.5, f0 * 2, q)) * env(n, length * 0.55, length * 0.45) * 0.55


def pop(freq):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(freq * (1 + 0.35 * np.exp(-t / 0.012))) / SR
    return (np.sin(ph) * np.exp(-t / 0.07) + 0.25 * np.sin(2 * ph) * np.exp(-t / 0.03) + rng.standard_normal(n) * np.exp(-t / 0.002) * 0.15) * env(n, 0.002, 0.05, 1)


def tick(freq=2100):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.018) + 0.4 * np.sin(3 * np.pi * freq * t) * np.exp(-t / 0.01)) * env(n, 0.001, 0.03, 1)


mix = np.zeros((N, 2))


def add(sig, at, gain, pan=0.0):
    i = int(round(at * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    mix[i:i + n, 0] += sig[:n] * gain * math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
    mix[i:i + n, 1] += sig[:n] * gain * math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)


# voice
voice_path = os.path.join(P, 'footage', 'audio.wav')
has_voice = bool(cfg['voice']) and os.path.exists(voice_path)
voice = decode(voice_path) if has_voice else np.zeros((N, 2))

# sfx (quieter under a voice so they punctuate instead of compete)
sfx_gain = float(cfg['sfx']) * (db(-9) if has_voice else 1.0)
NOTES = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0]
for i, c in enumerate(meta['cues']):
    g = c.get('gain', 1.0) * sfx_gain
    pan = float(np.clip(rng.normal(0, 0.25), -0.6, 0.6))
    k = c['type']
    if k == 'whoosh':
        add(whoosh(0.75), c['t'] - 0.35, db(-17) * g, pan)
    elif k == 'swoosh':
        add(whoosh(0.45, 600, 4200, 1.1), c['t'] - 0.2, db(-20) * g, pan)
    elif k == 'soft':
        add(whoosh(0.6, 300, 1500, 0.8), c['t'] - 0.25, db(-25) * g, pan)
    elif k == 'pop':
        add(pop(NOTES[i % len(NOTES)] / 2), c['t'], db(-22) * g, pan)
    elif k == 'tick':
        add(tick(1900 + (i % 3) * 180), c['t'], db(-25) * g, pan)

# ambient pad: default on only for videos without a voice track
t_all = np.arange(N) / SR
pad_on = cfg['pad'] is True or (cfg['pad'] == 'auto' and not has_voice)
if pad_on:
    CH = [[130.81, 164.81, 196.00, 246.94], [110.00, 130.81, 164.81, 196.00], [87.31, 110.00, 130.81, 164.81], [98.00, 123.47, 146.83, 164.81]]
    pad = np.zeros(N)
    for ci in range(int(DUR / 8) + 2):
        a, b = ci * 8 - 1.5, (ci + 1) * 8 + 1.5
        i0, i1 = max(0, int(a * SR)), min(N, int(b * SR))
        if i0 >= i1:
            continue
        tt = t_all[i0:i1]
        w = np.sin(np.clip((tt - a) / 3, 0, 1) * np.clip((b - tt) / 3, 0, 1) * np.pi / 2) ** 2
        seg = sum(np.sin(2 * np.pi * f * (1 + d / 100) * hm * tt + vi * 1.3 + hm) / hm ** 1.8
                  for vi, f in enumerate(CH[ci % 4]) for d in (-0.12, 0.12) for hm in range(1, 6))
        pad[i0:i1] += seg * w
    pad /= np.max(np.abs(pad)) + 1e-9
    pad *= np.clip(t_all / 2.5, 0, 1) * np.clip((DUR - t_all) / 2.5, 0, 1) * db(-30)
    mix[:, 0] += pad
    mix[:, 1] += pad * 0.98

# music bed, ducked under the voice
if cfg.get('music'):
    mus = decode(os.path.join(P, cfg['music']))
    if has_voice:
        e = np.sqrt(np.convolve((voice ** 2).mean(axis=1), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode='same'))
        duck = 1 - 0.75 * np.clip(e / (np.percentile(e, 90) + 1e-9), 0, 1)
        mus *= duck[:, None]
    mix += mus * db(cfg['music_gain_db'])

mix += voice


def write(path, st):
    import wave
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])


peak = np.max(np.abs(mix)) or 1.0
mix /= peak
write(OUTW, mix)
mix *= db(float(cfg['target_lufs']) - lufs(OUTW))
mix = np.tanh(mix / db(-1.5)) * db(-1.5)
mix = mix[int(T0 * SR):int(T1 * SR)]
write(OUTW, mix)
print(f"audio → {OUTW}  voice:{'yes' if has_voice else 'no'} pad:{'yes' if pad_on else 'no'} music:{'yes' if cfg.get('music') else 'no'} cues:{len(meta['cues'])} target {cfg['target_lufs']} LUFS")
