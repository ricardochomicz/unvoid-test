import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

// Function to list available 30-minute slots for multiple people
export const listAvailable30MinuteSlotsMultiplePerson = (
  availabilitiesAndEvents: Array<{ availability: CalendarAvailability; events: CalendarEvent[] }>,
  range: [Date, Date]
): CalendarSlot[] => {
  const [rangeStart, rangeEnd] = range; // Destructure the range into start and end dates
  const slots: CalendarSlot[] = []; // Initialize an array to hold the available slots

  // Helper function to generate 30-minute slots between a start and end date
  const generate30MinuteSlots = (start: Date, end: Date): Date[] => {
    const result: Date[] = []; // Array to hold the generated slots
    let current = new Date(start); // Start from the provided start date

    // Loop to create 30-minute intervals until the end date is reached
    while (current < end) {
      result.push(new Date(current)); // Add the current slot to the result
      current.setMinutes(current.getMinutes() + 30); // Move to the next 30-minute slot
    }

    return result; // Return the array of generated slots
  };

  // Iterate over each day in the provided date range
  for (let date = new Date(rangeStart); date <= rangeEnd; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getUTCDay(); // Get the day of the week for the current date

    // Generate initial availability for all doctors on this day
    const daySlots: Date[] = availabilitiesAndEvents
      .map(({ availability }) => {
        // Find the availability for the current day of the week
        const dayAvailability = availability.include.find(({ weekday }) => weekday === dayOfWeek);
        if (!dayAvailability) return []; // If no availability, return an empty array

        const dayStart = new Date(date); // Start time for the day
        dayStart.setUTCHours(dayAvailability.range[0].hours, dayAvailability.range[0].minutes, 0, 0); // Set start hour and minute

        const dayEnd = new Date(date); // End time for the day
        dayEnd.setUTCHours(
          dayAvailability.range[1]?.hours ?? 23, // Use the provided end hour or default to 23
          dayAvailability.range[1]?.minutes ?? 59, // Use the provided end minute or default to 59
          0,
          0
        );

        // Generate 30-minute slots for the day's availability
        return generate30MinuteSlots(dayStart, dayEnd);
      })
      .reduce((commonSlots, doctorSlots) =>
        // Filter to find common slots available for all doctors
        commonSlots.filter(slot => doctorSlots.some(dSlot => dSlot.getTime() === slot.getTime()))
      );

    // Filter available slots considering existing events
    const availableSlots = daySlots.filter(slotStart => {
      const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // Calculate the end time of the slot

      return availabilitiesAndEvents.every(({ events }) =>
        // Check that no events overlap with the slot considering buffers
        !events.some(event => {
          const bufferBefore = event.buffer?.before || 0; // Get buffer time before the event
          const bufferAfter = event.buffer?.after || 0; // Get buffer time after the event

          // Calculate event start and end times with buffers
          const eventStartWithBuffer = new Date(event.start.getTime() - bufferBefore * 60000);
          const eventEndWithBuffer = new Date(event.end.getTime() + bufferAfter * 60000);

          // Check if the slot overlaps with the event time
          return slotStart < eventEndWithBuffer && slotEnd > eventStartWithBuffer;
        })
      );
    });

    // Add available slots for the day to the result
    slots.push(...availableSlots.map(start => ({ start, durationM: 30 }))); // Map to CalendarSlot format
  }

  return slots; // Return the array of available slots
};