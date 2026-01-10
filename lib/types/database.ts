// Database types
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    created_at?: string;
                };
            };
            settings: {
                Row: {
                    id: string;
                    user_id: string;
                    weekly_target: number;
                    base_commission_rate: number;
                    streak_bonus_rate: number;
                    current_streak_count: number;
                    fixed_bonus_tiers: BonusTier[];
                    week_start_day: number;
                    shift_pattern_start: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    weekly_target: number;
                    base_commission_rate: number;
                    streak_bonus_rate: number;
                    current_streak_count?: number;
                    fixed_bonus_tiers?: BonusTier[];
                    week_start_day?: number;
                    shift_pattern_start: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    weekly_target?: number;
                    base_commission_rate?: number;
                    streak_bonus_rate?: number;
                    current_streak_count?: number;
                    fixed_bonus_tiers?: BonusTier[];
                    week_start_day?: number;
                    shift_pattern_start?: string;
                    updated_at?: string;
                };
            };
            settings_history: {
                Row: {
                    id: string;
                    user_id: string;
                    weekly_target: number;
                    base_commission_rate: number;
                    streak_bonus_rate: number;
                    current_streak_count: number;
                    fixed_bonus_tiers: BonusTier[];
                    week_start_day: number;
                    shift_pattern_start: string;
                    current_shift: 'morning' | 'afternoon' | null;
                    effective_from: string;
                    effective_to: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    weekly_target: number;
                    base_commission_rate: number;
                    streak_bonus_rate: number;
                    current_streak_count?: number;
                    fixed_bonus_tiers?: BonusTier[];
                    week_start_day?: number;
                    shift_pattern_start: string;
                    current_shift?: 'morning' | 'afternoon' | null;
                    effective_from: string;
                    effective_to?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    weekly_target?: number;
                    base_commission_rate?: number;
                    streak_bonus_rate?: number;
                    current_streak_count?: number;
                    fixed_bonus_tiers?: BonusTier[];
                    week_start_day?: number;
                    shift_pattern_start?: string;
                    current_shift?: 'morning' | 'afternoon' | null;
                    effective_from?: string;
                    effective_to?: string | null;
                    updated_at?: string;
                };
            };
            clients: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    phone: string | null;
                    notes: string | null;
                    status: 'good' | 'warning' | 'bad';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    phone?: string | null;
                    notes?: string | null;
                    status?: 'good' | 'warning' | 'bad';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    phone?: string | null;
                    notes?: string | null;
                    status?: 'good' | 'warning' | 'bad';
                    updated_at?: string;
                };
            };
            jobs: {
                Row: {
                    id: string;
                    user_id: string;
                    client_id: string | null;
                    amount: number;
                    tip_amount: number;
                    date: string;
                    description: string | null;
                    photos: string[] | null;
                    rating: number | null;
                    tags: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    client_id?: string | null;
                    amount: number;
                    tip_amount?: number;
                    date: string;
                    description?: string | null;
                    photos?: string[] | null;
                    rating?: number | null;
                    tags?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    client_id?: string | null;
                    amount?: number;
                    tip_amount?: number;
                    date?: string;
                    description?: string | null;
                    photos?: string[] | null;
                    rating?: number | null;
                    tags?: string[];
                    updated_at?: string;
                };
            };
        };
    };
}

export interface BonusTier {
    threshold: number;
    bonus: number;
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type SettingsHistory = Database['public']['Tables']['settings_history']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];

export type NewClient = Database['public']['Tables']['clients']['Insert'];
export type NewJob = Database['public']['Tables']['jobs']['Insert'];
export type UpdateJob = Database['public']['Tables']['jobs']['Update'];
