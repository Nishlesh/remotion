#!/usr/bin/env python3
"""Bake Chromium-safe FilmTreatment plates from grain.jpg / grunge.jpg.

CSS `filter: invert() brightness() contrast()` on a mix-blend layer is unsafe
in Remotion's headless Chromium: invert can leak onto the composited backdrop.
Sepia inverted reads as night-vision green. These plates apply the locked
grain ops in sRGB and force both textures to luma-only so multiply / color-burn
cannot amplify a channel tint.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "public" / "engine"


def luma_u8(rgb: np.ndarray) -> np.ndarray:
    lin = rgb.astype(np.float32)
    y = 0.2126 * lin[:, :, 0] + 0.7152 * lin[:, :, 1] + 0.0722 * lin[:, :, 2]
    return np.clip(y, 0, 255)


def gray_rgb(y: np.ndarray) -> np.ndarray:
    g = np.clip(y, 0, 255).astype(np.uint8)
    return np.stack([g, g, g], axis=-1)


def bake_grain(src: Path, dest: Path) -> None:
    rgb = np.asarray(Image.open(src).convert("RGB"), dtype=np.float32)
    # CSS filter order: invert(1) brightness(1.35) contrast(1.02)
    inv = 255.0 - rgb
    bright = inv * 1.35
    contrast = (bright - 128.0) * 1.02 + 128.0
    Image.fromarray(gray_rgb(luma_u8(contrast)), mode="RGB").save(dest, optimize=True)


def bake_grunge(src: Path, dest: Path) -> None:
    rgb = np.asarray(Image.open(src).convert("RGB"), dtype=np.float32)
    Image.fromarray(gray_rgb(luma_u8(rgb)), mode="RGB").save(dest, optimize=True)


def main() -> None:
    grain = ENGINE / "grain.jpg"
    grunge = ENGINE / "grunge.jpg"
    if not grain.is_file() or not grunge.is_file():
        raise SystemExit("missing public/engine/grain.jpg or grunge.jpg")
    bake_grain(grain, ENGINE / "grain-plate.png")
    bake_grunge(grunge, ENGINE / "grunge-plate.png")
    print("wrote", ENGINE / "grain-plate.png")
    print("wrote", ENGINE / "grunge-plate.png")


if __name__ == "__main__":
    main()
