import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';
import { Target, Zap, CheckCircle2 } from 'lucide-react';

interface BonusTier {
    threshold: number;
    bonus: number;
}

interface BonusProgressProps {
    revenue: number;
    allTiers: BonusTier[];
    nextTierThreshold: number;
    nextTierBonus: number;
    currentStreak: number;
    streakBonusThreshold: number;
    maxStreak?: number;
}

export function BonusProgress({
    revenue,
    allTiers,
    nextTierThreshold,
    nextTierBonus,
    currentStreak,
    streakBonusThreshold,
    maxStreak = 4
}: BonusProgressProps) {
    const tierProgress = nextTierThreshold > 0
        ? Math.min((revenue / nextTierThreshold) * 100, 100)
        : 100;

    const remaining = Math.max(nextTierThreshold - revenue, 0);
    const streakProgress = (currentStreak / maxStreak) * 100;

    // Sort tiers and identify reached ones
    const sortedTiers = [...allTiers].sort((a, b) => a.threshold - b.threshold);
    const reachedTiers = sortedTiers.filter(tier => revenue >= tier.threshold);
    const allBonusesReached = nextTierThreshold === 0;

    return (
        <>
            {/* Fixed Bonus Tier Progress */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        Bonos Fijos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Show reached bonuses */}
                    {reachedTiers.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Bonos Alcanzados</p>
                            {reachedTiers.map((tier, index) => (
                                <div key={index} className="flex items-center justify-between text-sm py-1.5 px-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-muted-foreground">{formatCurrency(tier.threshold)}</span>
                                    </div>
                                    <span className="font-semibold text-green-700 dark:text-green-400">
                                        +{formatCurrency(tier.bonus)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Show next tier progress or completion message */}
                    {allBonusesReached ? (
                        <div className="pt-2 border-t text-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                🎉 ¡Todos los bonos fijos alcanzados!
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                No hay más bonos disponibles esta semana
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Próximo Bono</p>
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="text-muted-foreground">Meta</span>
                                <span className="font-semibold">{formatCurrency(nextTierThreshold)}</span>
                            </div>
                            <Progress value={tierProgress} className="h-2" />
                            <div className="flex items-baseline justify-between text-xs">
                                <span className="text-muted-foreground">Actual: {formatCurrency(revenue)}</span>
                                <span className="text-orange-600 font-medium">
                                    {remaining > 0 ? `Faltan ${formatCurrency(remaining)}` : '¡Alcanzado!'}
                                </span>
                            </div>
                            {nextTierBonus > 0 && (
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Premio</span>
                                        <span className="text-lg font-bold text-orange-500">
                                            {formatCurrency(nextTierBonus)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Streak Bonus Progress */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        Racha de Bonificación
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Threshold progress */}
                    {streakBonusThreshold > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Meta para Activar Racha</p>
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="text-muted-foreground">Umbral</span>
                                <span className="font-semibold">{formatCurrency(streakBonusThreshold)}</span>
                            </div>
                            <Progress
                                value={Math.min((revenue / streakBonusThreshold) * 100, 100)}
                                className="h-2"
                            />
                            <div className="flex items-baseline justify-between text-xs">
                                <span className="text-muted-foreground">Actual: {formatCurrency(revenue)}</span>
                                <span className={`font-medium ${revenue >= streakBonusThreshold ? 'text-green-600' : 'text-purple-600'}`}>
                                    {revenue >= streakBonusThreshold
                                        ? '✓ ¡Alcanzado!'
                                        : `Faltan ${formatCurrency(streakBonusThreshold - revenue)}`}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Current streak info */}
                    <div className={streakBonusThreshold > 0 ? 'pt-2 border-t' : ''}>
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="text-muted-foreground">Racha actual</span>
                                <span className="font-semibold">{currentStreak} de {maxStreak} semanas</span>
                            </div>
                            <Progress value={streakProgress} className="h-2" />
                            <div className="flex items-baseline justify-between text-xs">
                                <span className="text-muted-foreground">
                                    {currentStreak === 0 ? 'Alcanza la meta para empezar' : 'Sigue así para más bonos'}
                                </span>
                                <span className={`font-medium ${currentStreak >= maxStreak ? 'text-green-600' : 'text-purple-600'}`}>
                                    {currentStreak >= maxStreak ? '¡Máximo!' : `+${maxStreak - currentStreak} posibles`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bonus info */}
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Bono por semana</span>
                            <span className="text-lg font-bold text-purple-500">
                                +5%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
