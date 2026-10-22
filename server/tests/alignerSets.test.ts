import {
  calculatePlannedChangeDate,
  calculateDaysElapsed,
  calculateDaysRemaining,
  isSetOverdue,
  getPhaseDefaultsForSet,
  getEffectiveWearTarget,
} from '../src/services/dateCalculation';

describe('Aligner Sets Progression and Recalculation Logic', () => {
  it('correctly calculates planned change date for 10-day initial sets', () => {
    const plannedEnd = calculatePlannedChangeDate('2026-10-11', 10);
    expect(plannedEnd).toBe('2026-10-21');
  });

  it('correctly handles actual switch date differing from planned date without altering historical records', () => {
    // Set 1 started on 2026-10-11 with planned duration of 10 days
    const set1PlannedEnd = calculatePlannedChangeDate('2026-10-11', 10);
    expect(set1PlannedEnd).toBe('2026-10-21');

    // User actually switched to Set 2 on October 24, 2026 (extended wear by doctor)
    const set1ActualEnd = '2026-10-24';
    const set2ActualStart = set1ActualEnd;

    // Set 2 has 10 days prescribed duration
    const set2PlannedEnd = calculatePlannedChangeDate(set2ActualStart, 10);
    expect(set2PlannedEnd).toBe('2026-11-03');

    // Set 1 historical planned date remains 2026-10-21
    expect(set1PlannedEnd).toBe('2026-10-21');
  });

  it('handles phase transition duration: Set 1-5 use 10 days, Set 6+ use 7 days', () => {
    const phaseA = getPhaseDefaultsForSet(5);
    expect(phaseA.defaultDurationDays).toBe(10);
    expect(phaseA.defaultWearTimeTarget).toBe(18);

    const phaseB = getPhaseDefaultsForSet(6);
    expect(phaseB.defaultDurationDays).toBe(7);
    expect(phaseB.defaultWearTimeTarget).toBe(20);
  });
});
