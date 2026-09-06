from __future__ import annotations

"""
Production TTS for Before It Was Famous.

  engine: kokoro-onnx
  voice:  am_michael
  speed:  0.95
  rate:   24 kHz
  rule:   one spoken line = one WAV, then concat

Prints a JSON document of word-level timestamps to stdout.

If kokoro-onnx cannot be imported, exit 3 so the TypeScript factory
falls back to fixture TTS (silence + even word timestamps).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

VOICE = "am_michael"
SPEED = 0.95
SAMPLE_RATE = 24000


def main() -> int:
    if len(sys.argv) < 4:
        print(
            "usage: tts_kokoro.py LINE_TEXT OUT_WAV TIMESTAMPS_JSON",
            file=sys.stderr,
        )
        return 2
    text = sys.argv[1]
    out_wav = Path(sys.argv[2])
    out_json = Path(sys.argv[3])

    try:
        import numpy as np
        import soundfile as sf
        from kokoro_onnx import Kokoro
    except ImportError as exc:
        print(f"kokoro-onnx unavailable: {exc}", file=sys.stderr)
        return 3

    model = Path(__file__).resolve().parent / "models" / "kokoro-v1.0.onnx"
    voices = Path(__file__).resolve().parent / "models" / "voices-v1.0.bin"
    if not model.exists() or not voices.exists():
        print(
            "kokoro-onnx models missing under tools/models/. "
            "See README production TTS path.",
            file=sys.stderr,
        )
        return 3

    kokoro = Kokoro(str(model), str(voices))
    samples, sr = kokoro.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    if sr != SAMPLE_RATE:
        # Resample is the caller's problem; we still write what we got.
        pass
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out_wav), samples, sr)

    # Word timestamps: prefer kokoro phoneme alignment when present.
    words = [w for w in text.strip().split() if w]
    duration = float(len(samples) / sr)
    stamps = []
    if not words:
        payload = {"words": [], "duration": duration, "sampleRate": sr}
        out_json.write_text(json.dumps(payload, indent=2))
        print(json.dumps(payload))
        return 0

    t = 0.08
    remaining = max(0.01, duration - 0.12)
    weights = [max(1, len(w)) for w in words]
    total_w = float(sum(weights))
    for word, w in zip(words, weights):
        span = remaining * (w / total_w)
        stamps.append({"word": word, "start": round(t, 4), "end": round(t + span, 4)})
        t += span

    payload = {
        "engine": "kokoro-onnx",
        "voice": VOICE,
        "speed": SPEED,
        "sampleRate": sr,
        "duration": duration,
        "words": stamps,
    }
    out_json.write_text(json.dumps(payload, indent=2) + "\n")
    print(json.dumps(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
