#!/usr/bin/env python3
"""Sound design for the Shape 60 s teaser: calm and visionary. Warm major pads, soft bell pings, gentle air. No impacts, no sub thumps, no sudden risers.

Invoked by render.mjs as:  shape_audio.py <project> <out.wav> [start end]
Reads out/meta.json (scene windows + sound cues emitted by the scenes) and synthesizes everything — no samples, no licences.

Palette of sounds
  bed      : very quiet root drone (D) + slow open major pad chords (D, Bm, G, A) + a sparse bell line every ~2.6 s; no pulse, no beat
  accents  : hit (= soft bloom, a warm swelling tone), riser (gentle air swell), swell, whoosh (soft air), sweep, radar
  tech     : ping (D major pentatonic, echoed), scatter (dots lighting up), tick (soft), count, rise
  wellness : breath — inhale/exhale air under the logo
"""
import json, math, os, re, subprocess, sys, wave
import numpy as np
from scipy import signal

SR = 48000
P = sys.argv[1]
OUTW = sys.argv[2]
meta = json.load(open(os.path.join(P, 'out', 'meta.json')))
T0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
T1 = float(sys.argv[4]) if len(sys.argv) > 4 else meta['duration']
DUR = meta['duration']
N = int(round(DUR * SR))
rng = np.random.default_rng(2027)
db = lambda x: 10 ** (x / 20)
t_all = np.arange(N) / SR

dry = np.zeros((N, 2))
wet = np.zeros((N, 2))      # reverb send bus


def place(sig, at, gain=1.0, pan=0.0, send=0.0):
    i = int(round(at * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    gl, gr = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2), math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
    dry[i:i + n, 0] += sig[:n] * gain * gl
    dry[i:i + n, 1] += sig[:n] * gain * gr
    if send:
        wet[i:i + n, 0] += sig[:n] * gain * gl * send
        wet[i:i + n, 1] += sig[:n] * gain * gr * send


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1, order=2):
    b, a = signal.butter(order, [f0 / (SR / 2), min(f1, SR / 2 - 100) / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def tt(n): return np.arange(n) / SR
def ad(n, a, r, shape=2.0):
    t = tt(n); return (np.sin(np.clip(t / max(a, 1e-4), 0, 1) * np.pi / 2) ** shape) * (np.sin(np.clip((n / SR - t) / max(r, 1e-4), 0, 1) * np.pi / 2) ** shape)
def sweep_noise(n, f0, f1, q_bw=0.45):
    """band-pass noise whose centre glides exponentially f0→f1 (block-wise)."""
    out = np.zeros(n); blocks = 24; bl = n // blocks + 1
    x = noise(n)
    for b in range(blocks):
        a, e = b * bl, min(n, (b + 1) * bl)
        if a >= e: break
        f = f0 * (f1 / f0) ** ((b + 0.5) / blocks)
        out[a:e] = bp(x, f * (1 - q_bw), f * (1 + q_bw))[a:e]
    return out
def glide(n, f0, f1):
    f = f0 * (f1 / f0) ** (tt(n) / (n / SR)); return np.sin(2 * np.pi * np.cumsum(f) / SR)

# ------------------------------------------------------------------ one-shot sounds
def s_hit():
    """soft bloom: a warm low tone that swells in and fades out — no impact, no click, no noise burst."""
    n = int(3.2 * SR); t = tt(n)
    env = np.minimum(1, t / 0.18) ** 2 * np.exp(-t / 0.9)
    x = (np.sin(2 * np.pi * 73.4 * t) * 0.8 + np.sin(2 * np.pi * 110.0 * t) * 0.5 + np.sin(2 * np.pi * 146.8 * t) * 0.35 + np.sin(2 * np.pi * 220.0 * t) * 0.2) * env
    bell = np.sin(2 * np.pi * 587.3 * t) * np.exp(-t / 0.9) * np.minimum(1, t / 0.02) * 0.18
    return lp(x, 900, 1) + bell
def s_riser(dur):
    """gentle rising air + soft tone; swells then dissolves, never peaks."""
    n = int(dur * SR); t = tt(n); k = t / dur
    a = sweep_noise(n, 300, 3200, 0.5) * np.sin(np.pi * k) ** 2 * 0.35
    b = glide(n, 146.8, 293.7) * 0.25 * np.sin(np.pi * k) ** 2
    return a + b
def s_ping(f, n_s=1.6):
    n = int(n_s * SR); t = tt(n)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.3 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.15) + 0.12 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t / 0.08)
    x = lp(x, 4200, 1) * np.minimum(1, t / 0.012)
    # tape-style echo
    d = int(0.27 * SR); e = np.zeros(n + 3 * d); e[:n] += x
    for k in (1, 2, 3): e[k * d:k * d + n] += x * (0.42 ** k)
    return e
