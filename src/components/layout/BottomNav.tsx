import { LayoutDashboard, FileText, Settings, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Grades', path: '/' },
    { icon: Users, label: 'Teachers', path: '/teachers' },
    { icon: FileText, label: 'HAC', path: '/hac-data' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function BottomNav() {
    const location = useLocation();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
