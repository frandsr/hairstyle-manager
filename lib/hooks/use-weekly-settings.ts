'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import type { SettingsHistory } from '../types/database';
import type { Settings as SettingsCalc } from '../calculations/commission';
import { getWeekBounds } from '../calculations/weekly-cycle';

/**
 * Hook to fetch settings for a specific week
 * Uses temporal queries to get the settings that were active during that week
 */
export function useWeeklySettings(weekDate: Date) {
    const [settings, setSettings] = useState<SettingsHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchSettingsForWeek();
    }, [weekDate]);

    async function fetchSettingsForWeek() {
        try {
            setLoading(true);
            setError(null);

            if (isMockAuthMode()) {
                // Use mock data (treat as current settings)
                const mockSettings: SettingsHistory = {
                    ...mockStore.settings,
                    id: mockStore.settings.id,
                    current_shift: null,
                    effective_from: new Date().toISOString(),
                    effective_to: null,
                };
                setSettings(mockSettings);
            } else {
                // Get week boundaries
                const { start } = getWeekBounds(weekDate);
                const weekStartISO = start.toISOString();

                // Fetch from Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // Query for settings active during this week
                const { data, error: queryError } = await supabase
                    .from('settings_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .lte('effective_from', weekStartISO)
                    .or(`effective_to.gt.${weekStartISO},effective_to.is.null`)
                    .order('effective_from', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (queryError) throw queryError;

                // If no settings found for this week, use the earliest available
                if (!data) {
                    const { data: fallback, error: fallbackError } = await supabase
                        .from('settings_history')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('effective_from', { ascending: true })
                        .limit(1)
                        .maybeSingle();

                    if (fallbackError) throw fallbackError;
                    setSettings(fallback);
                } else {
                    setSettings(data);
                }
            }
        } catch (err) {
            console.error('Error fetching weekly settings:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    // Convert to calculation format
    const calculationSettings: SettingsCalc | null = settings ? {
        weeklyTarget: settings.weekly_target,
        baseCommissionRate: settings.base_commission_rate,
        streakBonusRate: settings.streak_bonus_rate,
        streakBonusThreshold: settings.streak_bonus_threshold,
        currentStreakCount: settings.current_streak_count,
        fixedBonusTiers: settings.fixed_bonus_tiers,
    } : null;

    return {
        settings,
        calculationSettings,
        loading,
        error,
        refetch: fetchSettingsForWeek,
    };
}
