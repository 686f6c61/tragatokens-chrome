#!/usr/bin/env python3
"""Genera los iconos PNG de la extensión (16, 48 y 128 px).

Dibuja la tragaperras QuemaTokens: carcasa roja, ventana crema con la
mascota de Claude (ráfaga naranja) y palanca con bola roja.
Uso: uv run --with pillow python tools/make_icons.py
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROJO = (179, 32, 44, 255)
ROJO_OSCURO = (126, 16, 25, 255)
DORADO = (232, 185, 74, 255)
CREMA = (247, 239, 224, 255)
GRIS = (160, 160, 160, 255)
NARANJA = (218, 119, 86, 255)

BASE = 128


def dibujar(tamano: int) -> Image.Image:
    img = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Carcasa
    d.rounded_rectangle([8, 14, 104, 118], radius=18, fill=ROJO, outline=DORADO, width=6)
    # Ventana
    d.rounded_rectangle([22, 34, 90, 78], radius=8, fill=CREMA, outline=ROJO_OSCURO, width=4)
    # Mascota de Claude en la ventana: ráfaga naranja de 12 rayos
    cx, cy, radio = 56, 56, 17
    for rayo in range(12):
        angulo = math.radians(rayo * 30)
        x = cx + radio * math.cos(angulo)
        y = cy + radio * math.sin(angulo)
        d.line([cx, cy, x, y], fill=NARANJA, width=5)
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=NARANJA)
    # Ranura inferior
    d.rounded_rectangle([38, 90, 74, 102], radius=5, fill=ROJO_OSCURO)
    # Palanca
    d.line([110, 84, 110, 36], fill=GRIS, width=7)
    d.ellipse([101, 22, 121, 42], fill=ROJO_OSCURO, outline=DORADO, width=3)
    d.rounded_rectangle([103, 82, 118, 96], radius=4, fill=DORADO)

    if tamano != BASE:
        img = img.resize((tamano, tamano), Image.LANCZOS)
    return img


def main() -> None:
    destino = Path(__file__).resolve().parent.parent / "icons"
    destino.mkdir(exist_ok=True)
    for tamano in (16, 48, 128):
        dibujar(tamano).save(destino / f"icon{tamano}.png")
        print(f"[OK] icon{tamano}.png")


if __name__ == "__main__":
    main()
