import {
  calculatePlannedChangeDate,
  calculateDaysElapsed,
  calculateDaysRemaining,
  isSetOverdue,
  getPhaseDefaultsForSet,
  getEffectiveWearTarget,
} from '../src/services/dateCalculation';

describe('Date Calculation Logic', () => {
  describe('calculatePlannedChangeDate', () => {
    it('calculates 10-day prescribed duration from Oct 24, 2026 to Nov 3, 2026', () => {
      const result = calculatePlannedChangeDate('2026-10-24', 10);
      expect(result).toBe('2026-11-03');
    });

    it('calculates 7-day prescribed duration from Nov 3, 2026 to Nov 10, 2026', () => {
      const result = calculatePlannedChangeDate('2026-11-03', 7);
      expect(result).toBe('2026-11-10');
    });

    it('handles leap year / month boundaries across February to March', () => {
      // 2028 is a leap year
      const result = calculatePlannedChangeDate('2028-02-25', 5);
      expect(result).toBe('2028-03-01');
    });

    it('throws error if start date is missing or invalid', () => {
      expect(() => calculatePlannedChangeDate('', 10)).toThrow();
      expect(() => calculatePlannedChangeDate('invalid-date', 10)).toThrow();
    });

    it('throws error if duration is <= 0', () => {
      expect(() => calculatePlannedChangeDate('2026-10-24', 0)).toThrow();
      expect(() => calculatePlannedChangeDate('2026-10-24', -5)).toThrow();
    });
  });

  describe('calculateDaysElapsed', () => {
    it('calculates exact days elapsed from start date to reference date', () => {
      const elapsed = calculateDaysElapsed('2026-10-11', '2026-10-21');
      expect(elapsed).toBe(10);
    });

    it('returns 0 if start date is in the future relative to reference date', () => {
      const elapsed = calculateDaysElapsed('2026-10-25', '2026-10-21');
      expect(elapsed).toBe(0);
    });
  });

  describe('calculateDaysRemaining', () => {
    it('calculates positive remaining days before planned change date', () => {
      const remaining = calculateDaysRemaining('2026-10-24', '2026-10-21');
      expect(remaining).toBe(3);
    });

    it('calculates negative remaining days when planned change date has passed', () => {
      const remaining = calculateDaysRemaining('2026-10-18', '2026-10-21');
      expect(remaining).toBe(-3);
    });
  });

  describe('isSetOverdue', () => {
    it('returns true when current set planned change date is in the past', () => {
      const overdue = isSetOverdue('2026-10-18', 'current', '2026-10-21');
      expect(overdue).toBe(true);
    });

    it('returns false when current set planned change date is in the future', () => {
      const overdue = isSetOverdue('2026-10-25', 'current', '2026-10-21');
      expect(overdue).toBe(false);
    });

    it('returns false if set status is completed even if date passed', () => {
      const overdue = isSetOverdue('2026-10-18', 'completed', '2026-10-21');
      expect(overdue).toBe(false);
    });
  });

  describe('Phase Defaults and Target Rules', () => {
    it('applies default 10-day duration and 18-hour target for Sets 1-5', () => {
      for (let s = 1; s <= 5; s++) {
        const defaults = getPhaseDefaultsForSet(s);
        expect(defaults.defaultDurationDays).toBe(10);
        expect(defaults.defaultWearTimeTarget).toBe(18);
      }
    });

    it('applies default 7-day duration and 20-hour target for Set 6 onward', () => {
      for (let s = 6; s <= 10; s++) {
        const defaults = getPhaseDefaultsForSet(s);
        expect(defaults.defaultDurationDays).toBe(7);
        expect(defaults.defaultWearTimeTarget).toBe(20);
      }
    });

    it('respects set-specific target overrides', () => {
      // Set 3 normally has 18h, but override is 22h
      const targetWithOverride = getEffectiveWearTarget(3, undefined, 22);
      expect(targetWithOverride).toBe(22);

      // Set 3 with no override uses 18h
      const targetWithoutOverride = getEffectiveWearTarget(3, undefined, null);
      expect(targetWithoutOverride).toBe(18);
    });
  });
});
