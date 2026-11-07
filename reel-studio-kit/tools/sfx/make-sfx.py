"""Synthesize the kit's sound effects (no samples, no licences needed).

Usage: tools/.venv/bin/python tools/sfx/make-sfx.py   (or: npm run sfx)
Writes 44.1 kHz mono WAVs to public/sfx/.
"""
import os

import numpy as np
import soundfile as sf

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "sfx")
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def norm(x, peak=0.6):
    m = np.max(np.abs(x)) or 1.0
    return (x / m * peak).astype(np.float32)


def fade(x, ms_in=1.0, ms_out=8.0):
    n_in, n_out = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    y = x.copy()
    if n_in:
        y[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        y[-n_out:] *= np.linspace(1, 0, n_out)
    return y


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be a per-sample array (Hz)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def click():
    tt = t(0.05)
    body = np.sin(2 * np.pi * 2300 * tt) * np.exp(-tt * 160)
    snap = highpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 600)
    return norm(fade(body * 0.7 + snap * 0.5), 0.7)


def whoosh():
    dur = 0.5
    tt = t(dur)
    noise = rng.standard_normal(len(tt))
    sweep = 300 + 3200 * np.sin(np.pi * tt / dur) ** 1.5
    x = lowpass(noise, sweep)
    x = highpass(x, 150)
    env = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2 * np.exp(-tt * 1.5)
    return norm(fade(x * env, 2, 40), 0.6)


def pop():
    tt = t(0.12)
    f = 720 * np.exp(-tt * 9) + 260
    phase = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(phase) * np.exp(-tt * 38)
    return norm(fade(x, 0.5, 10), 0.6)


def stamp():
    tt = t(0.28)
    thump = np.sin(2 * np.pi * (95 * np.exp(-tt * 6) + 45) * tt) * np.exp(-tt * 18)
    slap = lowpass(rng.standard_normal(len(tt)), 2200) * np.exp(-tt * 70)
    return norm(fade(thump + slap * 0.9, 0.5, 30), 0.75)


def key_tick(strength=1.0):
    tt = t(0.035)
    snap = highpass(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 420)
    tone = np.sin(2 * np.pi * rng.uniform(1700, 2600) * tt) * np.exp(-tt * 260)
    return (snap * 0.8 + tone * 0.35) * strength


def typing_loop(sec=4.0):
    """Keyboard clatter: one tick every 50-80 ms with varied strength."""
    out = np.zeros(int(SR * sec))
    pos = 0
    while pos < len(out) - SR // 20:
        k = key_tick(rng.uniform(0.55, 1.0))
        out[pos : pos + len(k)] += k
        pos += int(SR * rng.uniform(0.05, 0.08))
    return norm(out, 0.55)


def counter_loop(sec=2.0):
    """Fast mechanical ticks for number count-ups (one per frame at 30 fps)."""
    out = np.zeros(int(SR * sec))
    step = SR // 30
    tt = t(0.02)
    for i, pos in enumerate(range(0, len(out) - len(tt), step)):
        f = 3200 + (i % 3) * 180
        out[pos : pos + len(tt)] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 380)
    return norm(out, 0.5)


def ding():
    tt = t(0.9)
    x = (np.sin(2 * np.pi * 880 * tt) + 0.6 * np.sin(2 * np.pi * 1320 * tt) + 0.25 * np.sin(2 * np.pi * 1760 * tt)) * np.exp(-tt * 5)
    return norm(fade(x, 1, 60), 0.55)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("click", click), ("whoosh", whoosh), ("pop", pop), ("stamp", stamp), ("typing", typing_loop), ("counter", counter_loop), ("ding", ding)]:
        path = os.path.join(OUT, f"{name}.wav")
        sf.write(path, fn(), SR, subtype="PCM_16")
        print("wrote", os.path.relpath(path))


if __name__ == "__main__":
    main()
