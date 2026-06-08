#!/usr/bin/env python3
"""Retire le fond blanc des photos de bouteilles -> PNG transparent.
Flood-fill depuis les bords pour ne pas effacer l'eau claire a l'interieur."""
import sys
from collections import deque
from PIL import Image, ImageFilter

def remove_bg(src, dst, thresh=32, feather=1):
    img = Image.open(src).convert("RGB")
    w, h = img.size
    px = img.load()

    # Couleur de reference = moyenne des 4 coins (fond)
    corners = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
    br = sum(c[0] for c in corners) // 4
    bg = sum(c[1] for c in corners) // 4
    bb = sum(c[2] for c in corners) // 4

    alpha = [255] * (w * h)
    visited = bytearray(w * h)
    dq = deque()

    def close(c):
        return abs(c[0]-br) <= thresh and abs(c[1]-bg) <= thresh and abs(c[2]-bb) <= thresh

    # Amorce depuis tous les pixels de bordure proches du fond
    for x in range(w):
        for y in (0, h-1):
            i = y*w + x
            if not visited[i] and close(px[x, y]):
                visited[i] = 1; alpha[i] = 0; dq.append((x, y))
    for y in range(h):
        for x in (0, w-1):
            i = y*w + x
            if not visited[i] and close(px[x, y]):
                visited[i] = 1; alpha[i] = 0; dq.append((x, y))

    while dq:
        x, y = dq.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h:
                i = ny*w + nx
                if not visited[i] and close(px[nx, ny]):
                    visited[i] = 1; alpha[i] = 0; dq.append((nx, ny))

    a = Image.new("L", (w, h))
    a.putdata(alpha)
    if feather:
        a = a.filter(ImageFilter.GaussianBlur(feather))
    out = img.convert("RGBA")
    out.putalpha(a)

    # Recadre sur le contenu visible
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(dst)
    print(f"{dst}  {out.size[0]}x{out.size[1]}")

if __name__ == "__main__":
    for src, dst in [(sys.argv[i], sys.argv[i+1]) for i in range(1, len(sys.argv), 2)]:
        remove_bg(src, dst)
