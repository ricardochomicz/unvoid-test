import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

// Function to check if a given time slot is available considering both availability and scheduled events
export const isSlotAvailableWithEvents = (
  availability: CalendarAvailability, // Object containing availability information
  events: Array<CalendarEvent>, // Array of scheduled events
  slot: CalendarSlot, // The time slot to check for availability
): boolean => {
  const slotStart = slot.start; // Start time of the slot
  const slotEnd = new Date(slot.start.getTime() + slot.durationM * 60000); // End time of the slot, calculated from start time and duration

  // Check if the slot is within the availability
  const isAvailableTime = availability.include.some(({ weekday, range }) => {
    const isCorrectWeekday = weekday === slotStart.getUTCDay(); // Check if the slot's weekday matches the availability
    const isWithinRange = range.some(({ hours, minutes }, index, ranges) => {
      const rangeStart = new Date(slotStart); // Create a new date object for the start of the range
      const rangeEnd = new Date(slotStart); // Create a new date object for the end of the range

      // Adjust rangeEnd with the correct duration
      rangeStart.setUTCHours(hours, minutes, 0, 0); // Set the start time of the range
      if (index < ranges.length - 1) {
        rangeEnd.setUTCHours(ranges[index + 1].hours, ranges[index + 1].minutes, 0, 0); // Set the end time of the range based on the next range
      } else {
        // If it's the last range, calculate the end time based on hours and minutes
        rangeEnd.setUTCHours(hours + Math.floor(minutes / 60), (minutes % 60), 0, 0);
      }

      // Check if the slot start is after the range start and the slot end is before the range end
      return slotStart >= rangeStart && slotEnd <= rangeEnd;
    });
    return isCorrectWeekday && isWithinRange; // Return true if both weekday and time range conditions are met
  });

  if (!isAvailableTime) {
    return false; // The slot is not within the availability
  }

  // Check if the slot is free from scheduled events
  for (const event of events) {
    // If the slot overlaps with any existing event, return false
    if (slotStart < event.end && slotEnd > event.start) {
      return false; // The slot overlaps with an existing event
    }
  }

  return true; // The slot is available
};