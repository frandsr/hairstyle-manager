import { getWeeksSince } from '../utils/date';

export type ShiftType = 'morning' | 'afternoon';

export interface Shift {
    type: ShiftType;
    label: string;
    emoji: string;
    hours: string;
}

export const SHIFTS: Record<ShiftType, Shift> = {
    morning: {
        type: 'morning',
        label: 'Turno Mañana',
        emoji: '☀️',
        hours: '09:00 - 17:00',
    },
    afternoon: {
        type: 'afternoon',
        label: 'Turno Tarde',
        emoji: '🌙',
        hours: '12:00 - 20:00',
    },
};

/**
 * Calculate current shift based on week number since pattern start
 * Shifts rotate weekly: Week 0 = morning, Week 1 = afternoon, Week 2 = morning, etc.
 */
export function getCurrentShift(
    currentDate: Date = new Date(),
    shiftPatternStart: Date,
    manualOverride?: ShiftType
): Shift {
    // If manual override is set, use it
    if (manualOverride) {
        return SHIFTS[manualOverride];
    }

    // Calculate weeks since pattern start
    const weeksSinceStart = getWeeksSince(shiftPatternStart, currentDate);

    // Even weeks = morning, odd weeks = afternoon
    const shiftType: ShiftType = weeksSinceStart % 2 === 0 ? 'morning' : 'afternoon';

    return SHIFTS[shiftType];
}

/**
 * Get the opposite shift
 */
export function getOppositeShift(currentShift: ShiftType): Shift {
    return currentShift === 'morning' ? SHIFTS.afternoon : SHIFTS.morning;
}
