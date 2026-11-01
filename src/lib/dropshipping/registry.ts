/**
 * Supplier registry — add new platforms here after implementing DropshipSupplier
 */

import type { DropshipSupplier, SupplierId } from './types';
import { cjSupplier } from './cj';

const map: Record<string, DropshipSupplier> = {
  cj: cjSupplier,
  // spocket: spocketSupplier,
  // zendrop: zendropSupplier,
};

export function getSupplier(id: string): DropshipSupplier {
  const supplier = map[id];
  if (!supplier) {
    throw new Error(
      `Supplier "${id}" is not supported yet. Supported: ${Object.keys(map).join(', ')}`
    );
  }
  return supplier;
}

export function listSuppliers(): { id: SupplierId; name: string }[] {
  return Object.values(map).map((s) => ({ id: s.id, name: s.name }));
}

export function isSupplierSupported(id: string): boolean {
  return Boolean(map[id]);
}
