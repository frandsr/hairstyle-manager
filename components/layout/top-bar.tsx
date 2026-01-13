'use client';

import { Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export function TopBar() {
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get avatar URL from Google auth
                setUserAvatar(user.user_metadata?.avatar_url || null);
                // Get user name for fallback initials
                const name = user.user_metadata?.full_name || user.email || '';
                setUserName(name);
            }
        }

        loadUser();
    }, []);

    // Get initials for fallback
    const getInitials = (name: string) => {
        if (!name) return 'ME';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 bg-background border-b border-border">
            <div className="container max-w-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                            <Scissors className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            EstilistaPro
                        </h1>
                    </div>

                    {/* User avatar */}
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        {userAvatar ? (
                            <Image
                                src={userAvatar}
                                alt="Profile"
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        ) : (
                            <span className="text-white font-semibold text-sm">
                                {getInitials(userName)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
