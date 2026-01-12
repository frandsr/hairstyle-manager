import type { Settings, Client, Job } from '../types/database';
import { mockUser, isMockAuthMode as checkMockMode } from './client';

export { checkMockMode as isMockAuthMode };

// Mock settings data
export const mockSettings: Settings = {
    id: 'settings-1',
    user_id: mockUser.id,
    weekly_target: 150000, // $150,000 ARS weekly target
    base_commission_rate: 0.40, // 40% base commission
    streak_bonus_rate: 0.05, // 5% per week bonus
    streak_bonus_threshold: 500000,
    streak_threshold_met: true, // Mock data has threshold met
    fixed_bonus_tiers: [
        { threshold: 100000, bonus: 10000 },
        { threshold: 200000, bonus: 25000 },
        { threshold: 300000, bonus: 50000 },
    ],
    week_start_day: 6, // Saturday
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

// Mock clients data
export const mockClients: Client[] = [
    {
        id: 'client-1',
        user_id: mockUser.id,
        name: 'Ana García',
        phone: '+54 9 11 2345-6789',
        notes: 'Prefiere cortes modernos, color rubio',
        status: 'good',
        created_at: new Date('2023-11-01').toISOString(),
        updated_at: new Date('2023-11-01').toISOString(),
    },
    {
        id: 'client-2',
        user_id: mockUser.id,
        name: 'Lucía Fernández',
        phone: '+54 9 11 3456-7890',
        notes: 'Cliente frecuente, tratamientos capilares',
        status: 'good',
        created_at: new Date('2023-10-15').toISOString(),
        updated_at: new Date('2023-10-15').toISOString(),
    },
    {
        id: 'client-3',
        user_id: mockUser.id,
        name: 'Sofía Martínez',
        phone: '+54 9 11 4567-8901',
        notes: 'Corte y peinado para eventos',
        status: 'warning',
        created_at: new Date('2023-09-20').toISOString(),
        updated_at: new Date('2023-09-20').toISOString(),
    },
    {
        id: 'client-4',
        user_id: mockUser.id,
        name: 'Valentina López',
        phone: null,
        notes: null,
        status: 'good',
        created_at: new Date('2023-12-01').toISOString(),
        updated_at: new Date('2023-12-01').toISOString(),
    },
];

// Helper to generate mock jobs for current and previous weeks
function generateMockJobs(): Job[] {
    const now = new Date();
    const jobs: Job[] = [];

    // Current week jobs (this Saturday to today)
    jobs.push({
        id: 'job-1',
        user_id: mockUser.id,
        client_id: 'client-1',
        amount: 25000,
        tip_amount: 5000,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(),
        description: 'Corte y color completo',
        photos: null,
        rating: 5,
        tags: ['Corte', 'Color'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    jobs.push({
        id: 'job-2',
        user_id: mockUser.id,
        client_id: 'client-2',
        amount: 18000,
        tip_amount: 2000,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
        description: 'Tratamiento de keratina',
        photos: null,
        rating: 5,
        tags: ['Tratamiento', 'Keratina'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    jobs.push({
        id: 'job-3',
        user_id: mockUser.id,
        client_id: 'client-3',
        amount: 30000,
        tip_amount: 3000,
        date: new Date().toISOString(),
        description: 'Peinado para evento',
        photos: null,
        rating: 5,
        tags: ['Peinado', 'Brushing'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    // Previous week jobs
    jobs.push({
        id: 'job-4',
        user_id: mockUser.id,
        client_id: 'client-1',
        amount: 22000,
        tip_amount: 3000,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString(),
        description: 'Corte y brushing',
        photos: null,
        rating: 4,
        tags: ['Corte', 'Brushing'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    jobs.push({
        id: 'job-5',
        user_id: mockUser.id,
        client_id: 'client-4',
        amount: 15000,
        tip_amount: 1000,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9).toISOString(),
        description: 'Corte simple',
        photos: null,
        rating: 5,
        tags: ['Corte'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    return jobs;
}

export const mockJobs = generateMockJobs();

// Mock store for in-memory data manipulation
class MockStore {
    settings: Settings = { ...mockSettings };
    clients: Client[] = [...mockClients];
    jobs: Job[] = [...mockJobs];

    reset() {
        this.settings = { ...mockSettings };
        this.clients = [...mockClients];
        this.jobs = [...mockJobs];
    }
}

export const mockStore = new MockStore();
