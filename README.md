# QuemaTokens

Extensión de Chrome con una tragaperras clásica de palanca. Abres el popup y
juegas: tiras de la palanca (clic o arrastre hacia abajo), giran los tres
carretes y se paga según la línea central.

## Instalación

1. Abre `chrome://extensions` en Chrome.
2. Activa el "Modo de desarrollador" (esquina superior derecha).
3. Pulsa "Cargar descomprimida" y selecciona esta carpeta.
4. Abre el popup desde el icono de la barra de herramientas.

## Juego

- **Tokens**: se empieza con 100. Cada tirada cuesta la apuesta seleccionada.
- **Apuesta**: 5, 10, 25 o 50 con los botones `-` y `+`. A mayor apuesta,
  premio proporcionalmente mayor.
- **Recarga**: el botón `+100` añade 100 tokens en cualquier momento.
- **Récord**: se guarda el premio más grande conseguido.
- **Sonido**: el botón del altavoz silencia o reactiva los efectos.
- Todo persiste entre aperturas (`chrome.storage.local`).

## Tabla de pagos (apuesta 5; escala con la apuesta)

| Combinación      | Premio |
|------------------|--------|
| 3 × Claude       | 250    |
| 3 × Codex        | 150    |
| 3 × BAR          | 100    |
| 3 × campana      | 60     |
| 3 × estrella     | 40     |
| 3 × limón        | 25     |
| 3 × cereza       | 15     |
| 2 × cereza       | 5      |
| 1 × cereza       | 2      |

## Desarrollo

- Lógica pura en `logic.js`, sin DOM. Tests: `npm test` (node:test, sin
  dependencias).
- Probar sin instalar: servir la carpeta por HTTP y abrir `popup.html`
  (usa `localStorage` como reserva de `chrome.storage`).
- Regenerar iconos: `uv run --with pillow python tools/make_icons.py`.
