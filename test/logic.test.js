import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SYMBOLS,
  REELS,
  COST,
  START_CREDITS,
  spin,
  payout
} from '../logic.js';

test('hay 6 símbolos definidos', () => {
  assert.deepEqual(
    [...SYMBOLS].sort(),
    ['bar', 'campana', 'cereza', 'estrella', 'limon', 'siete']
  );
});

test('REELS son 3 tiras de 20 posiciones con símbolos válidos', () => {
  assert.equal(REELS.length, 3);
  for (const reel of REELS) {
    assert.equal(reel.length, 20);
    for (const s of reel) {
      assert.ok(SYMBOLS.includes(s), `símbolo desconocido: ${s}`);
    }
  }
});

test('cada tira contiene exactamente un siete (premio gordo escaso)', () => {
  for (const reel of REELS) {
    assert.equal(reel.filter((s) => s === 'siete').length, 1);
  }
});

test('la apuesta es 5 y los créditos iniciales 100', () => {
  assert.equal(COST, 5);
  assert.equal(START_CREDITS, 100);
});

test('spin devuelve 3 índices dentro del rango de cada tira', () => {
  for (let i = 0; i < 50; i++) {
    const indices = spin();
    assert.equal(indices.length, 3);
    indices.forEach((idx, reel) => {
      assert.ok(Number.isInteger(idx));
      assert.ok(idx >= 0 && idx < REELS[reel].length);
    });
  }
});

test('spin es determinista con un rng fijo', () => {
  const rng = () => 0;
  assert.deepEqual(spin(rng), [0, 0, 0]);
  const rngAlto = () => 0.999;
  assert.deepEqual(spin(rngAlto), [19, 19, 19]);
});

test('payout: tres iguales según tabla', () => {
  assert.equal(payout(['siete', 'siete', 'siete']), 250);
  assert.equal(payout(['bar', 'bar', 'bar']), 100);
  assert.equal(payout(['campana', 'campana', 'campana']), 60);
  assert.equal(payout(['estrella', 'estrella', 'estrella']), 40);
  assert.equal(payout(['limon', 'limon', 'limon']), 25);
  assert.equal(payout(['cereza', 'cereza', 'cereza']), 15);
});

test('payout: dos cerezas pagan 5 en cualquier posición', () => {
  assert.equal(payout(['cereza', 'cereza', 'limon']), 5);
  assert.equal(payout(['cereza', 'bar', 'cereza']), 5);
  assert.equal(payout(['siete', 'cereza', 'cereza']), 5);
});

test('payout: una cereza paga 2 en cualquier posición', () => {
  assert.equal(payout(['cereza', 'limon', 'bar']), 2);
  assert.equal(payout(['campana', 'cereza', 'estrella']), 2);
  assert.equal(payout(['limon', 'bar', 'cereza']), 2);
});

test('payout: sin combinación no hay premio', () => {
  assert.equal(payout(['limon', 'bar', 'campana']), 0);
  assert.equal(payout(['siete', 'siete', 'bar']), 0);
  assert.equal(payout(['estrella', 'campana', 'limon']), 0);
});
