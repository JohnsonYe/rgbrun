export class TimeZoneUtil {
    /**
     * Get the current date and time in the specified timezone as a Date object.
     * @param timezone - The IANA timezone string (e.g., "America/Los_Angeles").
     * @returns A Date object representing the current time in the specified timezone.
     */
    static getCurrentTimeInTimeZone(timezone: string): Date {
      try {
        const now = new Date();
  
        // Format the date and time for the specified timezone
        const options: Intl.DateTimeFormatOptions = {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        };
  
        const localTime = new Intl.DateTimeFormat('en-US', options).format(now);
  
        // Split the formatted string into date and time parts
        const [datePart, timePart] = localTime.split(', ');
        const [month, day, year] = datePart.split('/');
        const [hour, minute, second] = timePart.split(':');
  
        // Create a Date object in the specified timezone
        return new Date(
          Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1, // Months are zero-based
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            parseInt(second, 10)
          )
        );
      } catch (error) {
        throw new Error(`Invalid timezone: ${timezone}. Error: ${error}`);
      }
    }

     /**
     * Format a Date object into the desired {Year}-{month}-{Day} format.
     * @param date - The Date object to format.
     * @returns A string in the format {Year}-{month}-{Day}.
     */
    static formatDate(date: Date): string {
        const year = date.getUTCFullYear(); // Get the year
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so +1) and pad with 0
        const day = String(date.getUTCDate()).padStart(2, '0'); // Get the day and pad with 0

        return `${year}-${month}-${day}`; // Combine into desired format
    }
  
    /**
     * Convert a given Date object to an ISO 8601 timestamp string.
     * @param date - The Date object to convert.
     * @returns The ISO 8601 string representation of the date.
     */
    static toISOString(date: Date): string {
        if (!(date instanceof Date)) {
        throw new Error('Invalid input: Argument must be a Date object');
        }
        return date.toISOString(); // Native Date method to get ISO 8601 format
    }

    /**
     * Get the Unix timestamp (in seconds) from a given Date object.
     * @param date - The Date object.
     * @returns The Unix timestamp in seconds.
     */
    static getUnixTimestampFromDate(date: Date): number {
        if (!(date instanceof Date)) {
        throw new Error('Invalid input: Argument must be a Date object');
        }
        return Math.floor(date.getTime() / 1000); // Convert milliseconds to seconds
    }

    static generateDateRange(fromDate: string, toDate: string): string[] {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const dateRange: string[] = [];
      
        for (let start = startDate; start <= endDate; start.setDate(start.getDate() + 1)) {
            dateRange.push(this.formatDate(start));
        }
      
        return dateRange;
    };
  }
  