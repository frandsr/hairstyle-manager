import type { Job } from '../types/database';

/**
 * Calculate total revenue from jobs (excludes tips)
 */
export function calculateRevenue(jobs: Job[]): number {
    return jobs.reduce((total, job) => total + job.amount, 0);
}

/**
 * Calculate total tips from jobs
 */
export function calculateTips(jobs: Job[]): number {
    return jobs.reduce((total, job) => total + job.tip_amount, 0);
}

/**
 * Calculate total earnings (commission + tips = "Mi Bolsillo")
 */
export function calculateEarnings(commission: number, tips: number): number {
    return commission + tips;
}

/**
 * Check if weekly revenue target was met
 */
export function isTargetMet(weeklyRevenue: number, target: number): boolean {
    return weeklyRevenue >= target;
}

/**
 * Update streak count based on target achievement
 * If target is met, increment streak
 * If target is not met, reset streak to 0
 */
export function updateStreak(currentStreak: number, targetMet: boolean): number {
    if (targetMet) {
        return currentStreak + 1;
    }
    return 0;
}
