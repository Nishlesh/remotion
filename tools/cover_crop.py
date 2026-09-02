from __future__ import annotations

import sys
from pathlib import Path

TARGET_W = 1080
TARGET_H = 1920
# Hero sits in y≈80–1100; bias crop toward the upper third.
CENTER_Y = 0.38


def cover_crop(src_w: int, src_h: int, dest_w: int, dest_h: int, center_y: float) -> tuple[int, int, int, int]:
    scale = max(dest_w / src_w, dest_h / src_h)
    crop_w = dest_w / scale
    crop_h = dest_h / scale
    src_x = max(0.0, (src_w - crop_w) / 2.0)
    src_y = max(0.0, min(src_h - crop_h, (src_h - crop_h) * center_y))
    return int(round(src_x)), int(round(src_y)), int(round(crop_w)), int(round(crop_h))


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: cover_crop.py INPUT OUTPUT [WIDTH HEIGHT]", file=sys.stderr)
        return 2
    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])
    dest_w = int(sys.argv[3]) if len(sys.argv) > 3 else TARGET_W
    dest_h = int(sys.argv[4]) if len(sys.argv) > 4 else TARGET_H
    if dest_w == 1088:
        print("NEVER 1088×1920", file=sys.stderr)
        return 2
    try:
        from PIL import Image, ImageOps
    except ImportError:
        print("Pillow is not installed. pip install pillow", file=sys.stderr)
        return 3

    im = Image.open(inp).convert("RGB")
    fitted = ImageOps.fit(
        im,
        (dest_w, dest_h),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, CENTER_Y),
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    fitted.save(out, quality=92)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
