import { supabase } from '../supabase/client';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import type { SettingsHistory } from '../types/database';
import { getWeekBounds } from './date';
import { subWeeks } from 'date-fns';

/**
 * Ensures a settings_history record exists for the given week.
 * If one exists, returns it. If not, creates a new one by copying from the previous week
 * or using defaults for the first ever settings.
 */
export async function ensureSettingsHistoryForWeek(
    weekDate: Date,
    userId: string
): Promise<SettingsHistory> {
    if (isMockAuthMode()) {
        // For mock mode, return mock settings
        const { start, end } = getWeekBounds(weekDate);
        return {
            ...mockStore.settings,
            effective_from: start.toISOString(),
            effective_to: end.toISOString(),
            current_shift: null,
        };
    }

    const { start: weekStart, end: weekEnd } = getWeekBounds(weekDate);
    const weekStartISO = weekStart.toISOString();
    const weekEndISO = weekEnd.toISOString();

    // Check if settings_history exists for this week
    const { data: existingSettings } = await supabase
        .from('settings_history')
        .select('*')
        .eq('user_id', userId)
        .lte('effective_from', weekStartISO)
        .or(`effective_to.gt.${weekStartISO},effective_to.is.null`)
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingSettings) {
        return existingSettings;
    }

    // No settings exist for this week - create a new one
    // First, get the most recent previous settings (if any)
    const { data: previousSettings } = await supabase
        .from('settings_history')
        .select('*')
        .eq('user_id', userId)
        .lt('effective_from', weekStartISO)
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Cast to any due to Supabase type inference issue
    const prevSettingsAny = previousSettings as any;

    // Prepare new settings
    const newSettings = previousSettings
        ? {
            // Copy from previous week
            user_id: userId,
            weekly_target: prevSettingsAny.weekly_target,
            base_commission_rate: prevSettingsAny.base_commission_rate,
            streak_bonus_rate: prevSettingsAny.streak_bonus_rate,
            streak_bonus_threshold: prevSettingsAny.streak_bonus_threshold,
            fixed_bonus_tiers: prevSettingsAny.fixed_bonus_tiers,
            week_start_day: prevSettingsAny.week_start_day,
            // Toggle shift from previous week
            current_shift: prevSettingsAny.current_shift === 'morning'
                ? 'afternoon' as const
                : prevSettingsAny.current_shift === 'afternoon'
                    ? 'morning' as const
                    : null,
            // Reset streak threshold met
            streak_threshold_met: false,
            effective_from: weekStartISO,
            effective_to: weekEndISO,
        }
        : {
            // First ever settings - use defaults
            user_id: userId,
            weekly_target: 150000,
            base_commission_rate: 0.40,
            streak_bonus_rate: 0.05,
            streak_bonus_threshold: 0,
            fixed_bonus_tiers: [],
            week_start_day: 1,
            current_shift: null,
            streak_threshold_met: false,
            effective_from: weekStartISO,
            effective_to: weekEndISO,
        };

    const { data: createdSettings, error } = await supabase
        .from('settings_history')
        // @ts-ignore - Supabase type inference issue
        .insert(newSettings)
        .select()
        .single();

    if (error) throw error;
    return createdSettings;
}

/**
 * Calculates total revenue for a given week and updates the streak_threshold_met
 * boolean in the settings_history for that week.
 */
export async function calculateAndUpdateStreakStatus(
    weekDate: Date,
    userId: string
): Promise<void> {
    if (isMockAuthMode()) {
        // For mock mode, just update the mock store
        const { start, end } = getWeekBounds(weekDate);
        const weekJobs = mockStore.jobs.filter(job => {
            const jobDate = new Date(job.date);
            return jobDate >= start && jobDate <= end;
        });
        const totalRevenue = weekJobs.reduce((sum, job) => sum + job.amount, 0);
        const thresholdMet = totalRevenue >= mockStore.settings.streak_bonus_threshold;
        mockStore.settings.streak_threshold_met = thresholdMet;
        return;
    }

    const { start: weekStart, end: weekEnd } = getWeekBounds(weekDate);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Get all jobs for this week
    const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);

    if (jobsError) throw jobsError;

    // @ts-ignore - jobs typed as never due to Supabase issue
    const totalRevenue = (jobs || []).reduce((sum, job) => sum + job.amount, 0);

    // Get settings for this week
    const weekStartISO = weekStart.toISOString();
    const { data: settings, error: settingsError } = await supabase
        .from('settings_history')
        .select('id, streak_bonus_threshold')
        .eq('user_id', userId)
        .lte('effective_from', weekStartISO)
        .or(`effective_to.gt.${weekStartISO},effective_to.is.null`)
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (settingsError || !settings) {
        console.warn('No settings found for week, skipping streak update');
        return;
    }

    // Cast to any due to Supabase type inference issue
    const settingsAny = settings as any;

    // Calculate if threshold is met
    const thresholdMet = totalRevenue >= settingsAny.streak_bonus_threshold;

    // Update the streak_threshold_met field
    const { error: updateError } = await supabase
        .from('settings_history')
        // @ts-ignore - Supabase type inference issue
        .update({ streak_threshold_met: thresholdMet })
        .eq('id', settingsAny.id);

    if (updateError) throw updateError;
}

/**
 * Calculates the current streak count by looking back through previous weeks
 * and counting consecutive weeks where streak_threshold_met = true.
 * Returns the count capped at 4 weeks maximum.
 */
export async function calculateCurrentStreakCount(
    userId: string,
    currentWeekDate: Date
): Promise<number> {
    if (isMockAuthMode()) {
        // For mock mode, just check the current week's threshold
        return mockStore.settings.streak_threshold_met ? 1 : 0;
    }

    const currentWeekStart = getWeekBounds(currentWeekDate).start;

    // Fetch last 5 weeks of settings_history (current week + 4 previous)
    // We go back 5 weeks from current week start
    const fiveWeeksAgo = subWeeks(currentWeekStart, 4);

    const { data: settingsHistory, error } = await supabase
        .from('settings_history')
        .select('effective_from, streak_threshold_met')
        .eq('user_id', userId)
        .gte('effective_from', fiveWeeksAgo.toISOString())
        .lte('effective_from', currentWeekStart.toISOString())
        .order('effective_from', { ascending: false })
        .limit(5);

    if (error) throw error;
    if (!settingsHistory || settingsHistory.length === 0) return 0;

    let streakCount = 0;

    // Start from the most recent week (index 0 = current week)
    // Count consecutive weeks where threshold was met
    for (let i = 0; i < settingsHistory.length; i++) {
        // @ts-ignore - settingsHistory typed as never due to Supabase issue
        if (settingsHistory[i].streak_threshold_met) {
            streakCount++;
        } else {
            // Stop at first week where threshold was not met
            break;
        }
    }

    // Cap at 4 weeks
    return Math.min(streakCount, 4);
}
