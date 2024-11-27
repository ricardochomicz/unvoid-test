import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

// Function to determine if a time slot is available considering events and their buffers
export const isSlotAvailableWithBuffer = (
  availability: CalendarAvailability, // Object containing availability information
  events: Array<CalendarEvent>,       // Array of calendar events
  slot: CalendarSlot                   // The time slot to check for availability
): boolean => {
  const slotStart = slot.start; // Start time of the slot
  const slotEnd = new Date(slot.start.getTime() + slot.durationM * 60000); // End time of the slot (duration in minutes)

  // Helper function to calculate time bounds for a given range
  const calculateTimeBound = (baseDate: Date, hours: number, minutes: number): Date => {
    const bound = new Date(baseDate); // Create a new date object based on the base date
    bound.setUTCHours(hours, minutes, 0, 0); // Set the hours and minutes, resetting seconds and milliseconds
    return bound; // Return the calculated bound
  };

  // Check if the slot falls within the availability range
  const isSlotWithinAvailability = availability.include.some(({ weekday, range }) => {
    if (weekday !== slotStart.getUTCDay()) return false; // Check if the slot's weekday matches the availability

    // Check if the slot is within any of the defined ranges for the given weekday
    return range.some(({ hours, minutes }, index, ranges) => {
      const rangeStart = calculateTimeBound(slotStart, hours, minutes); // Calculate the start time of the range
      const rangeEnd =
        index < ranges.length - 1
          ? calculateTimeBound(slotStart, ranges[index + 1].hours, ranges[index + 1].minutes) // Calculate the end time of the current range
          : new Date(rangeStart.getTime() + 30 * 60000); // Default to 30 minutes after range start if it's the last range

      // Check if the slot start and end are within the calculated range
      return slotStart >= rangeStart && slotEnd <= rangeEnd;
    });
  });

  if (!isSlotWithinAvailability) return false; // If the slot is not within availability, return false

  // Check if the slot overlaps with any event, including the specified buffers
  const isSlotFreeFromEvents = events.every(event => {
    const bufferBefore = event.buffer?.before || 0; // Get the buffer time before the event (default to 0 if not defined)
    const bufferAfter = event.buffer?.after || 0; // Get the buffer time after the event (default to 0 if not defined)

    // Calculate the event's start and end times with buffers applied
    const eventStartWithBuffer = new Date(event.start.getTime() - bufferBefore * 60000);
    const eventEndWithBuffer = new Date(event.end.getTime() + bufferAfter * 60000);

    // Check if the slot overlaps with the event considering the buffers
    return !(slotStart < eventEndWithBuffer && slotEnd > eventStartWithBuffer);
  });

  return isSlotFreeFromEvents; // Return true if the slot is free from events, otherwise false
};