'use client';

import { useState, useEffect } from 'react';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { supabase } from '../supabase/client';
import type { Settings } from '../types/database';
import type { Settings as SettingsCalc } from '../calculations/commission';

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
                // Fetch from Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                setSettings(data);
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function updateSettings(updates: Partial<Settings>) {
        try {
            if (isMockAuthMode()) {
                // Update mock data
                mockStore.settings = { ...mockStore.settings, ...updates };
                setSettings(mockStore.settings);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { data, error } = await supabase
                    .from('settings')
                    .update(updates)
                    .eq('user_id', user.id)
                    .select()
                    .single();

                if (error) throw error;
                setSettings(data);
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
        refetch: fetchSettings,
    };
}
