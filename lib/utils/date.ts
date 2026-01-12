import { format, startOfWeek, endOfWeek, addWeeks, differenceInWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

// Week starts on Saturday (day 6)
const WEEK_START_DAY = 6;

/**
 * Get the start and end dates for a week containing the given date
 * Week runs Saturday to Friday
 */
export function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
    const start = startOfWeek(date, { weekStartsOn: WEEK_START_DAY, locale: es });
    const end = endOfWeek(date, { weekStartsOn: WEEK_START_DAY, locale: es });

    return { start, end };
}

/**
 * Format week range for display
 * Example: "Sáb 21 - Vie 27"
 */
export function formatWeekRange(start: Date, end: Date): string {
    const startStr = format(start, "E d", { locale: es });
    const endStr = format(end, "E d", { locale: es });

    return `${capitalize(startStr)} - ${capitalize(endStr)}`;
}

/**
 * Format full date in Spanish
 * Example: "sábado 21 de octubre"
 */
export function formatFullDate(date: Date): string {
    return format(date, "EEEE d 'de' MMMM", { locale: es });
}

/**
 * Format short date
 * Example: "21/10/2023"
 */
export function formatShortDate(date: Date): string {
    return format(date, 'dd/MM/yyyy', { locale: es });
}

// Export aliases for consistency
export { formatFullDate as formatDateLong, formatShortDate as formatDateShort };

/**
 * Get the week number relative to a start date
 * Used for shift rotation calculation
 */
export function getWeeksSince(startDate: Date, currentDate: Date = new Date()): number {
    return Math.abs(differenceInWeeks(currentDate, startDate));
}

/**
 * Get the next or previous week's start date
 */
export function navigateWeek(currentDate: Date, direction: 'next' | 'prev'): Date {
    const offset = direction === 'next' ? 1 : -1;
    return addWeeks(currentDate, offset);
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
    const week1 = getWeekBounds(date1);
    const week2 = getWeekBounds(date2);

    return week1.start.getTime() === week2.start.getTime();
}
