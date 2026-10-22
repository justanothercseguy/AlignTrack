import {
  mergeIntervals,
  calculateDailyWearMinutes,
  computeDailySummary,
} from '../src/services/wearTimeCalculation';

describe('Wear Time Calculation Logic', () => {
  describe('mergeIntervals', () => {
    it('merges overlapping intervals correctly without double counting', () => {
      const intervals = [
        { start: new Date('2026-10-21T08:00:00Z'), end: new Date('2026-10-21T12:00:00Z') },
        { start: new Date('2026-10-21T10:00:00Z'), end: new Date('2026-10-21T14:00:00Z') },
      ];

      const merged = mergeIntervals(intervals);
      expect(merged).toHaveLength(1);
      expect(merged[0].start).toEqual(new Date('2026-10-21T08:00:00Z'));
      expect(merged[0].end).toEqual(new Date('2026-10-21T14:00:00Z'));
    });

    it('keeps non-overlapping intervals separate', () => {
      const intervals = [
        { start: new Date('2026-10-21T08:00:00Z'), end: new Date('2026-10-21T10:00:00Z') },
        { start: new Date('2026-10-21T12:00:00Z'), end: new Date('2026-10-21T14:00:00Z') },
      ];

      const merged = mergeIntervals(intervals);
      expect(merged).toHaveLength(2);
    });
  });

  describe('calculateDailyWearMinutes and Midnight Boundaries', () => {
    it('calculates sessions within a single UTC day correctly', () => {
      // 8:00 UTC to 18:00 UTC = 10 hours = 600 minutes
      const sessions = [
        {
          startTime: new Date('2026-10-21T08:00:00.000Z'),
          endTime: new Date('2026-10-21T18:00:00.000Z'),
        },
      ];

      const { totalMinutes } = calculateDailyWearMinutes(sessions, '2026-10-21', 'UTC');
      expect(totalMinutes).toBe(600);
    });

    it('splits sessions crossing midnight across calendar days', () => {
      // Session from 22:00 UTC on Oct 21 to 06:00 UTC on Oct 22 (8 hours total)
      const sessions = [
        {
          startTime: new Date('2026-10-21T22:00:00.000Z'),
          endTime: new Date('2026-10-22T06:00:00.000Z'),
        },
      ];

      // Day 1 (Oct 21): 22:00 to 24:00 = 2 hours = 120 minutes
      const day1 = calculateDailyWearMinutes(sessions, '2026-10-21', 'UTC');
      expect(day1.totalMinutes).toBe(120);

      // Day 2 (Oct 22): 00:00 to 06:00 = 6 hours = 360 minutes
      const day2 = calculateDailyWearMinutes(sessions, '2026-10-22', 'UTC');
      expect(day2.totalMinutes).toBe(360);

      expect(day1.totalMinutes + day2.totalMinutes).toBe(480); // 8 hours total
    });
  });

  describe('computeDailySummary and Target Status', () => {
    it('computes 19 hours against 18-hour target: targetMet=true, extra=1h, remaining=0h', () => {
      const sessions = [
        {
          startTime: new Date('2026-10-21T00:00:00.000Z'),
          endTime: new Date('2026-10-21T19:00:00.000Z'),
        },
      ];

      const summary = computeDailySummary(sessions as any, '2026-10-21', 18, 'UTC');
      expect(summary.totalHours).toBe(19);
      expect(summary.targetHours).toBe(18);
      expect(summary.targetMet).toBe(true);
      expect(summary.remainingHours).toBe(0);
      expect(summary.extraHours).toBe(1);
    });

    it('computes 17 hours against 18-hour target: targetMet=false, extra=0h, remaining=1h', () => {
      const sessions = [
        {
          startTime: new Date('2026-10-21T00:00:00.000Z'),
          endTime: new Date('2026-10-21T17:00:00.000Z'),
        },
      ];

      const summary = computeDailySummary(sessions as any, '2026-10-21', 18, 'UTC');
      expect(summary.totalHours).toBe(17);
      expect(summary.targetHours).toBe(18);
      expect(summary.targetMet).toBe(false);
      expect(summary.remainingHours).toBe(1);
      expect(summary.extraHours).toBe(0);
    });
  });
});
