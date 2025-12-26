'use client';

import { useMemo, useState } from 'react';
import { useJobs } from '@/lib/hooks/use-jobs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateLong } from '@/lib/utils/date';
import { Calendar, DollarSign, Star, TrendingUp, User, Phone, StickyNote } from 'lucide-react';
import { JobDetailDialog } from '@/components/jobs/job-detail-dialog';
import type { Client, Job } from '@/lib/types/database';

interface ClientDetailDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientDetailDialog({ client, open, onOpenChange }: ClientDetailDialogProps) {
    const { jobs, deleteJob, updateJob } = useJobs();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobDetailOpen, setJobDetailOpen] = useState(false);

    // Filter jobs for this client
    const clientJobs = useMemo(() => {
        if (!client) return [];
        return jobs
            .filter(job => job.client_id === client.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [jobs, client]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalSpent = clientJobs.reduce((sum, job) => sum + job.amount, 0);
        const totalTips = clientJobs.reduce((sum, job) => sum + job.tip_amount, 0);
        const avgRating = clientJobs.length > 0
            ? clientJobs.reduce((sum, job) => sum + (job.rating || 0), 0) / clientJobs.filter(j => j.rating).length
            : 0;

        return {
            totalSpent,
            totalTips,
            visitCount: clientJobs.length,
            avgRating: avgRating > 0 ? avgRating.toFixed(1) : null,
        };
    }, [clientJobs]);

    const renderStars = (rating: number | null) => {
        if (!rating) return null;
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (!client) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {client.name}
                    </DialogTitle>
                    <DialogDescription>
                        Historial completo de trabajos y estadísticas
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Client Info */}
                    <Card>
                        <CardContent className="pt-4 space-y-2">
                            {client.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.phone}</span>
                                </div>
                            )}
                            {client.notes && (
                                <div className="flex items-start gap-2 text-sm">
                                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span className="text-muted-foreground">{client.notes}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {stats.visitCount}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Visitas
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4 text-center px-2">
                                <div className="text-lg font-bold text-green-600 break-words">
                                    {formatCurrency(stats.totalSpent)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Total Gastado
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4 text-center">
                                {stats.avgRating ? (
                                    <>
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {stats.avgRating} ⭐
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Valoración
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold text-muted-foreground">
                                            -
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Sin valorar
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    {/* Jobs List */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Historial de Trabajos ({clientJobs.length})
                        </h3>

                        {clientJobs.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No hay trabajos registrados para esta clienta
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {clientJobs.map((job) => (
                                    <Card
                                        key={job.id}
                                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setJobDetailOpen(true);
                                        }}
                                    >
                                        <CardContent className="p-3 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="text-sm font-medium">
                                                        {formatDateLong(new Date(job.date))}
                                                    </div>

                                                    {job.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {job.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-3 text-sm">
                                                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                                                            <DollarSign className="h-3 w-3" />
                                                            {formatCurrency(job.amount)}
                                                        </div>

                                                        {job.tip_amount > 0 && (
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <TrendingUp className="h-3 w-3" />
                                                                +{formatCurrency(job.tip_amount)} propina
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {job.rating && (
                                                    <div className="ml-2">
                                                        {renderStars(job.rating)}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>

            {/* Job Detail Dialog */}
            <JobDetailDialog
                job={selectedJob}
                client={client}
                open={jobDetailOpen}
                onOpenChange={setJobDetailOpen}
                onEdit={(job) => {
                    // Handle edit - could integrate with a job form
                    console.log('Edit job:', job);
                }}
                onDelete={async (jobId) => {
                    await deleteJob(jobId);
                    setJobDetailOpen(false);
                }}
            />
        </Dialog>
    );
}
