import { TopBar } from '@/components/layout/top-bar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Toaster } from 'sonner';
import { ShiftThemeProvider } from '@/lib/context/shift-theme-context';
import { SetupModal } from '@/components/modals/setup-modal';
import { InstallPrompt } from '@/components/install-prompt';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ShiftThemeProvider>
            <SetupModal />
            <div className="min-h-screen bg-background">
                <TopBar />
                <main className="pb-16">
                    {children}
                </main>
                <BottomNav />
                <InstallPrompt />
                <Toaster position="top-center" />
            </div>
        </ShiftThemeProvider>
    );
}
