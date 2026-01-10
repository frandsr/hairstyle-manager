'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShiftBadge } from '@/components/dashboard/shift-badge';
import { WeekSelector } from '@/components/dashboard/week-selector';
import { EarningsSummary } from '@/components/dashboard/earnings-summary';
import { WeeklyTargetCard } from '@/components/dashboard/weekly-target-card';
import { BonusProgress } from '@/components/dashboard/bonus-progress';
import { JobFormDialog } from '@/components/jobs/job-form-dialog';
import { useWeeklySettings } from '@/lib/hooks/use-weekly-settings';
import { useWeekJobs } from '@/lib/hooks/use-jobs';
import { getWeekBounds, navigateWeek } from '@/lib/utils/date';
import { getCurrentShift } from '@/lib/calculations/shifts';
import { calculateCommission, getRemainingToNextBonus, getNextBonusTier, calculateFixedBonus } from '@/lib/calculations/commission';
import { calculateRevenue, calculateTips } from '@/lib/calculations/earnings';
import { translations } from '@/lib/i18n/es-AR';

export default function DashboardPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [jobFormOpen, setJobFormOpen] = useState(false);
    const { start, end } = getWeekBounds(currentDate);

    const { settings, calculationSettings, loading: settingsLoading } = useWeeklySettings(currentDate);
    const { jobs, loading: jobsLoading, addJob } = useWeekJobs(currentDate);

    // Calculate shift with manual override support
    const currentShift = settings
        ? getCurrentShift(currentDate, new Date(settings.shift_pattern_start), settings.current_shift || undefined)
        : null;

    // Calculate financial metrics
    const revenue = calculateRevenue(jobs);
    const tips = calculateTips(jobs);

    const commission = calculationSettings
        ? calculateCommission(revenue, calculationSettings)
        : { baseCommission: 0, streakBonus: 0, totalCommission: 0 };

    const fixedBonuses = calculationSettings
        ? calculateFixedBonus(revenue, calculationSettings.fixedBonusTiers)
        : 0;

    const remainingToBonus = calculationSettings
        ? getRemainingToNextBonus(revenue, calculationSettings.fixedBonusTiers)
        : null;

    const nextTier = calculationSettings
        ? getNextBonusTier(revenue, calculationSettings.fixedBonusTiers)
        : null;

    // Calculate active commission rate (base + streak)
    const activeCommissionRate = calculationSettings
        ? Math.round((calculationSettings.baseCommissionRate +
            (calculationSettings.streakBonusRate * Math.min(calculationSettings.currentStreakCount, 4))) * 100)
        : 0;

    const handleNavigate = (direction: 'next' | 'prev') => {
        setCurrentDate(prev => navigateWeek(prev, direction));
    };

    if (settingsLoading || jobsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{translations.common.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto p-4 pb-24 space-y-6">
            {/* Week Selector */}
            <WeekSelector
                startDate={start}
                endDate={end}
                onNavigate={handleNavigate}
            />

            {/* Shift Badge */}
            {currentShift && (
                <div className="flex justify-center">
                    <ShiftBadge shift={currentShift} showHours />
                </div>
            )}

            {/* Main Earnings Summary - Most Important */}
            <EarningsSummary
                revenue={revenue}
                commission={commission.totalCommission}
                tips={tips}
                fixedBonuses={fixedBonuses}
                activeCommissionRate={activeCommissionRate}
            />

            {/* Progress Trackers Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Weekly Target */}
                {settings && (
                    <WeeklyTargetCard
                        revenue={revenue}
                        target={settings.weekly_target}
                    />
                )}

                {/* Bonus Progress */}
                {settings && nextTier && (
                    <>
                        <BonusProgress
                            revenue={revenue}
                            nextTierThreshold={nextTier.threshold}
                            nextTierBonus={nextTier.bonus}
                            currentStreak={settings.current_streak_count}
                            maxStreak={4}
                        />
                    </>
                )}
            </div>

            {/* Current Streak Info */}
            {settings && settings.current_streak_count > 0 && (
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">
                        {translations.dashboard.currentStreak.replace('{count}', settings.current_streak_count.toString())}
                    </p>
                </div>
            )}

            {/* FAB - New Job */}
            <Button
                size="lg"
                className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-[60] md:bottom-6"
                onClick={() => setJobFormOpen(true)}
            >
                <Plus className="h-6 w-6" />
            </Button>

            {/* Job Form Dialog */}
            <JobFormDialog
                open={jobFormOpen}
                onOpenChange={setJobFormOpen}
                onSubmit={addJob}
            />
        </div>
    );
}