def s_tick(f=2400):
    n = int(0.09 * SR); t = tt(n)
    return lp(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03), 3500, 1) * np.minimum(1, t / 0.004)
def s_whoosh(length=0.8, f0=250, f1=3200):
    n = int(length * SR)
    return lp(sweep_noise(n, f0, min(f1, 1800), 0.6), 2200, 1) * ad(n, length * 0.55, length * 0.45) * 0.7
def s_breath():
    n = int(2.4 * SR); t = tt(n)
    a = sweep_noise(n // 2, 500, 2600, 0.55) * ad(n // 2, 0.7, 0.5, 1.5)          # inhale: brighter and rising
    b = sweep_noise(n - n // 2, 2200, 450, 0.55) * ad(n - n // 2, 0.35, 0.95, 1.5) * 0.8   # exhale: falling
    return np.concatenate([a, b]) * 0.55
def s_heart():
    n = int(0.9 * SR); t = tt(n)
    def thump(f, amp, off):
        m = np.zeros(n); i = int(off * SR); L = n - i
        tl = tt(L); ff = f * (1 + 0.8 * np.exp(-tl / 0.03))
        m[i:] = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tl / 0.09) * amp
        m[i:] += lp(noise(L), 160) * np.exp(-tl / 0.05) * amp * 0.9
        return m
    return thump(52, 1.0, 0.0) + thump(44, 0.7, 0.24)
def s_clink():
    n = int(1.4 * SR); t = tt(n); base = 1650
    x = sum(a * np.sin(2 * np.pi * base * r * t + ph) * np.exp(-t / d) for r, a, d, ph in
            [(1, 1, 0.5, 0), (2.76, 0.7, 0.32, 1), (5.40, 0.5, 0.2, 2), (8.93, 0.35, 0.12, 3), (13.3, 0.2, 0.07, 4)])
    x += hp(noise(n), 5000) * np.exp(-t / 0.012) * 0.6
    x += np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.08) * 0.5                      # weight thud
    return x * 0.5
def s_sweep():
    n = int(1.1 * SR); t = tt(n)
    x = glide(n, 1800, 400) * ad(n, 0.15, 0.9, 1.4) * 0.35 + lp(sweep_noise(n, 2400, 500, 0.4), 2400, 1) * ad(n, 0.2, 0.8) * 0.2
    return x
def s_radar():
    n = int(2.8 * SR); t = tt(n)
    blip = np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.3) * np.minimum(1, t / 0.01) * 0.6
    sw = sweep_noise(n, 400, 1800, 0.35) * np.exp(-((t - 1.0) / 0.55) ** 2) * 0.45
    d = int(0.38 * SR); e = np.zeros(n + 2 * d); e[:n] += blip
    for k in (1, 2): e[k * d:k * d + n] += blip * (0.4 ** k)
    out = np.zeros(len(e)); out[:n] += sw; out += e
    return out
def s_rise():
    n = int(0.9 * SR); t = tt(n)
    return glide(n, 220, 440) * ad(n, 0.25, 0.6, 1.5) * 0.45 + lp(sweep_noise(n, 600, 2400, 0.5), 2500, 1) * ad(n, 0.3, 0.5) * 0.2
def s_swell(dur):
    n = int(dur * SR); t = tt(n)
    chord = sum(np.sin(2 * np.pi * f * t) for f in (146.8, 174.6, 220.0, 261.6, 329.6))
    return (lp(chord, 1400) * ad(n, dur * 0.8, dur * 0.2, 2.0) * 0.14 + sweep_noise(n, 800, 6000, 0.6) * ad(n, dur * 0.85, dur * 0.15) * 0.22)

