'use strict';
const inventory = require('../../src/services/inventoryService');

describe('Inventory', () => {
  test('[UT-INV-001] reports current stock', () => {
    expect(inventory.getStock('P-1006')).toBe(3);
  });

  test('[UT-INV-002] throws for an unknown product', () => {
    expect(() => inventory.getStock('P-0000')).toThrow(expect.objectContaining({ status: 404 }));
  });

  test('[UT-INV-003] isAvailable is true when stock covers the quantity', () => {
    expect(inventory.isAvailable('P-1006', 3)).toBe(true);
  });

  test('[UT-INV-004] isAvailable is false when stock is short', () => {
    expect(inventory.isAvailable('P-1006', 4)).toBe(false);
  });

  test('[UT-INV-005] reserve decrements stock', () => {
    inventory.reserve([{ productId: 'P-1001', qty: 5 }]);
    expect(inventory.getStock('P-1001')).toBe(20);
  });

  test('[UT-INV-006] reserve is all-or-nothing when one line is short', () => {
    expect(() => inventory.reserve([{ productId: 'P-1001', qty: 1 }, { productId: 'P-1011', qty: 1 }])).toThrow(
      expect.objectContaining({ code: 'OUT_OF_STOCK' })
    );
    expect(inventory.getStock('P-1001')).toBe(25);
  });

  test('[UT-INV-007] release restores stock', () => {
    inventory.reserve([{ productId: 'P-1002', qty: 2 }]);
    inventory.release([{ productId: 'P-1002', qty: 2 }]);
    expect(inventory.getStock('P-1002')).toBe(12);
  });
});
