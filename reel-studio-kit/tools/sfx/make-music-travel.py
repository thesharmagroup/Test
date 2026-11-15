"""Synthesize an original, upbeat "travel vlog" music bed (no samples, no licences).

Usage: tools/.venv/bin/python tools/sfx/make-music-travel.py [seconds] [bpm] [out]
Default: 48 s at 100 bpm -> public/music/travel-bed.wav (44.1 kHz stereo).
D - A - Bm - G, warm pads, plucked arpeggio, soft kick, claps and shakers.
Bars 1-2 pads only, bar 3 adds the beat, bar 5 the full groove (a short riser leads in).
"""
import os
import sys

import numpy as np
import soundfile as sf

SR = 44100
SECONDS = float(sys.argv[1]) if len(sys.argv) > 1 else 48.0
BPM = float(sys.argv[2]) if len(sys.argv) > 2 else 100.0
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), "..", "..", "public", "music", "travel-bed.wav")
rng = np.random.default_rng(21)

beat = 60.0 / BPM
bar = 4 * beat
n = int(SR * SECONDS)
L = np.zeros(n)
R = np.zeros(n)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(SR * dur)) / SR


def add(start, sig, gl, gr=None):
    i = int(start * SR)
    if i >= n:
        return
    j = min(n, i + len(sig))
    L[i:j] += sig[: j - i] * gl
    R[i:j] += sig[: j - i] * (gl if gr is None else gr)


def pad(freq, dur):
    t = tt(dur)
    det = sum(np.sin(2 * np.pi * freq * f * t + p) for f, p in [(1, 0), (1.004, 1.3), (0.996, 2.1), (2.0, 0.7)])
    env = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6)
    lp = 0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t)  # slow swell
    return det * env * lp / 4


def pluck(freq, dur=0.5):
    t = tt(dur)
    return (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * 2 * freq * t) + 0.15 * np.sin(2 * np.pi * 3 * freq * t)) * np.exp(-t * 8) * (1 - np.exp(-t * 400))


def kick():
    t = tt(0.4)
    f = 120 * np.exp(-t * 20) + 42
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)


def clap():
    t = tt(0.25)
    x = rng.standard_normal(len(t))
    x = np.diff(np.concatenate([[0], x]))
    env = np.exp(-t * 30) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return x * env


def shaker():
    t = tt(0.08)
    x = np.diff(np.concatenate([[0], rng.standard_normal(len(t))]))
    return x * np.exp(-t * 60) * np.minimum(1, t / 0.01)


def bass(freq, dur):
    t = tt(dur)
    return (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * 2 * freq * t)) * np.exp(-t * 0.8) * (1 - np.exp(-t * 60))


def riser(dur):
    t = tt(dur)
    x = rng.standard_normal(len(t))
    x = np.diff(np.concatenate([[0], x]))
    return x * (t / dur) ** 2 * 0.5


# D - A - Bm - G
chords = [[62, 66, 69, 74], [61, 64, 69, 73], [62, 66, 71, 74], [62, 67, 71, 74]]
roots = [38, 45, 47, 43]
bars = int(SECONDS / bar) + 1
for b in range(bars):
    t0 = b * bar
    ch = chords[b % 4]
    for k, m in enumerate(ch):
        pan = k / 3 - 0.5
        add(t0, pad(midi(m), bar + 0.4), 0.07 * (1 - 0.5 * pan), 0.07 * (1 + 0.5 * pan))
    if b >= 2:
        add(t0, bass(midi(roots[b % 4]), bar), 0.30)
        for q in range(4):
            tb = t0 + q * beat
            add(tb, kick(), 0.42 if q in (0, 2) or b >= 4 else 0.0)
            if q in (1, 3):
                add(tb, clap(), 0.10, 0.12)
            for e in range(4 if b >= 4 else 2):
                add(tb + e * beat / (4 if b >= 4 else 2), shaker(), 0.035, 0.05)
    if b >= 4:
        # plucked arpeggio in sixteenths-ish pattern, an octave up
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for s, idx in enumerate(pattern):
            p = pluck(midi(ch[idx] + 12))
            side = 1.3 if s % 2 else 0.7
            add(t0 + s * beat / 2, p, 0.05 * side, 0.05 * (2 - side))
    if b == 3:
        add(t0 + bar - 1.6, riser(1.6), 0.06)

# fades and normalise
fi, fo = int(SR * 1.0), int(SR * 3.0)
for buf in (L, R):
    buf[:fi] *= np.linspace(0, 1, fi)
    buf[-fo:] *= np.linspace(1, 0, fo)
peak = max(np.abs(L).max(), np.abs(R).max())
stereo = (np.stack([L, R], axis=1) / peak * 0.8).astype(np.float32)
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
sf.write(OUT, stereo, SR, subtype="PCM_16")
print("wrote", os.path.relpath(OUT), f"{SECONDS:.0f}s at {BPM:.0f} bpm, bar = {bar:.2f}s")
