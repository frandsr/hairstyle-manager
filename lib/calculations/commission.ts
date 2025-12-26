export interface Settings {
    weeklyTarget: number;
    baseCommissionRate: number; // As decimal (e.g., 0.15 for 15%)
    streakBonusRate: number; // As decimal (e.g., 0.05 for 5%)
    currentStreakCount: number;
    fixedBonusTiers: BonusTier[];
}

export interface BonusTier {
    threshold: number; // Revenue threshold
    bonus: number; // Fixed bonus amount
}

/**
 * Calculate total commission including base rate and streak bonus
 * Streak bonus stacks up to 4 weeks maximum
 */
export function calculateCommission(
    revenue: number,
    settings: Settings
): {
    baseCommission: number;
    streakBonus: number;
    totalCommission: number;
} {
    // Base commission
    const baseCommission = revenue * settings.baseCommissionRate;

    // Streak bonus (capped at 4 weeks)
    const effectiveStreakCount = Math.min(settings.currentStreakCount, 4);
    const streakBonus = revenue * (settings.streakBonusRate * effectiveStreakCount);

    // Total commission
    const totalCommission = baseCommission + streakBonus;

    return {
        baseCommission,
        streakBonus,
        totalCommission,
    };
}

/**
 * Calculate fixed bonus based on revenue tiers
 * Returns the highest bonus tier achieved
 */
export function calculateFixedBonus(revenue: number, tiers: BonusTier[]): number {
    if (!tiers || tiers.length === 0) return 0;

    // Sort tiers by threshold descending
    const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);

    // Find the highest tier that was reached
    for (const tier of sortedTiers) {
        if (revenue >= tier.threshold) {
            return tier.bonus;
        }
    }

    return 0;
}

/**
 * Find the next bonus tier that hasn't been reached yet
 */
export function getNextBonusTier(revenue: number, tiers: BonusTier[]): BonusTier | null {
    if (!tiers || tiers.length === 0) return null;

    // Sort tiers by threshold ascending
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);

    // Find the next tier above current revenue
    for (const tier of sortedTiers) {
        if (revenue < tier.threshold) {
            return tier;
        }
    }

    return null; // All tiers reached
}

/**
 * Calculate remaining amount to reach next bonus tier
 */
export function getRemainingToNextBonus(revenue: number, tiers: BonusTier[]): number | null {
    const nextTier = getNextBonusTier(revenue, tiers);

    if (!nextTier) return null;

    return nextTier.threshold - revenue;
}
