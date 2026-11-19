#!/usr/bin/env python3
"""
Score and sound design for the demo films, synthesised from scratch (numpy only,
no samples, nothing licensed).

    python3 capture/sound/sound.py            # every demo with a score
    python3 capture/sound/sound.py xn-crm     # just these

For each film it reads capture/.work/<slug>-score.json (written by the capture
run: duration, cut times, and every click / keystroke / scroll / zoom with its
time in the finished edit) and builds:

  * a music bed — warm pad + soft bell arpeggio; the chord changes on each cut,
    so the harmony moves with the edit rather than on an unrelated grid;
  * sound effects locked to the events — a soft tick per click, quiet key
    taps while typing, an air swell under scrolls, a rising / falling breath
    under camera push-ins and pull-outs, and a light swish on every cut;
  * a final chord that rings out under the last shot.

The mix is loudness-normalised (≈ −16 LUFS, true peak ≤ −2 dBTP) and muxed as
AAC into public/media/<slug>/demo.mp4. The silent original is kept in
capture/.work/<slug>-silent.mp4, so re-running is idempotent. Card loops
(preview.mp4) stay silent by design: they autoplay.
"""
import json, os, shutil, subprocess, sys, wave, zlib
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.path.join(ROOT, 'capture', '.work')
MEDIA = os.path.join(ROOT, 'public', 'media')
MANIFEST = os.path.join(ROOT, 'src', 'content', 'media.generated.json')
SR = 48000

# COMA is a rendered motion piece, not a capture, so its events come from its storyboard timeline.
COMA_SCORE = {
    'duration': 28.0,
    'cuts': [3.6, 8.0, 13.4, 19.2, 23.4],
    'events': (
        [{'t': 0.25, 'type': 'type', 'n': 14, 'dur': 1.1}]
        + [{'t': t, 'type': 'land'} for t in (4.6, 5.4, 6.2, 8.83, 10.03, 11.23)]
        + [{'t': 13.6, 'type': 'scroll', 'dur': 1.6}, {'t': 15.0, 'type': 'zoomIn', 'dur': 2.6},
           {'t': 18.15, 'type': 'click'}, {'t': 18.2, 'type': 'zoomOut', 'dur': 0.9}]
        + [{'t': 21.0 + i * 0.3, 'type': 'tick'} for i in range(7)]
    ),
    'end': 24.0,
}

# One key per film, so the set doesn't sound like one loop (MIDI roots, minor-ish or major-ish).
KEYS = {'xn-crm': 50, 'jony-kids-english': 55, 'coma': 45, 'flashy': 52, 'level-up': 48,
        'brain-train': 57, 'jony-math': 53}
PROG = [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 5]]  # Imaj7 – vi7 – IVmaj7 – V(sus)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, fc, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    return np.fft.irfft(X, len(x))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (f / hi) ** 8)) * (1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4))
    return np.fft.irfft(X, len(x))


def reverb(x, seconds=2.2, wet=0.28, seed=1):
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lowpass(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    size = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - wet) * x + wet * y


def env_adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, a, False), np.linspace(1, s, d, False), np.full(sus, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def add(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    j = min(len(buf), i + len(sig))
    buf[max(i, 0):j] += sig[max(0, -i): j - i]


# ---------------------------------------------------------------- instruments
def pad_chord(notes, dur, rng):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for m in notes:
        for det in (-0.07, 0.0, 0.06):
            f = hz(m + det)
            ph = rng.uniform(0, 2 * np.pi)
            # soft saw from a few partials: warm, not buzzy
            y += sum(np.sin(2 * np.pi * f * k * t + ph * k) / k ** 1.6 for k in range(1, 6))
    y = lowpass(y, 1400)
    return y * env_adsr(n, 0.9, 0.6, 0.85, min(1.6, dur * 0.5)) / (len(notes) * 9)


def bell(m, dur=1.4, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 6)
         + 0.12 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 9))
    return y * np.exp(-t * 3.2) * np.minimum(1, t / 0.004) * vel


def soft_kick(vel=1.0):
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * vel


def tick(freq=2300, vel=1.0, rng=None):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    noise = (rng or np.random.default_rng()).standard_normal(n)
    y = 0.6 * np.sin(2 * np.pi * freq * t) * np.exp(-t * 160) + 0.4 * bandpass(noise, 1800, 7000) * np.exp(-t * 260)
    return y * vel


def air(dur, rise=True, vel=1.0, rng=None, lo=250, hi=2200):
    n = int(dur * SR)
    rng = rng or np.random.default_rng()
    y = bandpass(rng.standard_normal(n), lo, hi)
    x = np.linspace(0, 1, n)
    shape = np.sin(np.pi * x) ** 1.5
    shape *= (0.55 + 0.45 * x) if rise else (1.0 - 0.45 * x)
    y *= shape
    t = np.arange(n) / SR
    f0, f1 = (330, 520) if rise else (520, 300)
    glide = np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR) * shape * 0.25
    return (y / (np.abs(y).max() + 1e-9) * 0.75 + glide) * vel


