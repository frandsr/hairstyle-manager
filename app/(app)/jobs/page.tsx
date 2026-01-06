'use client';

import { useState } from 'react';
import { useJobs } from '@/lib/hooks/use-jobs';
import { useClients } from '@/lib/hooks/use-clients';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateLong, formatDateShort } from '@/lib/utils/date';
import { translations } from '@/lib/i18n/es-AR';
import { Loader2, Calendar, DollarSign, User, Star, Trash2, Edit, StickyNote, Search, Plus } from 'lucide-react';
import { JobFormDialog } from '@/components/jobs/job-form-dialog';
import { JobDetailDialog } from '@/components/jobs/job-detail-dialog';
import type { Job } from '@/lib/types/database';

export default function HistorialPage() {
    const { jobs, loading, deleteJob, updateJob, addJob } = useJobs();
    const { clients, getClientById, refetch: refetchClients } = useClients();
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter jobs by search query
    const filteredJobs = jobs.filter((job) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        const client = job.client_id ? getClientById(job.client_id) : null;
        const clientName = client?.name.toLowerCase() || '';
        const description = job.description?.toLowerCase() || '';
        const tags = job.tags?.map(t => t.toLowerCase()).join(' ') || '';

        return clientName.includes(query) || description.includes(query) || tags.includes(query);
    });

    // Group jobs by date
    const groupedJobs = filteredJobs.reduce((groups, job) => {
        const date = job.date.split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(job);
        return groups;
    }, {} as Record<string, Job[]>);

    // Sort dates descending
    const sortedDates = Object.keys(groupedJobs).sort((a, b) => b.localeCompare(a));

    const handleViewDetails = (job: Job) => {
        setSelectedJob(job);
        setIsDetailOpen(true);
    };

    const handleEdit = async (job: Job) => {
        setEditingJob(job);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás segura de eliminar este trabajo?')) {
            try {
                await deleteJob(id);
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    const handleSubmit = async (jobData: any) => {
        if (editingJob) {
            await updateJob(editingJob.id, jobData);
        } else {
            await addJob(jobData);
        }
        setEditingJob(null);
    };

    const handleNewJob = () => {
        setEditingJob(null);
        setIsFormOpen(true);
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">{translations.common.loading}</p>
                </div>
            </div>
        );
    }

    if (jobs.length === 0 && !searchQuery) {
        return (
            <div className="container max-w-2xl mx-auto p-4 pb-24">
                <h1 className="text-3xl font-bold mb-6">{translations.nav.historial}</h1>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No hay trabajos registrados aún.
                            <br />
                            <span className="text-sm">Usa el botón + para agregar tu primer trabajo.</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto p-4 pb-24 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{translations.jobs.title}</h1>
                <Button onClick={handleNewJob} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {translations.jobs.newJob}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={translations.jobs.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Results count */}
            {searchQuery && (
                <div className="text-sm text-muted-foreground">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'resultado' : 'resultados'}
                </div>
            )}

            {/* Empty state for search */}
            {filteredJobs.length === 0 && searchQuery && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No se encontraron trabajos para "{searchQuery}"
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Jobs grouped by date */}
            <div className="space-y-6">
                {sortedDates.map((date) => {
                    const dayJobs = groupedJobs[date];
                    const dayTotal = dayJobs.reduce((sum, job) => sum + job.amount, 0);
                    const dayTips = dayJobs.reduce((sum, job) => sum + job.tip_amount, 0);

                    return (
                        <div key={date} className="space-y-3">
                            {/* Date Header */}
                            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-lg font-semibold">
                                        {formatDateLong(new Date(date + 'T12:00:00'))}
                                    </h2>
                                    <div className="text-sm text-muted-foreground">
                                        {formatCurrency(dayTotal)}
                                        {dayTips > 0 && (
                                            <span className="text-xs ml-1">
                                                + {formatCurrency(dayTips)} propina
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Jobs for this day */}
                            <div className="space-y-3">
                                {dayJobs.map((job) => {
                                    const client = job.client_id ? getClientById(job.client_id) : null;

                                    return (
                                        <Card
                                            key={job.id}
                                            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => handleViewDetails(job)}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                {/* Main Info */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 space-y-1">
                                                        {client && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">{client.name}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                            <span className="text-lg font-bold">
                                                                {formatCurrency(job.amount)}
                                                            </span>
                                                            {job.tip_amount > 0 && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    + {formatCurrency(job.tip_amount)} propina
                                                                </span>
                                                            )}
                                                        </div>

                                                        {job.description && (
                                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                <StickyNote className="h-4 w-4 mt-0.5" />
                                                                <span className="line-clamp-1">{job.description}</span>
                                                            </div>
                                                        )}

                                                        {job.rating && (
                                                            <div className="flex items-center gap-2">
                                                                {renderStars(job.rating)}
                                                            </div>
                                                        )}

                                                        {/* Tags */}
                                                        {job.tags && job.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {job.tags.map(tag => (
                                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(job)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(job.id)}
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Job Form Dialog */}
            <JobFormDialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingJob(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingJob || undefined}
                onClientAdded={refetchClients}
            />

            {/* Job Detail Dialog */}
            <JobDetailDialog
                job={selectedJob}
                client={selectedJob?.client_id ? (getClientById(selectedJob.client_id) || null) : null}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
