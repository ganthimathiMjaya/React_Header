import moment, { tz } from 'moment-timezone';
import { DateRange } from '../../dto/dateRange';
import { DateTime } from 'luxon';

export default function getSpecificDaysAgo(daysAgo: number) {
  let date = new Date(new Date().setDate(new Date().getDate() - daysAgo));
  date.setUTCHours(0, 0, 0, 0);

  return date;
}

export function isWithinTwentyFourHours(scheduledDate: Date): boolean {
  const minDate = new Date(scheduledDate);
  minDate.setUTCHours(0, 0, 0, 0);
  //min: job scheduledDate minus 1 day, beginning of day
  minDate.setDate(minDate.getDate() - 1);
  const currentDate = new Date();
  return currentDate >= minDate;
}

export function getDateTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

// Change the orgTimeZone type to string once timezone is set to required. Atm it's a stop gap for testing to set to any type.
export function isDateSameAsToday(date: Date, orgTimeZone: any): boolean {
  if (!date) return false;

  const currentDate = moment();
  currentDate.tz(orgTimeZone);
  const currentString = currentDate.format();
  const dateString = date.toISOString();

  return dateString.substring(0, 10) === currentString.substring(0, 10);
}

export function generateStartEndDateRangeForDiff(days: number, timezone: string): DateRange {
  const tomorrow= DateTime.now().setZone(timezone).plus({days: 1}).toFormat('MM-dd-yy')
  const yesterday= DateTime.now().setZone(timezone).plus({days: -1}).toFormat('MM-dd-yy')

  let startDateRange;
  let endDateRange;
  if (days < 0) {
    startDateRange = DateTime.now().setZone(timezone).plus({days: (-1 + days)}).toFormat('MM-dd-yy');
    endDateRange = yesterday;
  } else {
    startDateRange = tomorrow;
    endDateRange = DateTime.now().setZone(timezone).plus({days: (1 + days)}).toFormat('MM-dd-yy');
  }
  return new DateRange(new Date(startDateRange), new Date(endDateRange));
}