'use client';

import { useState, useEffect } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { translations } from '@/lib/i18n/es-AR';
import { Loader2, Flag } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/lib/types/database';

interface ClientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Client;
    onSuccess?: () => void;
}

export function ClientFormDialog({ open, onOpenChange, initialData, onSuccess }: ClientFormDialogProps) {
    const { addClient, updateClient } = useClients();
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'good' | 'warning' | 'bad'>('good');

    // Initialize form when initialData changes or dialog opens
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPhone(initialData.phone || '');
            setNotes(initialData.notes || '');
            setStatus(initialData.status);
        } else {
            // Reset form for new client
            setName('');
            setPhone('');
            setNotes('');
            setStatus('good');
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Ingresa el nombre de la clienta');
            return;
        }

        // Validate phone number if provided
        if (phone.trim()) {
            // Argentine phone pattern: +54 9 11 1234-5678 or similar formats
            const phonePattern = /^\+?54\s?9?\s?\d{2,4}\s?\d{4}-?\d{4}$|^\d{10,13}$/;
            if (!phonePattern.test(phone.trim().replace(/\s+/g, ' '))) {
                toast.error('Ingresa un número de teléfono válido (ej: +54 9 11 2345-6789)');
                return;
            }
        }

        try {
            setSaving(true);

            if (initialData) {
                // Update existing client
                await updateClient(initialData.id, {
                    name: name.trim(),
                    phone: phone.trim() || null,
                    notes: notes.trim() || null,
                    status,
                });
                toast.success('Clienta actualizada exitosamente');
            } else {
                // Create new client
                await addClient({
                    name: name.trim(),
                    phone: phone.trim() || null,
                    notes: notes.trim() || null,
                    status,
                });
                toast.success('Clienta agregada exitosamente');
            }

            // Trigger parent refresh
            if (onSuccess) {
                onSuccess();
            }

            // Close dialog and reset form
            onOpenChange(false);
        } catch (error) {
            toast.error(initialData ? 'Error al actualizar la clienta' : 'Error al agregar la clienta');
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
                        {initialData ? translations.clients.editClient : translations.clients.newClient}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Modifica los datos de la clienta'
                            : 'Agrega una nueva clienta a tu lista'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{translations.clients.name} *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ana García"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">{translations.clients.phone}</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+54 9 11 2345-6789"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">{translations.clients.notes}</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas sobre la clienta..."
                            rows={3}
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado de clienta</Label>
                        <Select value={status} onValueChange={(value) => setStatus(value as 'good' | 'warning' | 'bad')}>
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="good">
                                    <div className="flex items-center gap-2">
                                        <Flag className="h-4 w-4 text-green-600" />
                                        <span>Buena clienta</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="warning">
                                    <div className="flex items-center gap-2">
                                        <Flag className="h-4 w-4 text-yellow-600" />
                                        <span>Regular</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="bad">
                                    <div className="flex items-center gap-2">
                                        <Flag className="h-4 w-4 text-red-600" />
                                        <span>Problemática</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                        >
                            {translations.common.cancel}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                translations.common.save
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
