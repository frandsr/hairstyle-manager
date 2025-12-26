'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatWeekRange } from '@/lib/utils/date';
import { translations } from '@/lib/i18n/es-AR';

interface WeekSelectorProps {
    startDate: Date;
    endDate: Date;
    onNavigate: (direction: 'next' | 'prev') => void;
}

export function WeekSelector({ startDate, endDate, onNavigate }: WeekSelectorProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate('prev')}
                className="h-9 w-9"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    {translations.dashboard.week}
                </p>
                <p className="text-lg font-semibold">
                    {formatWeekRange(startDate, endDate)}
                </p>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate('next')}
                className="h-9 w-9"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
