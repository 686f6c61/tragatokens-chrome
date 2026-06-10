#!/usr/bin/env python3
"""Genera los iconos PNG de la extensión (16, 48 y 128 px).

Redimensiona icons/source.png (ilustración de tragaperras aportada por el
usuario) a los tres tamaños que pide el manifest.
Uso: uv run --with pillow python tools/make_icons.py
"""

from pathlib import Path

from PIL import Image


def main() -> None:
    carpeta = Path(__file__).resolve().parent.parent / "icons"
    origen = Image.open(carpeta / "source.png")
    for tamano in (16, 48, 128):
        origen.resize((tamano, tamano), Image.LANCZOS).save(carpeta / f"icon{tamano}.png")
        print(f"[OK] icon{tamano}.png")


if __name__ == "__main__":
    main()
