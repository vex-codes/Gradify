import { LayoutDashboard, Settings, GraduationCap, Users, Calendar, Calculator } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Grades', path: '/' },
    { icon: Calculator, label: 'GPA', path: '/gpa' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Users, label: 'Teachers', path: '/teachers' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
            <div className="p-6 flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Gradify</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>


        </div>
    );
}
