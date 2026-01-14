'use client';

import { useState, useEffect } from 'react';
import { supabase, isMockAuthMode } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/lib/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { translations } from '@/lib/i18n/es-AR';
import { formatCurrency } from '@/lib/utils/currency';
import { Loader2, Plus, Trash2, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import type { BonusTier } from '@/lib/types/database';

export default function ConfiguracionPage() {
    const router = useRouter();
    const { settings, loading, error, updateSettings, refetch } = useSettings();
    const [saving, setSaving] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    // Form state
    const [weeklyTarget, setWeeklyTarget] = useState('');
    const [baseCommission, setBaseCommission] = useState('');
    const [streakBonus, setStreakBonus] = useState('');
    const [streakThreshold, setStreakThreshold] = useState('');
    const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
    const [currentShift, setCurrentShift] = useState<'morning' | 'afternoon'>('morning');

    // Initialize form when settings load
    useEffect(() => {
        if (settings) {
            setWeeklyTarget(settings.weekly_target.toString());
            setBaseCommission((settings.base_commission_rate * 100).toString());
            setStreakBonus((settings.streak_bonus_rate * 100).toString());
            setStreakThreshold((settings.streak_bonus_threshold || 0).toString());
            setBonusTiers([...settings.fixed_bonus_tiers]);
            // Set current shift from DB, default to morning if null
            setCurrentShift(settings.current_shift || 'morning');
        }
    }, [settings]);

    const handleAddTier = () => {
        setBonusTiers([...bonusTiers, { threshold: 0, bonus: 0 }]);
    };

    const handleRemoveTier = (index: number) => {
        setBonusTiers(bonusTiers.filter((_, i) => i !== index));
    };

    const handleTierChange = (index: number, field: 'threshold' | 'bonus', value: string) => {
        const newTiers = [...bonusTiers];
        // Store as string if empty or being edited, otherwise as number
        // @ts-ignore - Allow string values during editing
        newTiers[index][field] = value === '' ? '' : (parseFloat(value) || 0);
        setBonusTiers(newTiers);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Sort bonus tiers by threshold
            const sortedTiers = [...bonusTiers].sort((a, b) => a.threshold - b.threshold);

            await updateSettings({
                weekly_target: parseFloat(weeklyTarget) || 0,
                base_commission_rate: parseFloat(baseCommission) / 100 || 0,
                streak_bonus_rate: parseFloat(streakBonus) / 100 || 0,
                streak_bonus_threshold: parseFloat(streakThreshold) || 0,
                fixed_bonus_tiers: sortedTiers,
                current_shift: currentShift,
            });

            toast.success(translations.settings.saved);
        } catch (error) {
            toast.error('Error al guardar la configuración');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setSigningOut(true);

            // Only sign out if not in mock auth mode
            if (!isMockAuthMode()) {
                await supabase.auth.signOut();
            }

            // Redirect to login
            router.push('/login');
            toast.success('Sesión cerrada exitosamente');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Error al cerrar sesión');
        } finally {
            setSigningOut(false);
        }
    };

    // Handle error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
                <p className="text-red-500 mb-4">Error al cargar la configuración</p>
                <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => refetch()} variant="outline">
                    Reintentar
                </Button>
            </div>
        );
    }

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">{translations.common.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto p-4 space-y-6 pb-24">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{translations.settings.title}</h1>
                <p className="text-muted-foreground">
                    Configura tus objetivos y parámetros de comisión
                </p>
            </div>

            {/* Weekly Target */}
            <Card>
                <CardHeader>
                    <CardTitle>Objetivo Semanal</CardTitle>
                    <CardDescription>
                        Meta de facturación semanal (propinas no incluidas)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="weekly-target">{translations.settings.weeklyTarget}</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">$</span>
                            <Input
                                id="weekly-target"
                                type="number"
                                value={weeklyTarget}
                                onChange={(e) => setWeeklyTarget(e.target.value)}
                                placeholder="150000"
                                className="flex-1"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Actual: {formatCurrency(settings.weekly_target)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Commission Rates */}
            <Card>
                <CardHeader>
                    <CardTitle>Tasas de Comisión</CardTitle>
                    <CardDescription>
                        Porcentajes de comisión sobre facturación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="base-commission">{translations.settings.baseCommissionRate}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="base-commission"
                                type="number"
                                value={baseCommission}
                                onChange={(e) => setBaseCommission(e.target.value)}
                                placeholder="40"
                                className="flex-1"
                            />
                            <span className="text-muted-foreground">%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Actual: {(settings.base_commission_rate * 100).toFixed(0)}%
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="streak-bonus">{translations.settings.streakBonusRate}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="streak-bonus"
                                type="number"
                                value={streakBonus}
                                onChange={(e) => setStreakBonus(e.target.value)}
                                placeholder="5"
                                className="flex-1"
                            />
                            <span className="text-muted-foreground">% por semana</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Actual: {(settings.streak_bonus_rate * 100).toFixed(0)}% por semana (máx 4 semanas)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="streak-threshold">Meta para Racha</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xl">$</span>
                            <Input
                                id="streak-threshold"
                                type="number"
                                value={streakThreshold}
                                onChange={(e) => setStreakThreshold(e.target.value)}
                                placeholder="500000"
                                className="flex-1"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Facturación mínima para activar el bono por racha. Actual: {formatCurrency(settings.streak_bonus_threshold || 0)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Bonus Tiers */}
            <Card>
                <CardHeader>
                    <CardTitle>{translations.settings.fixedBonusTiers}</CardTitle>
                    <CardDescription>
                        Bonos fijos al alcanzar ciertos niveles de facturación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bonusTiers.map((tier, index) => (
                        <div key={index} className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`tier-threshold-${index}`}>
                                    {translations.settings.bonusTierThreshold}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">$</span>
                                    <Input
                                        id={`tier-threshold-${index}`}
                                        type="number"
                                        value={tier.threshold}
                                        onChange={(e) => handleTierChange(index, 'threshold', e.target.value)}
                                        placeholder="100000"
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`tier-bonus-${index}`}>
                                    {translations.settings.bonusTierAmount}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">$</span>
                                    <Input
                                        id={`tier-bonus-${index}`}
                                        type="number"
                                        value={tier.bonus}
                                        onChange={(e) => handleTierChange(index, 'bonus', e.target.value)}
                                        placeholder="10000"
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveTier(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <Button variant="outline" onClick={handleAddTier} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {translations.settings.addTier}
                    </Button>
                </CardContent>
            </Card>

            {/* Shift Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Turno de Trabajo</CardTitle>
                    <CardDescription>
                        El turno se alterna automáticamente cada semana. Puedes cambiarlo manualmente aquí si es necesario.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={currentShift}
                        onValueChange={(val) => setCurrentShift(val as 'morning' | 'afternoon')}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="morning" id="morning" />
                            <Label htmlFor="morning">
                                ☀️ Turno Mañana
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="afternoon" id="afternoon" />
                            <Label htmlFor="afternoon">
                                🌙 Turno Tarde
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 sticky bottom-16 bg-background pt-4 pb-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {translations.settings.save}
                        </>
                    )}
                </Button>

                <Button variant="outline" className="gap-2" onClick={handleSignOut} disabled={signingOut}>
                    {signingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="h-4 w-4" />
                    )}
                    {translations.auth.signOut}
                </Button>
            </div>
        </div >
    );
}
