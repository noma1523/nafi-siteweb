#!/usr/bin/env python3
"""Detoure les bouteilles, garde l'interieur plein ET ajoute une teinte
d'eau bleutee realiste pour que la bouteille paraisse remplie d'eau."""
import sys
from PIL import Image, ImageChops, ImageFilter

WATER_TOP = (208, 234, 248)   # bleu d'eau clair (haut)
WATER_BOT = (168, 212, 238)   # bleu d'eau un peu plus dense (bas)
BLEND = 0.45                   # intensite de la teinte d'eau

def water_gradient(w, h):
    grad = Image.new("RGB", (w, h))
    p = grad.load()
    for y in range(h):
        t = y / max(1, h - 1)
        col = tuple(int(WATER_TOP[i] + (WATER_BOT[i] - WATER_TOP[i]) * t) for i in range(3))
        for x in range(w):
            p[x, y] = col
    return grad

def cutout(src, dst, thresh=24, feather=1.2):
    img = Image.open(src).convert("RGB")
    w, h = img.size

    px = img.load()
    cs = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
    bg = tuple(sum(c[i] for c in cs) // 4 for i in range(3))

    # --- Silhouette pleine (remplissage ligne par ligne) ---
    diff = ImageChops.difference(img, Image.new("RGB", (w, h), bg))
    r, g, b = diff.split()
    dmax = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = dmax.point(lambda v: 255 if v > thresh else 0)
    mp = mask.load()

    alpha = Image.new("L", (w, h), 0)
    ap = alpha.load()
    for y in range(h):
        left = -1
        for x in range(w):
            if mp[x, y]:
                left = x; break
        if left == -1:
            continue
        right = left
        for x in range(w-1, left-1, -1):
            if mp[x, y]:
                right = x; break
        for x in range(left, right+1):
            ap[x, y] = 255

    # --- Zone "eau" = pixels clairs et peu colores a l'interieur ---
    gray = img.convert("L")
    light = gray.point(lambda v: 255 if v > 205 else 0)
    rr, gg, bb = img.split()
    mx = ImageChops.lighter(ImageChops.lighter(rr, gg), bb)
    mn = ImageChops.darker(ImageChops.darker(rr, gg), bb)
    lowsat = ImageChops.difference(mx, mn).point(lambda v: 255 if v < 30 else 0)
    water_mask = ImageChops.multiply(ImageChops.multiply(light, lowsat), alpha)

    # --- Teinte d'eau ---
    tinted = Image.blend(img, water_gradient(w, h), BLEND)
    filled = Image.composite(tinted, img, water_mask)

    out = filled.convert("RGBA")
    out.putalpha(alpha.filter(ImageFilter.GaussianBlur(feather)))
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(dst)
    print(f"{dst}  {out.size[0]}x{out.size[1]}")

if __name__ == "__main__":
    a = sys.argv[1:]
    for i in range(0, len(a), 2):
        cutout(a[i], a[i+1])
