'use client';

import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';

interface RevenueRingProps {
    current: number;
    target: number;
}

export function RevenueRing({ current, target }: RevenueRingProps) {
    const percentage = Math.min((current / target) * 100, 100);
    const remaining = Math.max(target - current, 0);

    // Color based on progress
    const getProgressColor = () => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                {/* Circular progress representation */}
                <div className="flex items-center justify-center h-48 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl font-bold">
                                {percentage.toFixed(0)}%
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {remaining > 0 ? `Faltan ${formatCurrency(remaining)}` : '¡Objetivo!'}
                            </div>
                        </div>
                    </div>

                    {/* SVG Circle */}
                    <svg className="w-48 h-48 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-muted opacity-20"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            className={percentage >= 100 ? 'text-green-500' : percentage >= 70 ? 'text-yellow-500' : 'text-primary'}
                            strokeDasharray={`${(percentage / 100) * (2 * Math.PI * 88)} ${2 * Math.PI * 88}`}
                        />
                    </svg>
                </div>
            </div>

            {/* Progress bar alternative for smaller screens */}
            <div className="md:hidden space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="font-medium">{formatCurrency(current)}</span>
                    <span className="text-muted-foreground">{formatCurrency(target)}</span>
                </div>
                <Progress value={percentage} className="h-3" />
            </div>
        </div>
    );
}
