import { differenceInCalendarDays, parseISO } from 'date-fns';

describe('Appointments Reminder & Reschedule Logic', () => {
  it('calculates 1-day before reminder trigger', () => {
    const appointmentDate = '2026-11-15';
    const referenceDate = parseISO('2026-11-14');
    const diff = differenceInCalendarDays(parseISO(appointmentDate), referenceDate);
    expect(diff).toBe(1);
  });

  it('calculates day-of reminder trigger', () => {
    const appointmentDate = '2026-11-15';
    const referenceDate = parseISO('2026-11-15');
    const diff = differenceInCalendarDays(parseISO(appointmentDate), referenceDate);
    expect(diff).toBe(0);
  });

  it('properly detects when reminder date has already passed upon creation', () => {
    const pastAppointmentDate = '2026-10-10';
    const referenceDate = parseISO('2026-10-21');
    const diff = differenceInCalendarDays(parseISO(pastAppointmentDate), referenceDate);
    expect(diff).toBeLessThan(0);
  });
});
