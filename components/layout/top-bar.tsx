import { Scissors } from 'lucide-react';

export function TopBar() {
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

                    {/* User avatar placeholder */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                        ME
                    </div>
                </div>
            </div>
        </header>
    );
}
