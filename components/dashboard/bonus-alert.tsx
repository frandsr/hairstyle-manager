'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils/currency';
import { translations } from '@/lib/i18n/es-AR';

interface BonusAlertProps {
    remaining: number | null;
}

export function BonusAlert({ remaining }: BonusAlertProps) {
    if (remaining === null || remaining <= 0) {
        return null;
    }

    const message = translations.dashboard.bonusAlert.replace(
        '{amount}',
        formatCurrency(remaining)
    );

    return (
        <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 font-medium">
                {message}
            </AlertDescription>
        </Alert>
    );
}
