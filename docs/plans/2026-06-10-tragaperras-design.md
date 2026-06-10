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
- **Símbolos como SVG inline** (cereza, limón, campana, siete, BAR, estrella):
  cumple la norma de no usar emojis y no requiere librerías de iconos.
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

| Combinación        | Premio |
|--------------------|--------|
| 3 × Claude         | 250    |
| 3 × Codex          | 150    |
| 3 × BAR            | 100    |
| 3 × campana        | 60     |
| 3 × estrella       | 40     |
| 3 × limón          | 25     |
| 3 × cereza         | 15     |
| 2 × cereza         | 5      |
| 1 × cereza         | 2      |

Cada carrete es una tira de 20 posiciones con distinta frecuencia por símbolo
(Claude y Codex aparecen una sola vez por tira). El resultado se decide antes
de animar: la animación solo escenifica el resultado ya calculado.

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
