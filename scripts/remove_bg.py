#!/usr/bin/env python3
"""Detoure les bouteilles en GARDANT l'interieur plein (eau blanche).
Principe : on detecte les bords de la bouteille (tout ce qui differe du
fond blanc), puis on remplit la silhouette ligne par ligne. L'interieur
conserve donc ses couleurs d'origine (eau claire/blanche)."""
import sys
from PIL import Image, ImageChops, ImageFilter

def cutout(src, dst, thresh=24, feather=1.2):
    img = Image.open(src).convert("RGB")
    w, h = img.size

    # Couleur de fond = moyenne des 4 coins
    px = img.load()
    cs = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
    bg = tuple(sum(c[i] for c in cs) // 4 for i in range(3))

    # Difference par rapport au fond -> canal max
    diff = ImageChops.difference(img, Image.new("RGB", (w, h), bg))
    r, g, b = diff.split()
    dmax = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = dmax.point(lambda v: 255 if v > thresh else 0)
    mp = mask.load()

    # Remplissage de la silhouette ligne par ligne (1 segment par rangee)
    alpha = Image.new("L", (w, h), 0)
    ap = alpha.load()
    for y in range(h):
        left = -1
        for x in range(w):
            if mp[x, y]:
                left = x
                break
        if left == -1:
            continue
        right = left
        for x in range(w-1, left-1, -1):
            if mp[x, y]:
                right = x
                break
        for x in range(left, right+1):
            ap[x, y] = 255

    # Lissage des bords
    alpha = alpha.filter(ImageFilter.GaussianBlur(feather))
    out = img.convert("RGBA")
    out.putalpha(alpha)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(dst)
    print(f"{dst}  {out.size[0]}x{out.size[1]}  (fond={bg})")

if __name__ == "__main__":
    a = sys.argv[1:]
    for i in range(0, len(a), 2):
        cutout(a[i], a[i+1])
