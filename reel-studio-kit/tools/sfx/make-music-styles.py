"""Synthesize original music beds in three styles (no samples, no licences).

Usage: tools/.venv/bin/python tools/sfx/make-music-styles.py <style> [seconds] [out]
  flash    128 bpm EDM-pop: 2-bar build (riser), then four-on-the-floor drop with offbeat bass and stabs
  lofi     84 bpm lo-fi: dusty swung drums, rhodes 7th chords, vinyl crackle
  polaroid 110 bpm bright pop: plucks, claps, shaker, bouncy bass
Writes public/music/<style>-bed.wav by default (44.1 kHz stereo).
"""
import os
import sys

import numpy as np
import soundfile as sf

SR = 44100
STYLE = sys.argv[1] if len(sys.argv) > 1 else "flash"
SECONDS = float(sys.argv[2]) if len(sys.argv) > 2 else 40.0
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), "..", "..", "public", "music", f"{STYLE}-bed.wav")
BPM = {"flash": 128.0, "lofi": 84.0, "polaroid": 110.0}[STYLE]
rng = np.random.default_rng({"flash": 3, "lofi": 5, "polaroid": 9}[STYLE])
beat = 60.0 / BPM
bar = 4 * beat
n = int(SR * SECONDS)
L = np.zeros(n)
R = np.zeros(n)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(SR * d)) / SR


def add(t0, sig, gl, gr=None):
    i = int(t0 * SR)
    if i >= n or i < 0:
        return
    j = min(n, i + len(sig))
    L[i:j] += sig[: j - i] * gl
    R[i:j] += sig[: j - i] * (gl if gr is None else gr)


def noise(d):
    return rng.standard_normal(int(SR * d))


def hp(x):
    return np.diff(np.concatenate([[0], x]))


def lp(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def kick(punch=1.0):
    t = tt(0.45)
    f = 150 * np.exp(-t * 28) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * punch


def snare():
    t = tt(0.3)
    return hp(noise(0.3)) * np.exp(-t * 18) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.5


def clap():
    t = tt(0.25)
    env = np.exp(-t * 28)
    for d in (0.0, 0.012, 0.024):
        env += np.exp(-np.maximum(t - d, 0) * 200) * (t >= d) * 0.6
    return hp(noise(0.25)) * env * 0.6


def hat(open_=False):
    d = 0.25 if open_ else 0.05
    t = tt(d)
    return hp(hp(noise(d))) * np.exp(-t * (12 if open_ else 80))


def saw(freq, d, voices=5, spread=0.012):
    t = tt(d)
    x = np.zeros(len(t))
    for v in range(voices):
        f = freq * (1 + spread * (v - voices // 2) / voices)
        ph = (f * t + rng.random()) % 1.0
        x += 2 * ph - 1
    return x / voices


def sine_chord(ms, d, decay=1.5, trem=0.0):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(2 * np.pi * 2 * midi(m) * t) * np.exp(-t * 3) for m in ms)
    env = np.exp(-t * decay) * (1 - np.exp(-t * 80))
    if trem:
        env = env * (1 + trem * np.sin(2 * np.pi * 4 * t))
    return x * env / len(ms)


def pluck(freq, d=0.4, bright=1.0):
    t = tt(d)
    return (np.sin(2 * np.pi * freq * t) + 0.5 * bright * np.sin(2 * np.pi * 2 * freq * t) + 0.2 * bright * np.sin(2 * np.pi * 3 * freq * t)) * np.exp(-t * 9) * (1 - np.exp(-t * 500))


def bass(freq, d, decay=2.0):
    t = tt(d)
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2 * freq * t)) * np.exp(-t * decay) * (1 - np.exp(-t * 120))


def riser(d):
    t = tt(d)
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1800 * (t / d) ** 2) / SR) * 0.3
    return (hp(noise(d)) * 0.6 + sweep) * (t / d) ** 2


def impact():
    t = tt(1.2)
    return (np.sin(2 * np.pi * np.cumsum(80 * np.exp(-t * 3) + 30) / SR) + lp(noise(1.2), 0.05) * 2) * np.exp(-t * 3.5)


bars = int(SECONDS / bar) + 1

