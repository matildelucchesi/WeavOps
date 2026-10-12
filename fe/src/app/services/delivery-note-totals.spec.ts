import { describe, expect, it } from 'vitest';
import { deliveryNoteTotals } from './delivery-note-totals';

describe('Totali DDT per tela intera', () => {
  it('calcola il peso in proporzione ai metri della tela', () => {
    expect(deliveryNoteTotals({ warpWeight: 120, weftWeight: 80, totalMeters: 500 },
      { piecesCount: 3, metersPerPiece: 50 })).toEqual({ pieces: 3, meters: 150, weight: 60 });
  });
  it('usa il totale metri registrato sulla tela', () => {
    expect(deliveryNoteTotals({ warpWeight: 120, weftWeight: 80, totalMeters: 500 },
      { piecesCount: 3, metersPerPiece: 50, totalMeters: 145 }).weight).toBe(58);
  });
  it('non sostituisce con zero un peso mancante', () => {
    expect(deliveryNoteTotals({ warpWeight: 120, totalMeters: 500 }, { totalMeters: 50 }).weight).toBeNull();
  });
  it('evita la divisione per zero', () => {
    expect(deliveryNoteTotals({ warpWeight: 120, weftWeight: 80, totalMeters: 0 }, { totalMeters: 50 }).weight).toBeNull();
  });
});
