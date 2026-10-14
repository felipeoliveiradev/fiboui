#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REF = Path("/cursor/stores/bot/landing/reference.png")
OURS = ROOT / "landing-desktop.png"
OUT = ROOT / "landing-vs-reference.png"
ARTIFACTS = Path("/opt/cursor/artifacts/screenshots")


def fit(img: Image.Image, width: int, height: int) -> Image.Image:
    img = img.convert("RGB")
    scale = min(width / img.width, height / img.height)
    size = (max(1, int(img.width * scale)), max(1, int(img.height * scale)))
    resized = img.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height), (244, 243, 239))
    canvas.paste(resized, ((width - size[0]) // 2, (height - size[1]) // 2))
    return canvas


def main() -> None:
    left = Image.open(REF)
    right = Image.open(OURS)
    col_w, col_h = 720, 1100
    gutter = 28
    header = 64
    canvas = Image.new("RGB", (col_w * 2 + gutter * 3, col_h + header + gutter), (255, 255, 255))
    canvas.paste(fit(left, col_w, col_h), (gutter, header))
    canvas.paste(fit(right, col_w, col_h), (gutter * 2 + col_w, header))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    draw.text((gutter, 24), "Reference rhythm", fill=(0, 0, 0), font=font)
    draw.text((gutter * 2 + col_w, 24), "FiboUI landing", fill=(0, 0, 0), font=font)
    canvas.save(OUT, optimize=True)
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    canvas.save(ARTIFACTS / "landing-vs-reference.png", optimize=True)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