PENT = [587.3, 659.3, 740.0, 880.0, 987.8, 1174.7, 1480.0]   # D major pentatonic: open, hopeful
# ------------------------------------------------------------------ cues
for i, c in enumerate(meta['cues']):
    g = float(c.get('gain', 1.0)); ty = c['type']; at = c['t']
    pan = float(np.clip(rng.normal(0, 0.28), -0.7, 0.7))
    if ty == 'hit':
        place(s_hit(), at, 0.5 * g, 0, 0.45)
    elif ty == 'riser':
        place(s_riser(c.get('dur', 2.5)), at, 0.45 * g, 0, 0.35)
    elif ty == 'ping':
        place(s_ping(PENT[i % len(PENT)]), at, 0.15 * g, pan, 0.6)
    elif ty == 'tick':
        place(s_tick(1500 + (i % 4) * 150), at, 0.09 * g, pan, 0.15)
    elif ty in ('whoosh', 'air'):
        place(s_whoosh(0.95), at - 0.45, 0.25 * g, pan * 0.5, 0.35)
    elif ty == 'breath':
        place(s_breath(), at, 0.28 * g, 0, 0.45)
    elif ty == 'heart':
        place(s_hit(), at, 0.3 * g, 0, 0.3)
    elif ty == 'clink':
        place(s_ping(PENT[3], 1.2), at, 0.12 * g, pan, 0.5)
    elif ty == 'sweep':
        place(s_sweep(), at, 0.28 * g, 0, 0.5)
    elif ty == 'radar':
        place(s_radar(), at, 0.22 * g, 0.2, 0.5)
    elif ty == 'rise':
        place(s_rise(), at, 0.4 * g, 0, 0.35)
    elif ty == 'swell':
        place(s_swell(c.get('dur', 2.0)), at, 0.8 * g, 0, 0.5)
    elif ty == 'count':
        d = c.get('dur', 1.2); k = int(d * 22)
        for q in range(k):
            f = 1500 + 1300 * q / max(1, k); place(s_tick(f * 0.6), at + q * d / k, 0.07 * g * (0.5 + 0.5 * q / k), pan, 0.1)
    elif ty == 'scan':
        d = c.get('dur', 3.0); k = int(d * 16)
        for q in range(k):
            place(s_tick(1800 + 20 * q), at + q * d / k, 0.10 * g, math.sin(q * 0.4) * 0.6, 0.15)
    elif ty == 'scatter':
        d = c.get('dur', 3.0)
        for q in range(int(d * 8)):
            tq = at + rng.random() * d
            place(s_ping(PENT[int(rng.integers(2, 7))], 0.9), tq, 0.05 * g * (0.4 + 0.6 * (q / (d * 8))), float(rng.uniform(-0.8, 0.8)), 0.55)

# ------------------------------------------------------------------ bed
scenes = {b['id']: b for b in meta['beats']}
def lvl(sid, drone=0.0, pad=0.0, pulse=0.0, start=0.0, end=None, ramp=1.0):
    b = scenes[sid]; a = b['t'] + start; e = b['t'] + (end if end is not None else b['dur'])
    return a, e, drone, pad, pulse, ramp
LEV = [
    lvl('s1', drone=0.6, pad=0.7),
    lvl('s2', drone=0.5, pad=0.95),
    lvl('s3', drone=0.5, pad=1.0),
    lvl('s4', drone=0.5, pad=1.0),
    lvl('s5', drone=0.6, pad=1.0, end=12.8),
    lvl('s5', drone=0.4, pad=0.5, start=12.8),
]
def curve(idx):
    c = np.zeros(N)
    for L in LEV:
        a, e, *v, ramp = L; val = L[2 + idx]
        ia, ie = int(a * SR), min(N, int(e * SR))
        if ie <= ia: continue
        seg = np.ones(ie - ia) * val
        r = int(min(ramp, (e - a) / 2) * SR)
        if r > 0:
            seg[:r] *= np.linspace(0, 1, r) ** 1.5; seg[-r:] *= np.linspace(1, 0, r) ** 1.5
        c[ia:ie] = np.maximum(c[ia:ie], seg)
    return lp(c, 3.0, 1)
dr_c, pd_c, pu_c = curve(0), curve(1), curve(2)

drone = (np.sin(2 * np.pi * 36.71 * t_all) * 0.9 + np.sin(2 * np.pi * 73.42 * t_all + 0.6) * 0.45 +
         lp(signal.sawtooth(2 * np.pi * 73.42 * (1 + 0.0015 * np.sin(t_all * 0.4)) * t_all), 260) * 0.35)
