'use client';

import { useState, useEffect } from 'react';
import { isMockAuthMode, mockStore } from '../supabase/mock-data';
import { supabase, mockUser } from '../supabase/client';
import type { Job, NewJob, UpdateJob } from '../types/database';
import { getWeekBounds } from '../utils/date';
import { ensureSettingsHistoryForWeek, calculateAndUpdateStreakStatus } from '../utils/settings-history-manager';

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

                // Calculate and update streak status for the week
                await calculateAndUpdateStreakStatus(new Date(job.date), mockUser.id);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // Ensure settings_history exists for the job's week before creating
                await ensureSettingsHistoryForWeek(new Date(job.date), user.id);

                const { error } = await supabase
                    .from('jobs')
                    // @ts-ignore - Supabase type inference issue
                    .insert({ ...job, user_id: user.id });

                if (error) throw error;
                await fetchJobs();

                // Calculate and update streak status for the week
                await calculateAndUpdateStreakStatus(new Date(job.date), user.id);
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    async function updateJob(id: string, updates: UpdateJob) {
        try {
            if (isMockAuthMode()) {
                const oldJob = mockStore.jobs.find(job => job.id === id);
                const oldDate = oldJob?.date;

                mockStore.jobs = mockStore.jobs.map(job =>
                    job.id === id ? { ...job, ...updates, updated_at: new Date().toISOString() } : job
                );
                await fetchJobs();

                const updatedJob = mockStore.jobs.find(job => job.id === id);
                const newDate = updatedJob?.date;

                // Recalculate streak for affected weeks
                if (newDate) {
                    await calculateAndUpdateStreakStatus(new Date(newDate), mockUser.id);
                }
                // If date changed, also recalculate for old week
                if (oldDate && oldDate !== newDate) {
                    await calculateAndUpdateStreakStatus(new Date(oldDate), mockUser.id);
                }
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // Get old job data to check if date changed
                // @ts-ignore - Supabase type inference issue
                const { data: oldJob } = await supabase
                    .from('jobs')
                    .select('date')
                    .eq('id', id)
                    .single();

                // @ts-ignore - oldJob typed as never due to Supabase issue
                const oldDate = oldJob?.date;

                const { error } = await supabase
                    .from('jobs')
                    // @ts-ignore - Supabase type inference issue
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;
                await fetchJobs();

                // Recalculate streak for affected weeks
                const newDate = updates.date || oldDate;
                if (newDate) {
                    await calculateAndUpdateStreakStatus(new Date(newDate), user.id);
                }
                // If date changed, also recalculate for old week
                if (oldDate && updates.date && oldDate !== updates.date) {
                    await calculateAndUpdateStreakStatus(new Date(oldDate), user.id);
                }
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }

    async function deleteJob(id: string) {
        try {
            if (isMockAuthMode()) {
                const deletedJob = mockStore.jobs.find(job => job.id === id);
                const deletedDate = deletedJob?.date;

                mockStore.jobs = mockStore.jobs.filter(job => job.id !== id);
                await fetchJobs();

                // Recalculate streak for the week of the deleted job
                if (deletedDate) {
                    await calculateAndUpdateStreakStatus(new Date(deletedDate), mockUser.id);
                }
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // Get job date before deleting
                const { data: deletedJob } = await supabase
                    .from('jobs')
                    .select('date')
                    .eq('id', id)
                    .single();

                const deletedDate = deletedJob?.date;

                const { error } = await supabase
                    .from('jobs')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                await fetchJobs();

                // Recalculate streak for the week of the deleted job
                if (deletedDate) {
                    await calculateAndUpdateStreakStatus(new Date(deletedDate), user.id);
                }
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
