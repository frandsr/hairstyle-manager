'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show install button
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowInstall(false);
    };

    const handleDismiss = () => {
        setShowInstall(false);
        // Store dismissal in localStorage to not show again for a while
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    // Check if user dismissed recently (within 7 days)
    useEffect(() => {
        const dismissed = localStorage.getItem('installPromptDismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (dismissedTime > sevenDaysAgo) {
                setShowInstall(false);
            }
        }
    }, []);

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom z-40">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Cerrar"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Download className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">Instala la app</h3>
                    <p className="text-sm text-white/90 mb-3">
                        Accede rápido desde tu pantalla de inicio
                    </p>
                    <Button
                        onClick={handleInstall}
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        Instalar ahora
                    </Button>
                </div>
            </div>
        </div>
    );
}
