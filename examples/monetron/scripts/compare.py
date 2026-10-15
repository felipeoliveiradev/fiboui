#!/usr/bin/env python3
"""Side-by-side compare + per-region mean Δ + zoomed button/list crops."""
from pathlib import Path
import json

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pillow', '-q'])
    from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
original = Image.open(root / 'original.png').convert('RGB')
replica = Image.open(root / 'monetron-initial.png').convert('RGB')
# original.png is a 1029-wide crop of an older compare; drop the 5px sliver
if original.width != replica.width:
    original = original.crop((0, 0, replica.width, original.height))
if replica.size != original.size:
    replica = replica.resize(original.size, Image.Resampling.LANCZOS)

W, H = original.size
# 1024×768 stage: 43px side pad, 71px top, 290×625 phones, 34px gap
PAD_X, PAD_Y = 43, 71
PW, PH, GAP = 290, 625, 34
DASH = PAD_X + PW + GAP
INV = PAD_X + 2 * (PW + GAP)

REGIONS = {
    'splash-logo':     (PAD_X + 50, PAD_Y + 130, 190, 180),
    'splash-title':    (PAD_X + 16, PAD_Y + 330, 258, 80),
    'splash-btn':      (118, 602, 140, 48),
    'dash-header':     (DASH, PAD_Y, PW, 84),
    'dash-stats':      (DASH, PAD_Y + 84, PW, 78),
    'dash-tracker':    (DASH, PAD_Y + 162, PW, 220),
    'dash-tools':      (DASH, 515, PW, 140),
    'dash-nav':        (DASH, PAD_Y + PH - 52, PW, 52),
    'inv-header':      (INV, PAD_Y, PW, 106),
    'inv-ring':        (INV + 48, PAD_Y + 126, 194, 200),
    'inv-legend':      (INV + 8, PAD_Y + 400, 274, 36),
    'inv-btns':        (700, 482, 276, 50),
    'inv-portfolio':   (INV, PAD_Y + 530, PW, 165),
}

ZOOM = {
    'zoom-splash-btn': 'splash-btn',
    'zoom-inv-btns': 'inv-btns',
    'zoom-dash-tools': 'dash-tools',
    'zoom-dash-header': 'dash-header',
}


def crop(im, box):
    x, y, w, h = box
    return im.crop((x, y, x + w, y + h))


def mean_delta(a, b):
    if a.size != b.size:
        b = b.resize(a.size, Image.Resampling.LANCZOS)
    pa, pb = a.load(), b.load()
    w, h = a.size
    acc = 0
    n = w * h
    for y in range(h):
        for x in range(w):
            ca, cb = pa[x, y], pb[x, y]
            acc += (abs(ca[0] - cb[0]) + abs(ca[1] - cb[1]) + abs(ca[2] - cb[2])) / 3
    return acc / n if n else 0


def zoom_pair(box, scale=3):
    l, r = crop(original, box), crop(replica, box)
    l = l.resize((l.width * scale, l.height * scale), Image.Resampling.NEAREST)
    r = r.resize((r.width * scale, r.height * scale), Image.Resampling.NEAREST)
    gap = 8
    canvas = Image.new('RGB', (l.width + r.width + gap, max(l.height, r.height)), (0, 0, 0))
    canvas.paste(l, (0, 0))
    canvas.paste(r, (l.width + gap, 0))
    return canvas


def label_pair(img, left_t, right_t):
    out = Image.new('RGB', (img.width, img.height + 22), (0, 0, 0))
    out.paste(img, (0, 22))
    draw = ImageDraw.Draw(out)
    draw.text((8, 4), left_t, fill=(180, 180, 180))
    draw.text((img.width // 2 + 8, 4), right_t, fill=(180, 180, 180))
    return out


# side-by-side
h = max(original.height, replica.height)
compare = Image.new('RGB', (original.width + replica.width, h), (0, 0, 0))
compare.paste(original, (0, 0))
compare.paste(replica, (original.width, 0))
compare.save(root / 'compare.png')

artifact = Path('/opt/cursor/artifacts/screenshots')
artifact.mkdir(parents=True, exist_ok=True)
compare.save(artifact / 'monetron-compare.png')

crops_dir = root / 'crops'
crops_dir.mkdir(exist_ok=True)
art_crops = artifact / 'crops'
art_crops.mkdir(exist_ok=True)

rows = []
for name, box in REGIONS.items():
    a, b = crop(original, box), crop(replica, box)
    delta = mean_delta(a, b)
    rows.append((name, delta, box))
    a.save(crops_dir / f'{name}-original.png')
    b.save(crops_dir / f'{name}-replica.png')
    a.save(art_crops / f'{name}-original.png')
    b.save(art_crops / f'{name}-replica.png')

for zname, src in ZOOM.items():
    pair = label_pair(zoom_pair(REGIONS[src]), 'original', 'replica')
    pair.save(root / f'{zname}.png')
    pair.save(artifact / f'{zname}.png')
    pair.save(crops_dir / f'{zname}.png')

# composite of the four zooms
zooms = [Image.open(root / f'{n}.png') for n in ZOOM]
zw = max(z.width for z in zooms)
zh = sum(z.height for z in zooms) + 12 * (len(zooms) - 1)
sheet = Image.new('RGB', (zw, zh), (0, 0, 0))
y = 0
for z in zooms:
    sheet.paste(z, (0, y))
    y += z.height + 12
sheet.save(root / 'zoom-sheet.png')
sheet.save(artifact / 'zoom-sheet.png')

overall = mean_delta(original, replica)
print(f'overall mean Δ {overall:.2f} / 255')
print(f'{"region":<16} {"Δ":>7}')
for name, delta, _ in rows:
    print(f'{name:<16} {delta:7.2f}')

(root / 'diff.json').write_text(json.dumps({
    'overall': round(overall, 2),
    'regions': {name: round(delta, 2) for name, delta, _ in rows},
}, indent=2))
(artifact / 'diff.json').write_text((root / 'diff.json').read_text())
print(f'wrote {root / "compare.png"} ({compare.size[0]}x{compare.size[1]})')
