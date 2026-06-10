# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y versionado [SemVer](https://semver.org/lang/es/).

## [1.0.0] - 2026-06-10

### Added

- Tragaperras clásica de 3 carretes en el popup de la extensión (Manifest V3).
- Palanca lateral accionable con clic o arrastre hacia abajo, con animación
  de muelle.
- 10 símbolos con los logos de modelos de IA: Claude (premio gordo, 250),
  Codex (150), Gemini (100), xAI (75), DeepSeek (60), Qwen (40), Z.ai (30),
  MiniMax (20), NVIDIA (15) y Mistral (10; pagos parciales por 1 o 2).
- Apuesta seleccionable (5/10/25/50) con premio proporcional a la apuesta.
- Marcador de tokens (100 iniciales), récord de premio más grande y botón de
  recarga `+100`.
- Sonidos sintéticos con WebAudio (palanca, parada de carrete, premio y
  fallo) con botón de silencio.
- Persistencia completa en `chrome.storage.local` (tokens, récord, apuesta y
  silencio) con reserva en `localStorage` para desarrollo.
- Marquesina con luces animadas que celebran los premios.
- Iconos de la extensión generados por script (la máquina con la mascota de
  Claude en la ventana).

[1.0.0]: https://keepachangelog.com/es-ES/1.1.0/
