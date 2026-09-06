#!/usr/bin/env python3
"""Fail if a frame is night-vision green (mean G dominates R and B by 40+)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageStat


def measure(path: Path) -> dict[str, float | bool]:
    im = Image.open(path).convert("RGB")
    r, g, b = ImageStat.Stat(im).mean
    return {
        "path": str(path),
        "r": r,
        "g": g,
        "b": b,
        "g_minus_r": g - r,
        "g_minus_b": g - b,
        "night_vision": g > r + 40 and g > b + 40,
    }


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: check_frame_not_green.py <image>")
    stats = measure(Path(sys.argv[1]))
    print(json.dumps(stats, indent=2))
    if stats["night_vision"]:
        raise SystemExit(
            f"night-vision green: G={stats['g']:.1f} R={stats['r']:.1f} B={stats['b']:.1f}"
        )


if __name__ == "__main__":
    main()
