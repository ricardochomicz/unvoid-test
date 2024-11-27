import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

// Function to list available 30-minute slots based on availability and events
export const listAvailable30MinuteSlots = (
  availability: CalendarAvailability, // Object containing availability information
  events: CalendarEvent[], // Array of calendar events
  range: [Date, Date] // Start and end date for the range to check
): CalendarSlot[] => {
  const [rangeStart, rangeEnd] = range; // Destructure the range into start and end dates
  const availableSlots: CalendarSlot[] = []; // Array to store available slots

  // Generate 30-minute slots within a given time interval
  const generateSlots = (start: Date, end: Date): Date[] => {
    const slots: Date[] = []; // Array to hold generated slots
    let current = new Date(start); // Start from the given start date

    // Loop to create slots every 30 minutes until the end date
    while (current < end) {
      slots.push(new Date(current)); // Add the current slot to the array
      current.setMinutes(current.getMinutes() + 30); // Move to the next 30-minute slot
    }

    return slots; // Return the array of generated slots
  };

  // Check if a given slot is available (not overlapping with events)
  const isSlotFree = (slotStart: Date, slotEnd: Date): boolean => {
    return !events.some(event => {
      const bufferBefore = event.buffer?.before || 0; // Buffer time before the event
      const bufferAfter = event.buffer?.after || 0; // Buffer time after the event

      // Calculate the start and end time of the event considering buffers
      const eventStart = new Date(event.start.getTime() - bufferBefore * 60000);
      const eventEnd = new Date(event.end.getTime() + bufferAfter * 60000);

      // Check if the current slot overlaps with the event time
      return slotStart < eventEnd && slotEnd > eventStart;
    });
  };

  // Iterate over each day in the date range
  for (let date = new Date(rangeStart); date <= rangeEnd; date.setDate(date.getDate() + 1)) {
    const weekday = date.getUTCDay(); // Get the day of the week (0-6)

    // Find the availability for the current weekday
    const weekdayAvailability = availability.include.find(({ weekday: w }) => w === weekday);
    if (!weekdayAvailability) continue; // If no availability, skip to the next day

    // Iterate through the availability ranges for the current weekday
    for (let i = 0; i < weekdayAvailability.range.length; i += 2) {
      if (i + 1 >= weekdayAvailability.range.length) break; // Ensure pairs of ranges

      // Set the start time for the current availability range
      const slotStart = new Date(date);
      slotStart.setUTCHours(
        weekdayAvailability.range[i].hours,
        weekdayAvailability.range[i].minutes,
        0,
        0
      );

      // Set the end time for the current availability range
      const slotEnd = new Date(date);
      slotEnd.setUTCHours(
        weekdayAvailability.range[i + 1].hours,
        weekdayAvailability.range[i + 1].minutes,
        0,
        0
      );

      // Generate 30-minute slots within the current availability range
      const slotsInRange = generateSlots(slotStart, slotEnd);

      // Check each generated slot for availability
      slotsInRange.forEach(slot => {
        const nextSlot = new Date(slot.getTime() + 30 * 60000); // Calculate the end time of the current slot

        // If the slot is within the specified range and is free, add it to available slots
        if (
          slot >= rangeStart &&
          nextSlot <= rangeEnd &&
          isSlotFree(slot, nextSlot)
        ) {
          availableSlots.push({ start: slot, durationM: 30 }); // Add the available slot to the array
        }
      });
    }
  }

  return availableSlots; // Return the array of available slots
};