import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { Sparkles, TrendingUp, DollarSign } from 'lucide-react';

interface EarningsSummaryProps {
    revenue: number;
    commission: number;
    tips: number;
    fixedBonuses: number;
    activeCommissionRate: number; // Total % including base + streak
}

export function EarningsSummary({
    revenue,
    commission,
    tips,
    fixedBonuses,
    activeCommissionRate
}: EarningsSummaryProps) {
    const totalEarnings = commission + fixedBonuses + tips;

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Mi Bolsillo Esta Semana
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Total Earnings */}
                <div>
                    <p className="text-4xl font-bold text-purple-900">
                        {formatCurrency(totalEarnings)}
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                        Ganancia Total
                    </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 pt-3 border-t border-purple-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-700 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Facturación
                        </span>
                        <span className="font-semibold text-purple-900">
                            {formatCurrency(revenue)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-700 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Comisión ({activeCommissionRate}%)
                        </span>
                        <span className="font-semibold text-purple-900">
                            {formatCurrency(commission)}
                        </span>
                    </div>

                    {fixedBonuses > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-700">🎁 Bonos Fijos</span>
                            <span className="font-semibold text-purple-900">
                                {formatCurrency(fixedBonuses)}
                            </span>
                        </div>
                    )}

                    {tips > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-700">💰 Propinas</span>
                            <span className="font-semibold text-purple-900">
                                {formatCurrency(tips)}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
