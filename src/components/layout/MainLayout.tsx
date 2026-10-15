import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 md:ml-64 pb-16 md:pb-0 overflow-y-auto h-screen">
                <div className="container max-w-5xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
