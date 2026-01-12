'use client';

import { useState, useEffect } from 'react';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { supabase } from '../supabase/client';
import type { Settings, SettingsHistory } from '../types/database';
import type { Settings as SettingsCalc } from '../calculations/commission';
import { getWeekBounds } from '../calculations/weekly-cycle';
import { ensureSettingsHistoryForWeek } from '../utils/settings-history-manager';

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchSettings();

        // Listen for settings updates from other components
        const handleSettingsUpdate = (event: CustomEvent) => {
            console.log('[useSettings] Received settings-updated event:', event.detail);
            setSettings(event.detail);
        };

        window.addEventListener('settings-updated', handleSettingsUpdate as EventListener);

        return () => {
            window.removeEventListener('settings-updated', handleSettingsUpdate as EventListener);
        };
    }, []);

    async function fetchSettings() {
        try {
            setLoading(true);
            if (isMockAuthMode()) {
                setSettings(mockStore.settings);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSettings(null);
                return;
            }

            console.log('[fetchSettings] Fetching settings for user:', user.id);

            // Check for ANY settings_history record for this user
            const { data: existingSettings, error: queryError } = await supabase
                .from('settings_history')
                .select('*')
                .eq('user_id', user.id)
                .order('effective_from', { ascending: false })
                .limit(1)
                .maybeSingle();

            console.log('[fetchSettings] Query result:', { existingSettings, queryError });

            if (!existingSettings) {
                // No settings exist - this is a first-time user
                console.log('[fetchSettings] No settings found, showing setup modal');
                setSettings(null);
                return;
            }

            console.log('[fetchSettings] Settings found, converting to Settings type');

            // Convert SettingsHistory to Settings (keeping types compatible)
            // Cast to any due to Supabase type inference issue
            const existingSettingsAny = existingSettings as any;
            const settingsData: Settings = {
                id: existingSettingsAny.id,
                user_id: existingSettingsAny.user_id,
                weekly_target: existingSettingsAny.weekly_target,
                base_commission_rate: existingSettingsAny.base_commission_rate,
                streak_bonus_rate: existingSettingsAny.streak_bonus_rate,
                streak_bonus_threshold: existingSettingsAny.streak_bonus_threshold || 0,
                streak_threshold_met: existingSettingsAny.streak_threshold_met,
                fixed_bonus_tiers: existingSettingsAny.fixed_bonus_tiers,
                week_start_day: existingSettingsAny.week_start_day,
                current_shift: existingSettingsAny.current_shift,
                created_at: existingSettingsAny.created_at,
                updated_at: existingSettingsAny.updated_at,
            };

            console.log('[fetchSettings] Setting settings state:', settingsData);
            setSettings(settingsData);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function updateSettings(updates: Partial<Omit<SettingsHistory, 'id' | 'user_id' | 'effective_from' | 'effective_to' | 'created_at' | 'updated_at'>>) {
        try {
            console.log('[useSettings] updateSettings called with:', updates);

            if (isMockAuthMode()) {
                // Create completely new object to ensure React detects the change
                const newSettings = {
                    ...mockStore.settings,
                    ...updates,
                    updated_at: new Date().toISOString() // Force new timestamp
                };
                mockStore.settings = newSettings;
                console.log('[useSettings] Updated mockStore.settings:', newSettings);
                setSettings(newSettings);
                console.log('[useSettings] Called setSettings with new object reference');

                // Dispatch custom event to notify other components
                window.dispatchEvent(new CustomEvent('settings-updated', { detail: newSettings }));
                console.log('[useSettings] Dispatched settings-updated event');
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Ensure settings exist for current week
            await ensureSettingsHistoryForWeek(new Date(), user.id);

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
                // @ts-ignore - Supabase type inference issue
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', activeRecord.id)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            // Cast to any due to Supabase type inference issue
            const dataAny = data as any;
            const settingsData: Settings = {
                id: dataAny.id,
                user_id: dataAny.user_id,
                weekly_target: dataAny.weekly_target,
                base_commission_rate: dataAny.base_commission_rate,
                streak_bonus_rate: dataAny.streak_bonus_rate,
                streak_bonus_threshold: dataAny.streak_bonus_threshold || 0,
                streak_threshold_met: dataAny.streak_threshold_met,
                fixed_bonus_tiers: dataAny.fixed_bonus_tiers,
                week_start_day: dataAny.week_start_day,
                current_shift: dataAny.current_shift,
                created_at: dataAny.created_at,
                updated_at: dataAny.updated_at,
            };
            setSettings(settingsData);
            console.log('[useSettings] Updated settings state:', settingsData);

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('settings-updated', { detail: settingsData }));
            console.log('[useSettings] Dispatched settings-updated event');
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }



    // Convert to calculation format (no streak count - calculated separately)
    const calculationSettings: SettingsCalc | null = settings ? {
        weeklyTarget: settings.weekly_target,
        baseCommissionRate: settings.base_commission_rate,
        streakBonusRate: settings.streak_bonus_rate,
        streakBonusThreshold: settings.streak_bonus_threshold,
        fixedBonusTiers: settings.fixed_bonus_tiers,
    } : null;

    return {
        settings,
        calculationSettings,
        loading,
        error,
        updateSettings,
        refetch: fetchSettings,
    };
}
