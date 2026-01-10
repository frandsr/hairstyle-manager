import { startOfWeek, endOfWeek, differenceInWeeks } from 'date-fns';

/**
 * Get the boundaries of a business week (Saturday to Friday)
 * @param date Any date within the week
 * @returns Object with start (Saturday 00:00:00) and end (Friday 23:59:59) dates
 */
export function getWeekBounds(date: Date) {
    // Week starts on Saturday (day 6 in date-fns, 0 = Sunday)
    const start = startOfWeek(date, { weekStartsOn: 6 });
    const end = endOfWeek(date, { weekStartsOn: 6 });

    return {
        start,  // Saturday 00:00:00:000
        end     // Friday 23:59:59:999
    };
}

/**
 * Check if weekly target was met
 * @param weeklyRevenue Total revenue for the week (excluding tips)
 * @param target Weekly target amount
 * @returns True if target was met or exceeded
 */
export function isTargetMet(weeklyRevenue: number, target: number): boolean {
    return weeklyRevenue >= target;
}

/**
 * Update streak count based on target achievement
 * @param currentStreak Current streak count
 * @param targetMet Whether this week's target was met
 * @returns New streak count (incremented if met, reset to 0 if not)
 */
export function updateStreak(currentStreak: number, targetMet: boolean): number {
    return targetMet ? currentStreak + 1 : 0;
}

/**
 * Get the ISO week number for a given date
 * @param date Date to get week number for
 * @returns Week number (1-53)
 */
export function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Calculate number of weeks between two dates
 * @param startDate Earlier date
 * @param endDate Later date
 * @returns Number of weeks difference
 */
export function getWeeksSince(startDate: Date, endDate: Date): number {
    return differenceInWeeks(endDate, startDate);
}
