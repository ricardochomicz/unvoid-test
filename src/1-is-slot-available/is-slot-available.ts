import { CalendarAvailability, CalendarSlot, CalendarEvent } from '../types';

// Function to check if a given time slot is available
export const isSlotAvailable = (
  availability: CalendarAvailability, // Availability data for the calendar
  slot: CalendarSlot, // The time slot to check
  events: CalendarEvent[] // List of existing calendar events
): boolean => {
  const slotDay = slot.start.getUTCDay(); // Get the day of the week for the slot (0 = Sunday, 1 = Monday, etc.)

  // Calculate the end time of the slot
  const slotEnd = new Date(slot.start);
  slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + slot.durationM); // Add the duration of the slot to the start time

  // Check if the slot is within the availability range
  for (const entry of availability.include) {
    if (entry.weekday === slotDay) { // Check if the entry matches the day of the slot
      const [availableStart, availableEnd] = entry.range; // Get the available time range

      // Create Date objects for the available start and end times
      const availableStartTime = new Date(slot.start);
      availableStartTime.setUTCHours(availableStart.hours, availableStart.minutes, 0, 0);
      const availableEndTime = new Date(slot.start);
      availableEndTime.setUTCHours(availableEnd.hours, availableEnd.minutes, 0, 0);

      // Check if the slot is within the available time range
      if (slot.start >= availableStartTime && slotEnd <= availableEndTime) {
        // Check if the slot overlaps with any existing events
        const isOverlapping = events.some(event => {
          const eventStart = event.start; // Start time of the event
          const eventEnd = event.end; // End time of the event

          // Check for overlap: slot starts before event ends and slot ends after event starts
          return (slot.start < eventEnd && slotEnd > eventStart);
        });

        // If there is no overlap, the slot is available
        return !isOverlapping;
      }
    }
  }

  // If there is no corresponding availability, return false
  return false;
};