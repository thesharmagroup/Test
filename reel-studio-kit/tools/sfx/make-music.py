"""Synthesize an original background music bed (no samples, no licences).

Usage: tools/.venv/bin/python tools/sfx/make-music.py [seconds] [bpm]
Writes public/music/explainer-bed.wav (44.1 kHz stereo): a calm, slightly
serious "news explainer" loop: soft electric-piano chords (Am-F-C-G), a gentle
kick, hats and a plucked arpeggio. Duck it under the voice in the reel.
"""
import os
import sys

import numpy as np
import soundfile as sf

SR = 44100
SECONDS = float(sys.argv[1]) if len(sys.argv) > 1 else 64.0
BPM = float(sys.argv[2]) if len(sys.argv) > 2 else 96.0
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "music", "explainer-bed.wav")
rng = np.random.default_rng(11)

beat = 60.0 / BPM
n = int(SR * SECONDS)
L = np.zeros(n)
R = np.zeros(n)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def epiano(freq, dur):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 1.6) * (1 - np.exp(-t * 60))
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 4) + 0.12 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 6)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return tone * env * trem


def pluck(freq, dur=0.6):
    t = np.arange(int(SR * dur)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * 2 * freq * t)) * np.exp(-t * 7) * (1 - np.exp(-t * 300))


def kick():
    t = np.arange(int(SR * 0.35)) / SR
    f = 110 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    t = np.arange(int(SR * 0.05)) / SR
    x = rng.standard_normal(len(t))
    x = np.diff(np.concatenate([[0], x]))  # crude high-pass
    return x * np.exp(-t * 90)


def bass(freq, dur):
    t = np.arange(int(SR * dur)) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.2) * (1 - np.exp(-t * 80))


# Am - F - C - G, one chord per bar (4 beats)
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
roots = [45, 41, 36, 43]
bar = 4 * beat
bars = int(SECONDS / bar) + 1
for b in range(bars):
    t0 = b * bar
    ch = chords[b % 4]
    for k, m in enumerate(ch):
        sig = epiano(midi(m), bar * 1.1)
        pan = (k / 3) - 0.5
        add(L, t0, sig, 0.10 * (1 - pan * 0.6))
        add(R, t0, sig, 0.10 * (1 + pan * 0.6))
    add(L, t0, bass(midi(roots[b % 4]), bar), 0.22)
    add(R, t0, bass(midi(roots[b % 4]), bar), 0.22)
    intro = b < 2  # first two bars: chords only
    for q in range(4):
        tb = t0 + q * beat
        if not intro and q in (0, 2):
            add(L, tb, kick(), 0.30)
            add(R, tb, kick(), 0.30)
        if not intro:
            for e in (0, 0.5):
                h = hat()
                add(L, tb + e * beat, h, 0.05 if e else 0.07)
                add(R, tb + e * beat, h, 0.07 if e else 0.05)
    # plucked arpeggio from bar 4 on, eighth notes up the chord an octave higher
    if b >= 4:
        for s in range(8):
            m = ch[s % 4] + 12
            p = pluck(midi(m))
            side = 0.7 if s % 2 else 1.3
            add(L, t0 + s * beat / 2, p, 0.045 * side)
            add(R, t0 + s * beat / 2, p, 0.045 * (2 - side))

# gentle fade in/out, normalise
fade_in, fade_out = int(SR * 0.8), int(SR * 2.5)
for buf in (L, R):
    buf[:fade_in] *= np.linspace(0, 1, fade_in)
    buf[-fade_out:] *= np.linspace(1, 0, fade_out)
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
stereo = (np.stack([L, R], axis=1) / peak * 0.7).astype(np.float32)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
sf.write(OUT, stereo, SR, subtype="PCM_16")
print("wrote", os.path.relpath(OUT), f"{SECONDS:.0f}s at {BPM:.0f} bpm")
