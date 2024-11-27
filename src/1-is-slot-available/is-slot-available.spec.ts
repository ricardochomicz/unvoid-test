import { CalendarAvailability, CalendarEvent, CalendarSlot, Weekday } from '../types';
import { isSlotAvailable } from './is-slot-available';

describe(`01 - ${isSlotAvailable.name}`, () => {
  const availability: CalendarAvailability = {
    include: [
      {
        weekday: Weekday.monday,
        range: [
          { hours: 9, minutes: 0 },
          { hours: 12, minutes: 0 },
        ],
      },
      {
        weekday: Weekday.tuesday,
        range: [
          { hours: 14, minutes: 0 },
          { hours: 18, minutes: 0 },
        ],
      },
      {
        weekday: Weekday.wednesday,
        range: [
          { hours: 10, minutes: 0 },
          { hours: 16, minutes: 0 },
        ],
      },
      {
        weekday: Weekday.thursday,
        range: [
          { hours: 8, minutes: 30 },
          { hours: 11, minutes: 30 },
        ],
      },
      {
        weekday: Weekday.friday,
        range: [
          { hours: 13, minutes: 0 },
          { hours: 17, minutes: 0 },
        ],
      },
    ],
  };

  const availableSlots: CalendarSlot[] = [
    { start: new Date('2024-01-15T09:15:00Z'), durationM: 45 }, // Monday at 9:15 UTC
    { start: new Date('2024-01-16T16:45:00Z'), durationM: 45 }, // Tuesday at 16:45 UTC
    { start: new Date('2024-01-17T14:00:00Z'), durationM: 60 }, // Wednesday at 14:00 UTC
    { start: new Date('2024-01-18T08:30:00Z'), durationM: 30 }, // Thursday at 8:30 UTC
    { start: new Date('2024-01-19T15:30:00Z'), durationM: 60 }, // Friday at 15:30 UTC
  ];

  const unavailableSlots: CalendarSlot[] = [
    { start: new Date('2024-01-15T17:15:00Z'), durationM: 45 }, // Monday at 17:15 UTC
    { start: new Date('2024-01-16T13:45:00Z'), durationM: 45 }, // Tuesday at 13:45 UTC
    { start: new Date('2024-01-17T08:00:00Z'), durationM: 60 }, // Wednesday at 08:00 UTC
    { start: new Date('2024-01-18T08:30:00Z'), durationM: 240 }, // Thursday at 08:30 UTC
    { start: new Date('2024-01-19T12:30:00Z'), durationM: 60 }, // Friday at 12:30 UTC
  ];

  // Array de eventos (você pode preencher com eventos reais se necessário)
  const events: CalendarEvent[] = []; // Pode ser um array vazio ou conter eventos se você quiser testar a sobreposição

  it('should return true for all available slots', () => {
    const result = availableSlots.every(slot => isSlotAvailable(availability, slot, events));
    expect(result).toBe(true);
  });

  it('should return false for all unavailable slots', () => {
    const result = unavailableSlots.every(slot => isSlotAvailable(availability, slot, events) === false);
    expect(result).toBe(true);
  });
});