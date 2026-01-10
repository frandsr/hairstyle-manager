import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/database';

// Get environment variables
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

// Use valid defaults if env vars are missing, empty, or contain placeholder text
const isValidUrl = envUrl && envUrl.startsWith('http') && !envUrl.includes('your-supabase');
const isValidKey = envKey && envKey.length > 20 && !envKey.includes('your-supabase');

const supabaseUrl = isValidUrl ? envUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isValidKey ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';

// Create Supabase client using SSR-compatible browser client
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Mock user data for development
export const mockUser = {
    id: 'mock-user-123',
    email: 'estilista@ejemplo.com',
    user_metadata: {
        full_name: 'María Estilista',
        avatar_url: '',
    },
};

/**
 * Check if we're in mock auth mode
 */
export function isMockAuthMode(): boolean {
    return isMockAuth;
}

/**
 * Get current user (either real or mock)
 */
export async function getCurrentUser() {
    if (isMockAuthMode()) {
        return { data: { user: mockUser }, error: null };
    }

    return await supabase.auth.getUser();
}
