#!/usr/bin/env python3
"""Retire le fond blanc des photos de bouteilles -> PNG transparent.
Flood-fill C (PIL) depuis les coins : ne touche pas l'interieur de la bouteille."""
import sys
from PIL import Image, ImageDraw, ImageFilter

SENT = (255, 0, 255)  # couleur sentinelle (improbable dans la photo)

def remove_bg(src, dst, thresh=55, feather=1.2):
    img = Image.open(src).convert("RGB")
    w, h = img.size
    seeds = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1),
             (w//2, 0), (w//2, h-1), (0, h//2), (w-1, h//2)]
    for s in seeds:
        ImageDraw.floodfill(img, s, SENT, thresh=thresh)

    px = img.load()
    alpha = Image.new("L", (w, h), 255)
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == SENT:
                ap[x, y] = 0

    alpha = alpha.filter(ImageFilter.GaussianBlur(feather))
    orig = Image.open(src).convert("RGBA")
    orig.putalpha(alpha)
    bbox = orig.getbbox()
    if bbox:
        orig = orig.crop(bbox)
    orig.save(dst)
    print(f"{dst}  {orig.size[0]}x{orig.size[1]}")

if __name__ == "__main__":
    args = sys.argv[1:]
    for i in range(0, len(args), 2):
        remove_bg(args[i], args[i+1])
