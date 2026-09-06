#!/usr/bin/env python3
"""Overlay the locked FocusStack session UI onto the desk photo, 1080x1920."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H = 1080, 1920
DESK = Path("/opt/cursor/artifacts/assets/whatsapp-cta-desk.png")
OUT = Path("episodes/whatsapp-2009/stills/still-13.jpg")
SOURCE = Path("channel-brand/focusstack-944pm.png")
# Detected white screen on the 1024x1536 generate
SCREEN = (216, 248, 584, 876)


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def render_ui(pw: int, ph: int) -> Image.Image:
    ui = Image.new("RGB", (pw, ph), "#f7f7f8")
    d = ImageDraw.Draw(ui)
    # notch
    d.rounded_rectangle((int(pw * 0.32), 10, int(pw * 0.68), 28), radius=10, fill="#111")
    d.text((18, 34), "10:22", font=font(max(14, pw // 16), True), fill="#111")
    d.text((int(pw * 0.72), 36), "77%", font=font(max(12, pw // 18)), fill="#111")
    d.text((16, 70), "X", font=font(max(16, pw // 14), True), fill="#222")
    d.text((int(pw * 0.58), 74), "Timeline", font=font(max(13, pw // 16)), fill="#222")

    cx = pw // 2
    pill_w = int(pw * 0.42)
    d.rounded_rectangle((cx - pill_w // 2, 118, cx + pill_w // 2, 146), radius=16, fill="#d8f5d8")
    d.text((cx - int(pw * 0.16), 122), "\u25cf Unlimited", font=font(max(12, pw // 18), True), fill="#1a7f2a")

    fb = font(max(28, pw // 7), True)
    tw = d.textlength("Focus", font=fb)
    d.text((cx - tw / 2, 168), "Focus", font=fb, fill="#111")

    tb = font(max(48, pw // 4), True)
    tw = d.textlength("38:03", font=tb)
    d.text((cx - tw / 2, 230), "38:03", font=tb, fill="#111")

    eb = font(max(12, pw // 16), True)
    tw = d.textlength("ELAPSED", font=eb)
    d.text((cx - tw / 2, 320), "ELAPSED", font=eb, fill="#888")

    sb = font(max(13, pw // 15))
    tw = d.textlength("Started 9:44 PM", font=sb)
    d.text((cx - tw / 2, 350), "Started 9:44 PM", font=sb, fill="#9a9a9a")

    rows = [("ChatGPT", "9m  \u00b7  25%"), ("www.canva.com", "7m  \u00b7  20%"), ("Grok Bot", "4m  \u00b7  12%")]
    y = 400
    for name, meta in rows:
        d.text((28, y), name, font=font(max(13, pw // 16)), fill="#222")
        mw = d.textlength(meta, font=font(max(12, pw // 17)))
        d.text((pw - 28 - mw, y), meta, font=font(max(12, pw // 17)), fill="#888")
        y += 36

    d.rounded_rectangle((24, ph - 78, pw - 24, ph - 28), radius=16, fill="#e11d2e")
    stb = font(max(16, pw // 14), True)
    tw = d.textlength("Stop session", font=stb)
    d.text((cx - tw / 2, ph - 66), "Stop session", font=stb, fill="#fff")
    return ui


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Path("channel-brand").mkdir(parents=True, exist_ok=True)

    if SOURCE.exists() and SOURCE.stat().st_size > 20000:
        src = Image.open(SOURCE).convert("RGB")
    elif DESK.exists():
        desk = Image.open(DESK).convert("RGB")
        x0, y0, x1, y1 = SCREEN
        ui = render_ui(x1 - x0, y1 - y0)
        # slight screen glare
        ui = Image.blend(ui, Image.new("RGB", ui.size, (255, 255, 255)), 0.04)
        desk.paste(ui, (x0, y0))
        src = desk
        src.save(SOURCE, quality=94)
    else:
        raise SystemExit("No CTA source photo")

    fitted = ImageOps.fit(src, (W, H), method=Image.Resampling.LANCZOS, centering=(0.42, 0.40))
    fitted.save(OUT, quality=94)
    print(f"wrote {OUT} {fitted.size}")


if __name__ == "__main__":
    main()