if STYLE == "flash":
    # A minor: Am F C G, 2-bar build then drop
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    roots = [33, 29, 36, 31]
    for b in range(bars):
        t0 = b * bar
        ch = chords[b % 4]
        build = b < 2
        if build:
            for q in range(4):
                add(t0 + q * beat, sine_chord([m + 12 for m in ch], beat, decay=6), 0.12)
            if b == 1:
                for s in range(8):  # snare roll
                    add(t0 + 2 * beat + s * beat / 4, snare(), 0.05 + 0.03 * s)
                add(t0, riser(bar), 0.18)
            continue
        if b == 2:
            add(t0, impact(), 0.5)
        for q in range(4):
            tb = t0 + q * beat
            add(tb, kick(), 0.55)
            add(tb + beat / 2, bass(midi(roots[b % 4] + 12), beat / 2, 6), 0.35)
            add(tb + beat / 2, hat(True), 0.05, 0.07)
            if q in (1, 3):
                add(tb, clap(), 0.22, 0.25)
            for s in range(2):
                add(tb + s * beat / 2, hat(), 0.04, 0.03)
        for s in range(8):  # supersaw stabs on the offbeats
            if s % 2 == 1 or s in (0, 3, 6):
                stab = sum(saw(midi(m + 12), beat / 2 * 0.8) for m in ch) / 3 * np.exp(-tt(beat / 2 * 0.8) * 7)
                add(t0 + s * beat / 2, lp(stab, 0.25), 0.18, 0.16)
        if b % 4 == 3:
            add(t0 + 3 * beat, riser(beat), 0.08)

elif STYLE == "lofi":
    # Fmaj7 Em7 Dm7 Cmaj7, swung hats, dusty
    chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
    roots = [41, 40, 38, 36]
    swing = beat / 2 * 0.16
    for b in range(bars):
        t0 = b * bar
        ch = chords[b % 4]
        add(t0, sine_chord(ch, bar * 1.05, decay=0.7, trem=0.06), 0.22, 0.2)
        add(t0, bass(midi(roots[b % 4]), bar * 0.9, 0.9), 0.3)
        for q in range(4):
            tb = t0 + q * beat
            if q in (0, 2) or (q == 3 and b % 2):
                add(tb + (beat / 2 if q == 3 else 0), lp(kick(0.9), 0.3), 0.45)
            if q in (1, 3):
                add(tb, lp(snare(), 0.35), 0.28)
            for s in range(2):
                add(tb + s * beat / 2 + (swing if s else 0), lp(hat(), 0.5), 0.05 if s else 0.07)
        if b >= 2 and b % 2 == 0:
            for s, idx in enumerate([3, 2, 1, 2]):
                add(t0 + 2 * beat + s * beat / 2 + (swing if s % 2 else 0), pluck(midi(ch[idx] + 12), 0.5, 0.4), 0.05)
    crackle = np.zeros(n)
    pops = rng.integers(0, n, int(SECONDS * 14))
    crackle[pops] = rng.uniform(-1, 1, len(pops))
    crackle = crackle + lp(rng.standard_normal(n), 0.02) * 0.05
    L += crackle * 0.06
    R += crackle * 0.06

else:  # polaroid
    # C G Am F, bright
    chords = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]]
    roots = [36, 43, 45, 41]
    for b in range(bars):
        t0 = b * bar
        ch = chords[b % 4]
        add(t0, sine_chord([m - 12 for m in ch], bar, decay=0.9), 0.14)
        for q in range(4):
            tb = t0 + q * beat
            add(tb, bass(midi(roots[b % 4]), beat * 0.9, 3), 0.3)
            if b >= 1:
                add(tb, kick(0.8), 0.45 if q in (0, 2) else 0.0)
                if q in (1, 3):
                    add(tb, clap(), 0.18, 0.2)
                for s in range(4):
                    add(tb + s * beat / 4, hat() * (1.0 if s % 2 else 0.6), 0.03, 0.045)
        pattern = [0, 1, 2, 1, 0, 2, 1, 2]
        for s, idx in enumerate(pattern):
            add(t0 + s * beat / 2, pluck(midi(ch[idx] + 12), 0.45), 0.08 * (1.2 if s % 2 else 0.8), 0.08 * (0.8 if s % 2 else 1.2))
        if b % 2 == 1:  # little bell answer
            for s, m in enumerate([ch[2] + 24, ch[1] + 24]):
                add(t0 + 3 * beat + s * beat / 2, pluck(midi(m), 0.6, 0.3), 0.04)

fi, fo = int(SR * 0.05), int(SR * 2.5)
for buf in (L, R):
    buf[:fi] *= np.linspace(0, 1, fi)
    buf[-fo:] *= np.linspace(1, 0, fo)
peak = max(np.abs(L).max(), np.abs(R).max())
stereo = (np.stack([L, R], axis=1) / peak * 0.85).astype(np.float32)
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
sf.write(OUT, stereo, SR, subtype="PCM_16")
print("wrote", os.path.relpath(OUT), f"{STYLE}: {SECONDS:.0f}s at {BPM:.0f} bpm, bar = {bar:.3f}s")