# ---------------------------------------------------------------- composition
def compose(slug, score):
    rng = np.random.default_rng(zlib.crc32(slug.encode()))
    dur = score['duration']
    tail = 1.2
    n = int((dur + tail) * SR)
    music = np.zeros(n)
    sfx = np.zeros(n)
    root = KEYS.get(slug, 50)
    bpm = 96
    beat = 60 / bpm

    # harmony follows the edit: a new chord at every cut (merging cuts closer than 1.6 s)
    bounds = [0.0]
    for c in score['cuts']:
        if c - bounds[-1] >= 1.6 and dur - c >= 1.2:
            bounds.append(c)
    end_at = score.get('end', max(bounds[-1], dur - 3.2))
    sections = list(zip(bounds, bounds[1:] + [dur + tail]))
    for i, (a, b) in enumerate(sections):
        chord = [root + 12 + x for x in PROG[i % len(PROG)]]
        add(music, pad_chord(chord + [root + PROG[i % len(PROG)][0]], b - a + 0.6, rng) * 0.9, a)
        # bell arpeggio on eighths, gently humanised
        t = a + 0.05
        k = 0
        while t < min(b, end_at) - 0.05:
            note = chord[[0, 2, 1, 3, 2, 1][k % 6]] + 12
            add(music, bell(note, 1.2, 0.16 * (0.85 + 0.3 * rng.random())), t + rng.normal(0, 0.004))
            t += beat / 2
            k += 1
        # a felt pulse on the first beat of each section and every second bar
        for bt in np.arange(a, min(b, end_at), beat * 2):
            add(music, soft_kick(0.22 if bt == a else 0.12), bt)

    # resolution: the tonic rings out under the last shot
    final = [root + 12 + x for x in PROG[0]] + [root + 24 + 7]
    add(music, pad_chord(final, dur + tail - end_at, rng) * 1.1, end_at)
    for j, m in enumerate(final):
        add(music, bell(m + 12, 2.8, 0.22), end_at + j * 0.07)

    # sound effects, locked to what happens on screen
    for e in score['events']:
        ty, t = e['type'], e['t']
        if ty == 'click':
            add(sfx, tick(2100, 0.55, rng), t)
            add(sfx, tick(1250, 0.25, rng), t + 0.09)  # release
        elif ty == 'type':
            for c in range(int(e.get('n', 8))):
                add(sfx, tick(rng.uniform(2600, 3600), rng.uniform(0.10, 0.18), rng), t + c * e['dur'] / max(1, e['n']) + rng.normal(0, 0.006))
        elif ty == 'scroll':
            add(sfx, air(max(0.6, e.get('dur', 1.2)), True, 0.08, rng, 180, 1500), t)
        elif ty in ('zoomIn', 'zoomOut'):
            add(sfx, air(max(0.5, e.get('dur', 0.9)), ty == 'zoomIn', 0.11, rng), t)
        elif ty == 'land':
            add(sfx, soft_kick(0.35), t)
            add(sfx, tick(1600, 0.3, rng), t)
        elif ty == 'tick':
            add(sfx, tick(2900, 0.25, rng), t)
    for c in score['cuts']:
        add(sfx, air(0.42, False, 0.07, rng, 600, 4000), c - 0.2)

    music = reverb(music, 2.6, 0.32)
    sfx = reverb(sfx, 0.9, 0.12, seed=2)
    # duck the music a little under effects so actions read clearly
    env = np.convolve(np.abs(sfx), np.ones(int(0.08 * SR)) / int(0.08 * SR), 'same')
    duck = 1 - 0.35 * np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    L = int(dur * SR)
    fade = np.minimum(1, np.arange(L) / (0.35 * SR)) * np.clip((L - np.arange(L)) / (1.2 * SR), 0, 1)
    m = (music * 0.8 * duck)[:L] * fade
    x = (sfx * 0.9)[:L] * fade
    d = int(0.006 * SR)  # a touch of width: the music is a few ms later on the right
    st = np.stack([m + x, np.concatenate([np.zeros(d), m[:-d]]) + x], 1)
    st /= np.abs(st).max() + 1e-9
    return (st * 0.7).astype(np.float32)


def write_wav(path, st):
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode:
        raise SystemExit(p.stderr[-1500:])
    return p


def main():
    slugs = sys.argv[1:] or [s for s in KEYS if os.path.exists(os.path.join(MEDIA, s, 'demo.mp4'))]
    manifest = json.load(open(MANIFEST))
    for slug in slugs:
        if slug == 'coma':
            score = COMA_SCORE
        else:
            path = os.path.join(WORK, f'{slug}-score.json')
            if not os.path.exists(path):
                print(f'  {slug}: no score, skipped'); continue
            score = json.load(open(path))
        demo = os.path.join(MEDIA, slug, 'demo.mp4')
        silent = os.path.join(WORK, f'{slug}-silent.mp4')
        has_audio = 'audio' in run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', demo]).stdout
        if not has_audio or not os.path.exists(silent):
            shutil.copyfile(demo, silent)
        vdur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', silent]).stdout)
        score = {**score, 'duration': vdur}
        wav = os.path.join(WORK, f'{slug}-mix.wav')
        write_wav(wav, compose(slug, score))
        tmp = demo + '.tmp.mp4'
        run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-i', wav,
             '-filter:a', 'loudnorm=I=-16:TP=-2:LRA=9,alimiter=limit=0.78:level=disabled', '-ar', '48000',
             '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
             '-shortest', '-movflags', '+faststart', tmp])
        os.replace(tmp, demo)
        if slug in manifest and manifest[slug].get('demo'):
            manifest[slug]['demo']['audio'] = True
        print(f'  {slug}: {vdur:.1f}s, {len(score["events"])} effects, {len(score["cuts"])} cuts')
    json.dump(manifest, open(MANIFEST, 'w'), indent=2)
    open(MANIFEST, 'a').write('\n')


if __name__ == '__main__':
    main()
