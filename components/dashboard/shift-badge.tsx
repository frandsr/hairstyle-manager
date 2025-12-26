'use client';

import { Badge } from '@/components/ui/badge';
import type { Shift } from '@/lib/calculations/shifts';

interface ShiftBadgeProps {
    shift: Shift;
    showHours?: boolean;
}

export function ShiftBadge({ shift, showHours = false }: ShiftBadgeProps) {
    const bgColor = shift.type === 'morning'
        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
        : 'bg-purple-100 text-purple-900 hover:bg-purple-200';

    return (
        <Badge variant="secondary" className={`${bgColor} px-3 py-1.5 text-sm font-medium`}>
            <span className="mr-1.5">{shift.emoji}</span>
            {shift.label}
            {showHours && <span className="ml-2 text-xs opacity-75">({shift.hours})</span>}
        </Badge>
    );
}
