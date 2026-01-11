import { supabase } from '../supabase/client';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { getWeekBounds } from './date';

/**
 * Calculate and update the streak counter based on current week's revenue
 * This should be called after any job operation (add, update, delete)
 */
export async function updateStreakIfNeeded(): Promise<void> {
    try {
        let userId: string;
        let currentStreak: number;
        let streakThreshold: number;
        let currentWeekRevenue: number;

        if (isMockAuthMode()) {
            // Mock mode - get data from mock store
            userId = mockStore.settings.user_id;
            currentStreak = mockStore.settings.current_streak_count;
            streakThreshold = mockStore.settings.streak_bonus_threshold || 0;

            // Calculate current week revenue from mock jobs
            const { start, end } = getWeekBounds(new Date());
            const currentWeekJobs = mockStore.jobs.filter(job => {
                const jobDate = new Date(job.date);
                return jobDate >= start && jobDate <= end;
            });
            currentWeekRevenue = currentWeekJobs.reduce((sum, job) => sum + job.amount, 0);
        } else {
            // Real mode - fetch from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('No user found, skipping streak update');
                return;
            }
            userId = user.id;

            // Get current settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('settings_history')
                .select('current_streak_count, streak_bonus_threshold')
                .eq('user_id', userId)
                .is('effective_to', null)
                .single();

            if (settingsError || !settingsData) {
                console.warn('No settings found, skipping streak update');
                return;
            }

            currentStreak = settingsData.current_streak_count;
            streakThreshold = settingsData.streak_bonus_threshold || 0;

            // Calculate current week revenue
            const { start, end } = getWeekBounds(new Date());
            const dateStrStart = start.toISOString().split('T')[0];
            const dateStrEnd = end.toISOString().split('T')[0];

            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('amount')
                .eq('user_id', userId)
                .gte('date', dateStrStart)
                .lte('date', dateStrEnd);

            if (jobsError) {
                console.error('Error fetching jobs for streak calculation:', jobsError);
                return;
            }

            currentWeekRevenue = (jobsData || []).reduce((sum, job) => sum + job.amount, 0);
        }

        // Calculate new streak based on threshold
        let newStreak: number;

        if (currentWeekRevenue >= streakThreshold) {
            // Threshold met - increment streak (or set to 1 if was 0)
            newStreak = currentStreak + 1;
            // Cap at 4 weeks maximum
            newStreak = Math.min(newStreak, 4);
        } else {
            // Threshold not met - reset streak to 0
            newStreak = 0;
        }

        // Only update if streak changed
        if (newStreak !== currentStreak) {
            if (isMockAuthMode()) {
                // Update mock store
                mockStore.settings.current_streak_count = newStreak;
            } else {
                // Update in database
                const { error: updateError } = await supabase
                    .from('settings_history')
                    .update({
                        current_streak_count: newStreak,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)
                    .is('effective_to', null);

                if (updateError) {
                    console.error('Error updating streak:', updateError);
                }
            }

            console.log(`Streak updated: ${currentStreak} → ${newStreak} (Revenue: ${currentWeekRevenue}, Threshold: ${streakThreshold})`);
        }
    } catch (error) {
        console.error('Error in updateStreakIfNeeded:', error);
        // Don't throw - we don't want streak calculation errors to break job operations
    }
}
