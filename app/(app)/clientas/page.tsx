'use client';

import { useClients } from '@/lib/hooks/use-clients';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Phone } from 'lucide-react';
import { translations } from '@/lib/i18n/es-AR';
import { useState } from 'react';

export default function ClientasPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { clients, loading } = useClients(searchQuery);

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
        <div className="container max-w-2xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{translations.clients.title}</h2>
                <Button size="sm">
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
                        <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{client.name}</h3>
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
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
