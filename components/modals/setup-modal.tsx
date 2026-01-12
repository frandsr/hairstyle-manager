'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/lib/hooks/use-settings';
import { areEssentialSettingsConfigured } from '@/lib/utils/settings-validation';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Info } from 'lucide-react';

export function SetupModal() {
    const { settings, loading } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [weeklyTarget, setWeeklyTarget] = useState('');
    const [baseCommission, setBaseCommission] = useState('');
    const [currentShift, setCurrentShift] = useState<'morning' | 'afternoon'>('morning');

    // Check if modal should show
    // Only show for first-time users (no settings_history records) AND after loading completes
    const shouldShowSetup = !loading && settings === null;

    // Update modal open state when shouldShowSetup changes
    useEffect(() => {
        setIsOpen(shouldShowSetup);
    }, [shouldShowSetup]);

    const handleSave = async () => {
        // Validate
        const target = parseInt(weeklyTarget);
        const commission = parseFloat(baseCommission);

        if (isNaN(target) || target <= 0) {
            alert('Por favor ingresa una meta semanal válida');
            return;
        }

        if (isNaN(commission) || commission <= 0 || commission > 100) {
            alert('Por favor ingresa una comisión base válida (0-100%)');
            return;
        }

        try {
            setSaving(true);

            // For first-time setup, directly insert a new settings_history record
            // instead of using updateSettings which expects existing settings
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay() + (settings?.week_start_day || 6));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const { error } = await supabase
                .from('settings_history')
                .insert({
                    user_id: user.id,
                    weekly_target: target,
                    base_commission_rate: commission / 100,
                    streak_bonus_rate: 0.05, // Default 5%
                    streak_bonus_threshold: 1200000, // Default threshold
                    fixed_bonus_tiers: [],
                    week_start_day: 6, // Saturday
                    current_shift: currentShift,
                    streak_threshold_met: false,
                    effective_from: weekStart.toISOString(),
                    effective_to: weekEnd.toISOString(),
                });

            if (error) throw error;

            setIsOpen(false);

            // Reload page to ensure all components display updated values
            window.location.reload();
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error al guardar la configuración. Por favor intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (!shouldShowSetup) return null;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        🎉 ¡Bienvenido a EstilistaPro!
                    </DialogTitle>
                    <DialogDescription>
                        Configura tus datos básicos para comenzar a usar la aplicación
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Weekly Target */}
                    <div className="space-y-2">
                        <Label htmlFor="setup-weekly-target">
                            Meta Semanal de Facturación
                        </Label>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">$</span>
                            <Input
                                id="setup-weekly-target"
                                type="number"
                                value={weeklyTarget}
                                onChange={(e) => setWeeklyTarget(e.target.value)}
                                placeholder="1500000"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Base Commission */}
                    <div className="space-y-2">
                        <Label htmlFor="setup-base-commission">
                            Porcentaje de Comisión Base
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="setup-base-commission"
                                type="number"
                                value={baseCommission}
                                onChange={(e) => setBaseCommission(e.target.value)}
                                placeholder="25"
                                className="flex-1"
                            />
                            <span className="text-muted-foreground">%</span>
                        </div>
                    </div>

                    {/* Current Shift */}
                    <div className="space-y-2">
                        <Label>Turno de Trabajo</Label>
                        <RadioGroup
                            value={currentShift}
                            onValueChange={(val) => setCurrentShift(val as 'morning' | 'afternoon')}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="morning" id="setup-morning" />
                                <Label htmlFor="setup-morning">☀️ Turno Mañana</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="afternoon" id="setup-afternoon" />
                                <Label htmlFor="setup-afternoon">🌙 Turno Tarde</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Info about additional configuration */}
                    <div className="flex gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            Puedes configurar bonos fijos, rachas y otros ajustes avanzados desde la página de Configuración más adelante.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Comenzar →'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
