'use client';

import { useState } from 'react';
import { Plus, DollarSign, Coins, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ShiftBadge } from '@/components/dashboard/shift-badge';
import { WeekSelector } from '@/components/dashboard/week-selector';
import { RevenueRing } from '@/components/dashboard/revenue-ring';
import { BonusAlert } from '@/components/dashboard/bonus-alert';
import { BonusProgress } from '@/components/dashboard/bonus-progress';
import { JobFormDialog } from '@/components/jobs/job-form-dialog';
import { useSettings } from '@/lib/hooks/use-settings';
import { useWeekJobs } from '@/lib/hooks/use-jobs';
import { getWeekBounds, navigateWeek } from '@/lib/utils/date';
import { getCurrentShift } from '@/lib/calculations/shifts';
import { calculateCommission, getRemainingToNextBonus, getNextBonusTier } from '@/lib/calculations/commission';
import { calculateRevenue, calculateTips, calculateEarnings } from '@/lib/calculations/earnings';
import { translations } from '@/lib/i18n/es-AR';

export default function DashboardPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [jobFormOpen, setJobFormOpen] = useState(false);
    const { start, end } = getWeekBounds(currentDate);

    const { settings, calculationSettings, loading: settingsLoading } = useSettings();
    const { jobs, loading: jobsLoading, addJob } = useWeekJobs(currentDate);

    // Calculate shift
    const currentShift = settings
        ? getCurrentShift(currentDate, new Date(settings.shift_pattern_start))
        : null;

    // Calculate financial metrics
    const revenue = calculateRevenue(jobs);
    const tips = calculateTips(jobs);

    const commission = calculationSettings
        ? calculateCommission(revenue, calculationSettings)
        : { baseCommission: 0, streakBonus: 0, totalCommission: 0 };

    const totalEarnings = calculateEarnings(commission.totalCommission, tips);

    const remainingToBonus = calculationSettings
        ? getRemainingToNextBonus(revenue, calculationSettings.fixedBonusTiers)
        : null;

    const nextTier = calculationSettings
        ? getNextBonusTier(revenue, calculationSettings.fixedBonusTiers)
        : null;

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

            {/* Revenue Ring */}
            {settings && (
                <div className="flex justify-center">
                    <RevenueRing
                        current={revenue}
                        target={settings.weekly_target}
                    />
                </div>
            )}

            {/* Bonus Alert */}
            <BonusAlert remaining={remainingToBonus} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title={translations.dashboard.revenue}
                    value={revenue}
                    icon={<DollarSign className="h-6 w-6" />}
                />
                <StatsCard
                    title={translations.dashboard.commission}
                    value={commission.totalCommission}
                    icon={<TrendingUp className="h-6 w-6" />}
                />
                <StatsCard
                    title={translations.dashboard.tips}
                    value={tips}
                    icon={<Coins className="h-6 w-6" />}
                />
                <StatsCard
                    title={translations.dashboard.totalEarnings}
                    value={totalEarnings}
                    icon={<Wallet className="h-6 w-6" />}
                    className="col-span-2"
                />
            </div>

            {/* Bonus Progress Indicators */}
            {settings && nextTier && (
                <BonusProgress
                    revenue={revenue}
                    nextTierThreshold={nextTier.threshold}
                    nextTierBonus={nextTier.bonus}
                    currentStreak={settings.current_streak_count}
                    maxStreak={4}
                />
            )}

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
