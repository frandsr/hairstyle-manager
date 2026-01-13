'use client';

import { useState, useEffect } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/lib/i18n/es-AR';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Job } from '@/lib/types/database';
import { COMMON_TAGS } from '@/lib/constants/tags';

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
        tags: string[];
    }) => Promise<void>;
    initialData?: Job;
    onClientAdded?: () => Promise<void>;
}

export function JobFormDialog({ open, onOpenChange, onSubmit, initialData, onClientAdded }: JobFormDialogProps) {
    const { clients, loading: clientsLoading, refetch } = useClients();
    const [saving, setSaving] = useState(false);
    // const [showNewClientForm, setShowNewClientForm] = useState(false); // Removed
    // const [addingClient, setAddingClient] = useState(false); // Removed

    // Form state
    const [clientId, setClientId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [tipAmount, setTipAmount] = useState('0');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState<string>('5');
    const [tags, setTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    // Client form dialog state
    const [clientFormOpen, setClientFormOpen] = useState(false);
    const [lastClientCount, setLastClientCount] = useState(0);

    // New client form state (Removed)
    // const [newClientName, setNewClientName] = useState('');
    // const [newClientPhone, setNewClientPhone] = useState('');
    // const [newClientNotes, setNewClientNotes] = useState('');

    // Initialize form when initialData changes
    useEffect(() => {
        if (initialData) {
            setClientId(initialData.client_id || '');
            setAmount(initialData.amount.toString());
            setTipAmount(initialData.tip_amount.toString());
            setDate(initialData.date.split('T')[0]);
            setDescription(initialData.description || '');
            setRating(initialData.rating?.toString() || '5');
            setTags(initialData.tags || []);
        } else {
            // Reset form for new job
            setClientId('');
            setAmount('');
            setTipAmount('0');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setRating('5');
            setTags([]);
        }
    }, [initialData, open]);

    const handleClientAdded = async () => {
        // Store current count before refreshing
        setLastClientCount(clients.length);
        // Refresh the client list in this component's useClients instance
        await refetch();
        // Also refresh parent's client list if callback provided
        if (onClientAdded) {
            await onClientAdded();
        }
    };

    // Auto-select newest client when clients list grows
    useEffect(() => {
        if (lastClientCount > 0 && clients.length > lastClientCount) {
            // New client was added, select the newest one
            const newestClient = clients[clients.length - 1];
            if (newestClient) {
                setClientId(newestClient.id);
                toast.success(`Cliente "${newestClient.name}" seleccionada`);
            }
            setLastClientCount(0); // Reset flag
        }
    }, [clients, lastClientCount]);

    const toggleTag = (tag: string) => {
        setTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const addCustomTag = () => {
        const trimmed = customTag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed]);
            setCustomTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate client selection
        if (!clientId) {
            toast.error('Selecciona o crea una clienta para continuar');
            return;
        }

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
                tags,
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
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
                                <Label htmlFor="client">{translations.jobs.client} *</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setClientFormOpen(true)}
                                    className="h-7 text-xs"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Nueva Clienta
                                </Button>
                            </div>

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
                                    max="10000000"
                                    step="1"
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
                                    max="10000000"
                                    step="1"
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

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label>Etiquetas</Label>

                            {/* Selected tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
                                    {tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="gap-1 pr-1"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Common tags */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Etiquetas comunes:</p>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_TAGS.map(tag => (
                                        <Badge
                                            key={tag}
                                            variant={tags.includes(tag) ? "default" : "outline"}
                                            className="cursor-pointer hover:opacity-80"
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Custom tag input */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Agregar etiqueta personalizada..."
                                    value={customTag}
                                    onChange={(e) => setCustomTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomTag();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={addCustomTag}
                                    disabled={!customTag.trim()}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
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

            {/* Nested Client Form Dialog */}
            <ClientFormDialog
                open={clientFormOpen}
                onOpenChange={setClientFormOpen}
                onSuccess={handleClientAdded}
            />
        </>
    );
}
