import type { Fabric, Item } from '../api';

export function deliveryNoteTotals(item: Item, fabric: Fabric) {
  const pieces = fabric.piecesCount ?? 0;
  const meters = fabric.totalMeters ?? pieces * (fabric.metersPerPiece ?? 0);
  const weight = item.warpWeight != null && item.weftWeight != null && (item.totalMeters ?? 0) > 0
    ? (item.warpWeight + item.weftWeight) * meters / item.totalMeters! : null;
  return { pieces, meters, weight };
}
