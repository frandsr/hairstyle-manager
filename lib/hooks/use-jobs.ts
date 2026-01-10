'use client';

import { useState, useEffect } from 'react';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { supabase, mockUser } from '../supabase/client';
import type { Job, NewJob, UpdateJob } from '../types/database';
import { getWeekBounds } from '../utils/date';

export function useJobs(startDate?: Date, endDate?: Date) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Convert dates to timestamps for stable dependency comparison
    const startTime = startDate?.getTime();
    const endTime = endDate?.getTime();

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startTime, endTime]);

    async function fetchJobs() {
        try {
            setLoading(true);

            if (isMockAuthMode()) {
                // Use mock data
                let filteredJobs = [...mockStore.jobs];

                // Filter by date range if provided
                if (startDate && endDate) {
                    filteredJobs = filteredJobs.filter(job => {
                        const jobDate = new Date(job.date);
                        return jobDate >= startDate && jobDate <= endDate;
                    });
                }

                setJobs(filteredJobs);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                let query = supabase
                    .from('jobs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                if (startDate) {
                    // Use date-only format (YYYY-MM-DD) to avoid timezone issues
                    // This matches jobs created on the local date regardless of time
                    const dateStr = startDate.toISOString().split('T')[0];
                    query = query.gte('date', dateStr);
                }
                if (endDate) {
                    // Use date-only format for end date as well
                    const dateStr = endDate.toISOString().split('T')[0];
                    query = query.lte('date', dateStr);
                }

                const { data, error } = await query;
                if (error) throw error;
                setJobs(data || []);
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function addJob(job: Omit<NewJob, 'user_id'>) {
        try {
            if (isMockAuthMode()) {
                const newJob: Job = {
                    id: `job-${Date.now()}`,
                    user_id: mockUser.id,
                    ...job,
                    tip_amount: job.tip_amount || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as Job;

                mockStore.jobs = [newJob, ...mockStore.jobs];
                await fetchJobs();
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('jobs')
                    .insert({ ...job, user_id: user.id });

                if (error) throw error;
                await fetchJobs();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    async function updateJob(id: string, updates: UpdateJob) {
        try {
            if (isMockAuthMode()) {
                mockStore.jobs = mockStore.jobs.map(job =>
                    job.id === id ? { ...job, ...updates, updated_at: new Date().toISOString() } : job
                );
                await fetchJobs();
            } else {
                const { error } = await supabase
                    .from('jobs')
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;
                await fetchJobs();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    async function deleteJob(id: string) {
        try {
            if (isMockAuthMode()) {
                mockStore.jobs = mockStore.jobs.filter(job => job.id !== id);
                await fetchJobs();
            } else {
                const { error } = await supabase
                    .from('jobs')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                await fetchJobs();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    return {
        jobs,
        loading,
        error,
        addJob,
        updateJob,
        deleteJob,
        refetch: fetchJobs,
    };
}

// Hook to get jobs for the current week
export function useWeekJobs(weekStartDate: Date) {
    const { start, end } = getWeekBounds(weekStartDate);
    return useJobs(start, end);
}
