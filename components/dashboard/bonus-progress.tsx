import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';
import { Target, Zap } from 'lucide-react';

interface BonusProgressProps {
    revenue: number;
    nextTierThreshold: number;
    nextTierBonus: number;
    currentStreak: number;
    maxStreak?: number;
}

export function BonusProgress({
    revenue,
    nextTierThreshold,
    nextTierBonus,
    currentStreak,
    maxStreak = 4
}: BonusProgressProps) {
    const tierProgress = nextTierThreshold > 0
        ? Math.min((revenue / nextTierThreshold) * 100, 100)
        : 100;

    const remaining = Math.max(nextTierThreshold - revenue, 0);
    const streakProgress = (currentStreak / maxStreak) * 100;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Fixed Bonus Tier Progress */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        Próximo Bono Fijo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between text-sm">
                            <span className="text-muted-foreground">Racha actual</span>
                            <span className="font-semibold">{currentStreak} de {maxStreak} semanas</span>
                        </div>
                        <Progress value={streakProgress} className="h-2" />
                        <div className="flex items-baseline justify-between text-xs">
                            <span className="text-muted-foreground">
                                {currentStreak === 0 ? 'Alcanza tu meta esta semana' : 'Sigue así para más bonos'}
                            </span>
                            <span className={`font-medium ${currentStreak >= maxStreak ? 'text-green-600' : 'text-purple-600'
                                }`}>
                                {currentStreak >= maxStreak ? '¡Máximo!' : `+${maxStreak - currentStreak} posibles`}
                            </span>
                        </div>
                    </div>
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
        </div>
    );
}
