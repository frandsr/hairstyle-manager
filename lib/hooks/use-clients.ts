'use client';

import { useState, useEffect } from 'react';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { supabase, mockUser } from '../supabase/client';
import type { Client, NewClient } from '../types/database';

export function useClients(searchQuery?: string) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchClients();
    }, [searchQuery]);

    async function fetchClients() {
        try {
            setLoading(true);

            if (isMockAuthMode()) {
                let filteredClients = [...mockStore.clients];

                // Filter by search query if provided
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filteredClients = filteredClients.filter(client =>
                        client.name.toLowerCase().includes(query) ||
                        client.phone?.toLowerCase().includes(query) ||
                        client.notes?.toLowerCase().includes(query)
                    );
                }

                setClients(filteredClients);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                let query = supabase
                    .from('clients')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name');

                if (searchQuery) {
                    query = query.ilike('name', `%${searchQuery}%`);
                }

                const { data, error } = await query;
                if (error) throw error;
                setClients(data || []);
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function addClient(client: Omit<NewClient, 'user_id'>) {
        try {
            if (isMockAuthMode()) {
                const newClient: Client = {
                    id: `client-${Date.now()}`,
                    user_id: mockUser.id,
                    ...client,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as Client;

                mockStore.clients = [...mockStore.clients, newClient];
                await fetchClients();
                return newClient;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { data, error } = await supabase
                    .from('clients')
                    .insert({ ...client, user_id: user.id })
                    .select()
                    .single();

                if (error) throw error;
                await fetchClients();
                return data;
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    async function updateClient(id: string, updates: Partial<Client>) {
        try {
            if (isMockAuthMode()) {
                mockStore.clients = mockStore.clients.map(client =>
                    client.id === id ? { ...client, ...updates, updated_at: new Date().toISOString() } : client
                );
                await fetchClients();
            } else {
                const { error } = await supabase
                    .from('clients')
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;
                await fetchClients();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    async function deleteClient(id: string) {
        try {
            if (isMockAuthMode()) {
                mockStore.clients = mockStore.clients.filter(client => client.id !== id);
                await fetchClients();
            } else {
                const { error } = await supabase
                    .from('clients')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                await fetchClients();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    function getClientById(id: string): Client | undefined {
        return clients.find(client => client.id === id);
    }

    return {
        clients,
        loading,
        error,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        refetch: fetchClients,
    };
}
