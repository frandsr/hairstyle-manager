'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateLong } from '@/lib/utils/date';
import { Calendar, DollarSign, User, Star, Edit, Trash2, StickyNote, TrendingUp } from 'lucide-react';
import type { Job, Client } from '@/lib/types/database';

interface JobDetailDialogProps {
    job: Job | null;
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (job: Job) => void;
    onDelete?: (jobId: string) => void;
}

export function JobDetailDialog({
    job,
    client,
    open,
    onOpenChange,
    onEdit,
    onDelete
}: JobDetailDialogProps) {
    const [deleting, setDeleting] = useState(false);

    if (!job) return null;

    const handleDelete = async () => {
        if (!onDelete) return;

        if (confirm('¿Estás segura de eliminar este trabajo?')) {
            setDeleting(true);
            try {
                await onDelete(job.id);
                onOpenChange(false);
            } catch (error) {
                console.error('Error deleting job:', error);
            } finally {
                setDeleting(false);
            }
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(job);
            onOpenChange(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const totalAmount = job.amount + job.tip_amount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Detalle del Trabajo
                    </DialogTitle>
                    <DialogDescription>
                        Información completa del servicio realizado
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                    {/* Date */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                Fecha
                            </div>
                            <div className="text-lg font-semibold">
                                {formatDateLong(new Date(job.date))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client */}
                    {client ? (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <User className="h-4 w-4" />
                                    Clienta
                                </div>
                                <div className="text-lg font-semibold">
                                    {client.name}
                                </div>
                                {client.phone && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {client.phone}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="italic">Sin clienta asignada</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Amount Breakdown */}
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <DollarSign className="h-4 w-4" />
                                    Servicio
                                </div>
                                <div className="text-lg font-semibold text-green-700">
                                    {formatCurrency(job.amount)}
                                </div>
                            </div>

                            {job.tip_amount > 0 && (
                                <>
                                    <Separator className="bg-green-200" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-green-700">
                                            <TrendingUp className="h-4 w-4" />
                                            Propina
                                        </div>
                                        <div className="text-lg font-semibold text-green-700">
                                            {formatCurrency(job.tip_amount)}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator className="bg-green-200" />

                            <div className="flex items-center justify-between pt-1">
                                <div className="text-sm font-medium text-green-900">
                                    Total
                                </div>
                                <div className="text-2xl font-bold text-green-900">
                                    {formatCurrency(totalAmount)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {job.description && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <StickyNote className="h-4 w-4" />
                                    Descripción
                                </div>
                                <p className="text-sm">
                                    {job.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rating */}
                    {job.rating && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Star className="h-4 w-4" />
                                    Valoración
                                </div>
                                <div className="flex items-center gap-3">
                                    {renderStars(job.rating)}
                                    <Badge variant="secondary" className="text-sm">
                                        {job.rating}/5
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tags */}
                    {job.tags && job.tags.length > 0 && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    Etiquetas
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Actions */}
                {(onEdit || onDelete) && (
                    <DialogFooter className="gap-2 sm:gap-0 flex-shrink-0 pt-4 border-t">
                        {onDelete && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 sm:flex-none"
                            >
                                {deleting ? (
                                    <>Eliminando...</>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </>
                                )}
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                onClick={handleEdit}
                                className="flex-1 sm:flex-none"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
