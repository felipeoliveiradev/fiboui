#!/usr/bin/env python3
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pillow', '-q'])
    from PIL import Image

root = Path(__file__).resolve().parents[1]
original = root / 'original.png'
replica = root / 'monetron-initial.png'
out = root / 'compare.png'
artifact = Path('/opt/cursor/artifacts/screenshots/monetron-compare.png')

left = Image.open(original).convert('RGB')
right = Image.open(replica).convert('RGB')
h = max(left.height, right.height)
w = left.width + right.width
canvas = Image.new('RGB', (w, h), (0, 0, 0))
canvas.paste(left, (0, 0))
canvas.paste(right, (left.width, 0))
canvas.save(out)
artifact.parent.mkdir(parents=True, exist_ok=True)
canvas.save(artifact)
print(f'wrote {out} ({canvas.size[0]}x{canvas.size[1]})')