drone *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * t_all)
CH = [[146.8, 185.0, 220.0, 277.2, 329.6], [123.5, 185.0, 246.9, 293.7, 370.0], [98.0, 196.0, 246.9, 293.7, 370.0], [110.0, 220.0, 277.2, 329.6, 440.0]]   # D · Bm · G · A (open, major, hopeful)
SEG = 10.0; pad = np.zeros(N)
for ci in range(int(DUR / SEG) + 2):
    a, b = ci * SEG - 2.0, (ci + 1) * SEG + 2.0
    i0, i1 = max(0, int(a * SR)), min(N, int(b * SR))
    if i0 >= i1: continue
    x = t_all[i0:i1]; w = np.sin(np.clip((x - a) / 3.5, 0, 1) * np.clip((b - x) / 3.5, 0, 1) * np.pi / 2) ** 2
    seg = np.zeros(i1 - i0)
    for vi, f in enumerate(CH[ci % 4]):
        for det in (-0.15, 0.15):
            seg += np.sin(2 * np.pi * f * (1 + det / 100) * x + vi) + 0.25 * np.sin(2 * np.pi * f * 2 * (1 + det / 100) * x + vi * 2)
    pad[i0:i1] += seg * w
pad = lp(pad, 2400, 2) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t_all + 1.0))
pad /= np.max(np.abs(pad)) + 1e-9; drone /= np.max(np.abs(drone)) + 1e-9

bed = drone * dr_c * db(-22) + pad * pd_c * db(-15)
dry[:, 0] += bed; dry[:, 1] += bed * 0.97
wet[:, 0] += pad * pd_c * db(-22); wet[:, 1] += pad * pd_c * db(-22) * 0.95

# slow, sparse bell line over the pad (one soft note every ~2.6 s): a calm, forward-looking feel instead of a beat
MEL = [0, 2, 3, 5, 3, 2, 4, 3]
for q, tb in enumerate(np.arange(1.2, DUR - 3.0, 2.6)):
    place(s_ping(PENT[MEL[q % len(MEL)]], 2.2), float(tb), 0.07, float(((q % 3) - 1) * 0.35), 0.65)

# ------------------------------------------------------------------ reverb (synthetic hall)
def make_ir(sec=2.6):
    n = int(sec * SR); t = tt(n); ir = []
    for ch in range(2):
        x = noise(n) * np.exp(-t / 0.55) * (1 - np.exp(-t / 0.02)); x = lp(x, 7000, 1); ir.append(x)
    return np.stack(ir, 1) * 0.07
IR = make_ir()
L = N + len(IR)
nfft = 1 << (L - 1).bit_length()
mixwet = np.zeros((N, 2))
for ch in range(2):
    A = np.fft.rfft(wet[:, ch], nfft); B = np.fft.rfft(IR[:, ch], nfft)
    mixwet[:, ch] = np.fft.irfft(A * B, nfft)[:N]
mix = dry + mixwet * 1.0

# ------------------------------------------------------------------ optional voice-over: assets/vo.wav (or .mp3/.m4a), aligned to t=0 of the film
vo_path = next((os.path.join(P, 'assets', f) for f in ('vo.wav', 'vo.mp3', 'vo.m4a') if os.path.exists(os.path.join(P, 'assets', f))), None)
vo = None
if vo_path:
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    v = np.frombuffer(r.stdout, dtype='<f4').astype(np.float64); vo = np.zeros(N); vo[:min(N, len(v))] = v[:N]
    env = np.sqrt(np.convolve(vo ** 2, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same'))
    duck = 1 - 0.55 * np.clip(env / (np.percentile(env[env > 1e-4], 85) + 1e-9) if (env > 1e-4).any() else env, 0, 1)   # bed −7 dB under speech
    duck = lp(duck, 6.0, 1)
    mix = mix * duck[:, None]
    vo = hp(vo, 70, 2); vo = vo / (np.max(np.abs(vo)) + 1e-9) * 0.9
    print('voice-over mixed from', os.path.basename(vo_path))

# ------------------------------------------------------------------ master
def write(path, st):
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
target = float(json.load(open(os.path.join(P, 'project.json'))).get('audio', {}).get('target_lufs', -16))
mix = hp(mix.T, 28, 2).T                                     # keep inaudible rumble out
mix /= np.max(np.abs(mix)) + 1e-9
if vo is not None: mix = mix * 0.62 + np.stack([vo, vo], 1) * 0.55
fade = np.clip((DUR - t_all) / 1.6, 0, 1) ** 1.5 * np.clip(t_all / 0.15, 0, 1)
mix *= fade[:, None]
write(OUTW, mix)
mix *= db(target - lufs(OUTW))
mix = np.tanh(mix / db(-1.5)) * db(-1.5)
mix = mix[int(T0 * SR):int(T1 * SR)]
write(OUTW, mix)
print(f'audio → {OUTW}  {len(mix) / SR:.1f}s  target {target} LUFS  cues {len(meta["cues"])}')
