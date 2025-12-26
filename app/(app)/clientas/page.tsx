'use client';

import { useState } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClientDetailDialog } from '@/components/clients/client-detail-dialog';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { Search, UserPlus, Phone, ChevronRight, Flag, Edit, Trash2 } from 'lucide-react';
import { translations } from '@/lib/i18n/es-AR';
import type { Client } from '@/lib/types/database';

export default function ClientasPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const { clients, loading, deleteClient, refetch } = useClients(searchQuery);

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
        setDetailDialogOpen(true);
    };

    const handleEditClick = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        setEditingClient(client);
        setFormDialogOpen(true);
    };

    const handleDeleteClick = async (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        if (confirm(`¿Estás segura de eliminar a ${client.name}?`)) {
            await deleteClient(client.id);
        }
    };

    const handleCloseForm = () => {
        setFormDialogOpen(false);
        setEditingClient(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{translations.common.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto p-4 pb-24 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{translations.clients.title}</h2>
                <Button
                    size="sm"
                    onClick={() => setFormDialogOpen(true)}
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {translations.clients.newClient}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={translations.clients.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Clients List */}
            <div className="space-y-3">
                {clients.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            {translations.clients.noClients}
                        </CardContent>
                    </Card>
                ) : (
                    clients.map((client) => (
                        <Card
                            key={client.id}
                            className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                            onClick={() => handleClientClick(client)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    {/* Status flag */}
                                    <Flag className={`h-5 w-5 flex-shrink-0 ${client.status === 'good' ? 'text-green-600' :
                                        client.status === 'warning' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`} />

                                    {/* Client info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{client.name}</h3>
                                        {client.phone && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Phone className="h-3 w-3" />
                                                {client.phone}
                                            </p>
                                        )}
                                        {client.notes && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                {client.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={(e) => handleEditClick(e, client)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={(e) => handleDeleteClick(e, client)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Client Detail Dialog */}
            <ClientDetailDialog
                client={selectedClient}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
            />

            {/* Client Form Dialog */}
            <ClientFormDialog
                open={formDialogOpen}
                onOpenChange={handleCloseForm}
                initialData={editingClient || undefined}
                onSuccess={refetch}
            />
        </div>
    );
}
