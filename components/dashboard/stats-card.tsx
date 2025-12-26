'use client';

import { formatCurrency } from '@/lib/utils/currency';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
    title: string;
    value: number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(value)}</p>
                        {trend && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {trend.value > 0 ? '+' : ''}{formatCurrency(trend.value)} {trend.label}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className="ml-4 text-muted-foreground opacity-50">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
