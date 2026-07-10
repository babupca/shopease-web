'use strict';
const profile = require('../../src/services/profileService');

describe('Customer profile', () => {
  test('[UT-PROF-001] returns the profile without the password', () => {
    const p = profile.getProfile('U-1');
    expect(p.name).toBe('Alice Shopper');
    expect(p).not.toHaveProperty('password');
  });

  test('[UT-PROF-002] updates the display name', () => {
    expect(profile.updateProfile('U-1', { name: '  Alice S. ' }).name).toBe('Alice S.');
  });

  test('[UT-PROF-003] rejects an empty name', () => {
    expect(() => profile.updateProfile('U-1', { name: '   ' })).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('[UT-PROF-004] updates the tax region', () => {
    expect(profile.updateProfile('U-1', { region: 'US-TX' }).region).toBe('US-TX');
  });

  test('[UT-PROF-005] rejects an unsupported region', () => {
    expect(() => profile.updateProfile('U-1', { region: 'EU-DE' })).toThrow(expect.objectContaining({ code: 'UNSUPPORTED_REGION' }));
  });

  test('[UT-PROF-006] adds an address', () => {
    expect(profile.addAddress('U-1', { line1: '1 Main St', city: 'Fresno', postcode: '93650' }).id).toBe('ADDR-1');
  });

  test('[UT-PROF-007] rejects an address without a postcode', () => {
    expect(() => profile.addAddress('U-1', { line1: '1 Main St', city: 'Fresno' })).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('[UT-PROF-008] unknown user returns 404', () => {
    expect(() => profile.getProfile('U-404')).toThrow(expect.objectContaining({ status: 404 }));
  });
});
