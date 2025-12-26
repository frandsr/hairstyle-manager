import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';
import { Target } from 'lucide-react';

interface WeeklyTargetCardProps {
    revenue: number;
    target: number;
}

export function WeeklyTargetCard({ revenue, target }: WeeklyTargetCardProps) {
    const progress = target > 0 ? Math.min((revenue / target) * 100, 100) : 0;
    const remaining = Math.max(target - revenue, 0);
    const achieved = revenue >= target;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Objetivo Semanal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="text-muted-foreground">Meta</span>
                        <span className="font-semibold">{formatCurrency(target)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-baseline justify-between text-xs">
                        <span className="text-muted-foreground">
                            Facturación: {formatCurrency(revenue)}
                        </span>
                        <span className={`font-medium ${achieved ? 'text-green-600' : 'text-blue-600'
                            }`}>
                            {achieved ? '¡Alcanzado!' : `Faltan ${formatCurrency(remaining)}`}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
