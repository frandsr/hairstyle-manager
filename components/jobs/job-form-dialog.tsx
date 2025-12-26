'use client';

import { useState, useEffect } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translations } from '@/lib/i18n/es-AR';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Job } from '@/lib/types/database';

interface JobFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (job: {
        client_id: string | null;
        amount: number;
        tip_amount: number;
        date: string;
        description: string;
        rating: number | null;
    }) => Promise<void>;
    initialData?: Job;
}

export function JobFormDialog({ open, onOpenChange, onSubmit, initialData }: JobFormDialogProps) {
    const { clients, loading: clientsLoading, addClient, refetch } = useClients();
    const [saving, setSaving] = useState(false);
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [addingClient, setAddingClient] = useState(false);

    // Form state
    const [clientId, setClientId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [tipAmount, setTipAmount] = useState('0');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState<string>('5');

    // New client form state
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientNotes, setNewClientNotes] = useState('');

    // Initialize form when initialData changes
    useEffect(() => {
        if (initialData) {
            setClientId(initialData.client_id || '');
            setAmount(initialData.amount.toString());
            setTipAmount(initialData.tip_amount.toString());
            setDate(initialData.date.split('T')[0]);
            setDescription(initialData.description || '');
            setRating(initialData.rating?.toString() || '5');
        } else {
            // Reset form for new job
            setClientId('');
            setAmount('');
            setTipAmount('0');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setRating('5');
        }
        setShowNewClientForm(false);
    }, [initialData, open]);

    const handleAddNewClient = async () => {
        if (!newClientName.trim()) {
            toast.error('Ingresa el nombre de la clienta');
            return;
        }

        try {
            setAddingClient(true);

            const newClient = await addClient({
                name: newClientName.trim(),
                phone: newClientPhone.trim() || null,
                notes: newClientNotes.trim() || null,
            });

            // Refresh clients list
            await refetch();

            // Select the newly created client
            if (newClient && 'id' in newClient) {
                setClientId(newClient.id);
            }

            // Reset new client form
            setNewClientName('');
            setNewClientPhone('');
            setNewClientNotes('');
            setShowNewClientForm(false);

            toast.success('Clienta agregada exitosamente');
        } catch (error) {
            toast.error('Error al agregar la clienta');
            console.error(error);
        } finally {
            setAddingClient(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        try {
            setSaving(true);

            await onSubmit({
                client_id: clientId || null,
                amount: parseFloat(amount),
                tip_amount: parseFloat(tipAmount) || 0,
                date: new Date(date).toISOString(),
                description: description.trim(),
                rating: rating ? parseInt(rating) : null,
            });

            onOpenChange(false);
            toast.success(initialData ? 'Trabajo actualizado' : 'Trabajo agregado exitosamente');
        } catch (error) {
            toast.error('Error al guardar el trabajo');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Trabajo' : translations.jobs.newJob}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Modifica los detalles del trabajo realizado'
                            : 'Registra un nuevo trabajo realizado'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Client */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="client">{translations.jobs.client}</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNewClientForm(!showNewClientForm)}
                                className="h-7 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Nueva Clienta
                            </Button>
                        </div>

                        {!showNewClientForm ? (
                            <>
                                <Select value={clientId} onValueChange={setClientId}>
                                    <SelectTrigger id="client">
                                        <SelectValue placeholder="Seleccionar clienta (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientsLoading ? (
                                            <SelectItem value="loading-placeholder" disabled>
                                                Cargando...
                                            </SelectItem>
                                        ) : (
                                            clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {clientId && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setClientId('')}
                                        className="text-xs h-6"
                                    >
                                        Limpiar selección
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="p-3 border rounded-lg space-y-3 bg-muted/50">
                                <div className="space-y-2">
                                    <Label htmlFor="new-client-name" className="text-xs">
                                        Nombre *
                                    </Label>
                                    <Input
                                        id="new-client-name"
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        placeholder="María García"
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-client-phone" className="text-xs">
                                        Teléfono
                                    </Label>
                                    <Input
                                        id="new-client-phone"
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(e.target.value)}
                                        placeholder="+54 11 1234-5678"
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-client-notes" className="text-xs">
                                        Notas
                                    </Label>
                                    <Input
                                        id="new-client-notes"
                                        value={newClientNotes}
                                        onChange={(e) => setNewClientNotes(e.target.value)}
                                        placeholder="Preferencias, alergias, etc."
                                        className="h-9"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowNewClientForm(false);
                                            setNewClientName('');
                                            setNewClientPhone('');
                                            setNewClientNotes('');
                                        }}
                                        className="flex-1"
                                        disabled={addingClient}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddNewClient}
                                        className="flex-1"
                                        disabled={addingClient}
                                    >
                                        {addingClient ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                Agregando...
                                            </>
                                        ) : (
                                            'Agregar'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">{translations.jobs.amount} *</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">$</span>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="25000"
                                required
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="space-y-2">
                        <Label htmlFor="tip">{translations.jobs.tip}</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">$</span>
                            <Input
                                id="tip"
                                type="number"
                                value={tipAmount}
                                onChange={(e) => setTipAmount(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">{translations.jobs.date} *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{translations.jobs.description}</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Corte y color"
                        />
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label htmlFor="rating">{translations.jobs.rating}</Label>
                        <Select value={rating} onValueChange={setRating}>
                            <SelectTrigger id="rating">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ Excelente</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐ Muy bueno</SelectItem>
                                <SelectItem value="3">⭐⭐⭐ Bueno</SelectItem>
                                <SelectItem value="2">⭐⭐ Regular</SelectItem>
                                <SelectItem value="1">⭐ Malo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={saving}
                        >
                            {translations.common.cancel}
                        </Button>
                        <Button type="submit" className="flex-1" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                translations.common.save
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
