'use client';

import { Home, Scissors, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { translations } from '@/lib/i18n/es-AR';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: translations.nav.inicio,
            href: '/dashboard',
            icon: Home,
        },
        {
            label: translations.nav.historial,
            href: '/jobs',
            icon: Scissors,
        },
        {
            label: translations.nav.clientas,
            href: '/clientas',
            icon: Users,
        },
        {
            label: translations.nav.configuracion,
            href: '/configuracion',
            icon: Settings,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
            <div className="container max-w-2xl mx-auto">
                <div className="grid grid-cols-4 gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
                                <span className="text-xs mt-1 font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
