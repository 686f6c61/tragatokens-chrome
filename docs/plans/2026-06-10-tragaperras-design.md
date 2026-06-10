# Diseño: extensión de Chrome "QuemaTokens"

## Objetivo

Extensión de Chrome (Manifest V3) que al pulsar su icono abre un popup con una
tragaperras clásica de palanca, llamada QuemaTokens. Sin servidor, sin
dependencias, sin build.

## Alcance

- Popup de la extensión con la máquina completa: 3 carretes, palanca lateral,
  marcador de tokens, récord y mensaje de premio.
- La palanca se acciona con clic o arrastre hacia abajo; al soltarla giran los
  carretes y se detienen de izquierda a derecha.
- Tokens: se empieza con 100. Apuesta seleccionable (5/10/25/50) con premio
  proporcional. Botón de recarga `+100` siempre disponible. Se guarda el
  premio más grande (récord). Todo persiste con `chrome.storage.local`.
- Sonidos sintéticos con WebAudio (tirada, giro, premio) con botón de
  silencio persistente. Sin ficheros de audio.
- Los símbolos de mayor premio son la mascota de Claude (ráfaga naranja) y el
  logo de Codex (flor hexagonal oscura).

## Decisiones

- **Manifest V3 + popup de acción**: es la forma canónica de "abres la
  extensión y aparece el juego".
- **Vanilla JS/HTML/CSS**: el juego es pequeño; un framework no aporta nada.
- **Símbolos como imágenes PNG** en `img/` (logos de modelos de IA aportados
  por el usuario, 128x128 con transparencia): sin emojis ni librerías de iconos.
- **Lógica separada de la vista**: `logic.js` exporta funciones puras
  (generación de tirada, cálculo de premio) testeables con `node:test`, sin
  tocar el DOM. `popup.js` solo orquesta DOM y animaciones.
- **Iconos PNG** (16/48/128) generados con un script Python (PIL) incluido en
  `tools/`.

## Componentes

```
manifest.json        Manifest V3, action.default_popup = popup.html
popup.html           Estructura de la máquina
popup.css            Estética de tragaperras clásica + animaciones
logic.js             Lógica pura: carretes, RNG, tabla de pagos (módulo ES)
popup.js             Interacción: palanca, animación, créditos, sonido
sound.js             Sonidos sintéticos WebAudio
test/logic.test.js   Tests con node:test
tools/make_icons.py  Generador de iconos PNG
icons/               icon16.png, icon48.png, icon128.png
```

## Tabla de pagos (apuesta 5; escala en proporción a la apuesta)

Los símbolos son logos de modelos de IA (PNG en `img/`): Claude, Codex,
Gemini, xAI, DeepSeek, Qwen, Z.ai, MiniMax, NVIDIA y Mistral.

| Combinación        | Premio |
|--------------------|--------|
| 3 × Claude         | 250    |
| 3 × Codex          | 150    |
| 3 × Gemini         | 100    |
| 3 × xAI            | 75     |
| 3 × DeepSeek       | 60     |
| 3 × Qwen           | 40     |
| 3 × Z.ai           | 30     |
| 3 × MiniMax        | 20     |
| 3 × NVIDIA         | 15     |
| 3 × Mistral        | 10     |
| 2 × Mistral        | 5      |
| 1 × Mistral        | 2      |

Cada carrete es una tira de 20 posiciones con distinta frecuencia por símbolo
(Claude, Codex y Gemini aparecen una sola vez por tira; Mistral es el más
frecuente). El resultado se decide antes de animar: la animación solo
escenifica el resultado ya calculado.

## Flujo

1. Usuario abre el popup; se cargan créditos desde `chrome.storage.local`.
2. Tira de la palanca: se descuenta la apuesta, se calcula la tirada con
   `spin()`, giran los carretes y paran secuencialmente sobre el resultado.
3. `payout()` calcula el premio; si hay premio se suma, suena la fanfarria y
   parpadea el marcador.
4. Créditos guardados tras cada tirada.

## Errores y bordes

- Sin créditos suficientes: la palanca se bloquea y se ofrece "Reiniciar (100)".
- `chrome.storage` no disponible (apertura como fichero local): se usa
  `localStorage` como reserva para poder probar sin instalar.
- Palanca ignorada mientras los carretes giran.

## Pruebas

- `node --test test/` sobre `logic.js`: dimensiones de la tirada, símbolos
  válidos, tabla de pagos completa (cada combinación y los casos sin premio),
  distribución (los premios gordos son raros), apuesta y saldo.
- Prueba manual: cargar la carpeta en `chrome://extensions` (modo desarrollador).
