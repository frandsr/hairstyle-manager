'use client';

import { useState, useEffect } from 'react';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { supabase } from '../supabase/client';
import type { Settings, SettingsHistory } from '../types/database';
import type { Settings as SettingsCalc } from '../calculations/commission';
import { getWeekBounds } from '../calculations/weekly-cycle';
import { addWeeks } from 'date-fns';

export type ApplyTo = 'current_week' | 'next_week';

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            setLoading(true);

            if (isMockAuthMode()) {
                // Use mock data
                setSettings(mockStore.settings);
            } else {
                // Fetch current active settings from settings_history
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                let { data, error } = await supabase
                    .from('settings_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .is('effective_to', null)
                    .maybeSingle();

                if (error) throw error;

                // If no settings exist, create defaults
                if (!data) {
                    console.log('No settings found, creating defaults...');
                    const { data: newSettings, error: createError } = await supabase
                        .from('settings_history')
                        .insert({
                            user_id: user.id,
                            weekly_target: 150000,
                            base_commission_rate: 0.40,
                            streak_bonus_rate: 0.05,
                            effective_from: new Date().toISOString(),
                            effective_to: null
                        })
                        .select()
                        .single();

                    if (createError) throw createError;
                    data = newSettings;
                }

                // Convert SettingsHistory to Settings (keeping types compatible)
                const settingsData: Settings = {
                    id: data.id,
                    user_id: data.user_id,
                    weekly_target: data.weekly_target,
                    base_commission_rate: data.base_commission_rate,
                    streak_bonus_rate: data.streak_bonus_rate,
                    current_streak_count: data.current_streak_count,
                    fixed_bonus_tiers: data.fixed_bonus_tiers,
                    week_start_day: data.week_start_day,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                };

                setSettings(settingsData);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function updateSettings(updates: Partial<Settings>) {
        // Legacy function - defaults to "next_week" for safety
        return updateSettingsWithEffectiveDate(updates, 'next_week');
    }

    async function updateSettingsWithEffectiveDate(
        updates: Partial<Omit<SettingsHistory, 'id' | 'user_id' | 'effective_from' | 'effective_to' | 'created_at' | 'updated_at'>>,
        applyTo: ApplyTo
    ) {
        try {
            if (isMockAuthMode()) {
                // Update mock data
                mockStore.settings = { ...mockStore.settings, ...updates };
                setSettings(mockStore.settings);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            if (applyTo === 'current_week') {
                // Apply to current week: Update the active record in place
                const currentWeekStart = getWeekBounds(new Date()).start.toISOString();

                // Find the record active for current week
                const { data: activeRecord } = await supabase
                    .from('settings_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .lte('effective_from', currentWeekStart)
                    .or(`effective_to.gt.${currentWeekStart},effective_to.is.null`)
                    .order('effective_from', { ascending: false })
                    .limit(1)
                    .single();

                if (!activeRecord) throw new Error('No active settings found for current week');

                // Update in place
                const { data, error } = await supabase
                    .from('settings_history')
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq('id', activeRecord.id)
                    .select()
                    .single();

                if (error) throw error;

                // Update local state
                const settingsData: Settings = {
                    id: data.id,
                    user_id: data.user_id,
                    weekly_target: data.weekly_target,
                    base_commission_rate: data.base_commission_rate,
                    streak_bonus_rate: data.streak_bonus_rate,
                    current_streak_count: data.current_streak_count,
                    fixed_bonus_tiers: data.fixed_bonus_tiers,
                    week_start_day: data.week_start_day,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                };
                setSettings(settingsData);

            } else {
                // Apply to next week: Create new record or update future record
                const nextSaturday = addWeeks(getWeekBounds(new Date()).end, 1);
                const nextSaturdayISO = nextSaturday.toISOString();

                // Check if a future record exists
                const { data: futureRecord } = await supabase
                    .from('settings_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('effective_from', nextSaturdayISO)
                    .maybeSingle();

                if (futureRecord) {
                    // Update existing future record
                    await supabase
                        .from('settings_history')
                        .update({ ...updates, updated_at: new Date().toISOString() })
                        .eq('id', futureRecord.id);
                } else {
                    // Close current active record and create new one
                    await supabase
                        .from('settings_history')
                        .update({ effective_to: nextSaturdayISO })
                        .eq('user_id', user.id)
                        .is('effective_to', null);

                    // Get current settings to use as base
                    const { data: currentSettings } = await supabase
                        .from('settings_history')
                        .select('*')
                        .eq('user_id', user.id)
                        .is('effective_to', null)
                        .maybeSingle();

                    await supabase
                        .from('settings_history')
                        .insert({
                            user_id: user.id,
                            weekly_target: updates.weekly_target ?? currentSettings?.weekly_target ?? 150000,
                            base_commission_rate: updates.base_commission_rate ?? currentSettings?.base_commission_rate ?? 0.40,
                            streak_bonus_rate: updates.streak_bonus_rate ?? currentSettings?.streak_bonus_rate ?? 0.05,
                            current_streak_count: updates.current_streak_count ?? currentSettings?.current_streak_count ?? 0,
                            fixed_bonus_tiers: updates.fixed_bonus_tiers ?? currentSettings?.fixed_bonus_tiers ?? [],
                            week_start_day: updates.week_start_day ?? currentSettings?.week_start_day ?? 1,
                            current_shift: updates.current_shift ?? null,
                            effective_from: nextSaturdayISO,
                            effective_to: null
                        });
                }

                // Refetch to get latest state
                await fetchSettings();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    // Convert to calculation format
    const calculationSettings: SettingsCalc | null = settings ? {
        weeklyTarget: settings.weekly_target,
        baseCommissionRate: settings.base_commission_rate,
        streakBonusRate: settings.streak_bonus_rate,
        currentStreakCount: settings.current_streak_count,
        fixedBonusTiers: settings.fixed_bonus_tiers,
    } : null;

    return {
        settings,
        calculationSettings,
        loading,
        error,
        updateSettings,
        updateSettingsWithEffectiveDate,
        refetch: fetchSettings,
    };
}
