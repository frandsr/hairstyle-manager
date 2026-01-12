'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '../hooks/use-settings';

type ShiftTheme = 'morning' | 'afternoon';

interface ShiftThemeContextType {
    shift: ShiftTheme;
}

const ShiftThemeContext = createContext<ShiftThemeContextType | undefined>(undefined);

export function ShiftThemeProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useSettings();
    const [shift, setShift] = useState<ShiftTheme>('morning');

    // Track settings changes and update shift
    useEffect(() => {
        if (settings) {
            const newShift = settings.current_shift || 'morning';
            console.log('[ShiftTheme] Settings changed, new shift:', newShift);
            console.log('[ShiftTheme] Settings timestamp:', settings.updated_at);
            setShift(newShift);
        } else {
            console.log('[ShiftTheme] No settings, using default morning');
            setShift('morning');
        }
    }, [settings, settings?.updated_at]); // Watch settings object and timestamp


    // Apply shift data attribute to document element
    useEffect(() => {
        console.log('[ShiftTheme] Applying data-shift attribute:', shift);
        document.documentElement.setAttribute('data-shift', shift);

        // Verify it was set
        const actualValue = document.documentElement.getAttribute('data-shift');
        console.log('[ShiftTheme] Verified data-shift value:', actualValue);
    }, [shift]);

    return (
        <ShiftThemeContext.Provider value={{ shift }}>
            {children}
        </ShiftThemeContext.Provider>
    );
}

export function useShiftTheme() {
    const context = useContext(ShiftThemeContext);
    if (context === undefined) {
        throw new Error('useShiftTheme must be used within a ShiftThemeProvider');
    }
    return context;
}
