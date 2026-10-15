import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, LogOut, User, Bell, Check, Palette, Pencil, GraduationCap, Star, Zap, Heart, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { UserProfile } from '@/lib/types';
import { ThemeBuilder } from '@/components/theme/ThemeBuilder';

// Helper Icon Component
const ProfileIcon = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
        case 'GraduationCap': return <GraduationCap className={className} />;
        case 'Star': return <Star className={className} />;
        case 'Zap': return <Zap className={className} />;
        case 'Heart': return <Heart className={className} />;
        case 'Smile': return <Smile className={className} />;
        default: return <User className={className} />;
    }
};

const ICONS = ['User', 'GraduationCap', 'Star', 'Zap', 'Heart', 'Smile'];

function ProfileEditor({ profile, onUpdate, onDelete }: {
    profile: UserProfile,
    onUpdate: (id: string, data: Partial<UserProfile>) => void,
    onDelete: (id: string) => void
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.displayName);
    const [icon, setIcon] = useState(profile.icon);

    if (isEditing) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-background w-full max-w-sm rounded-xl p-6 space-y-4 shadow-xl">
                    <h3 className="font-semibold text-lg">Edit Profile</h3>

                    <div className="space-y-2">
                        <label className="text-xs font-medium">Display Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium">Icon</label>
                        <div className="flex gap-2 justify-center">
                            {ICONS.map(i => (
                                <button
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                                        icon === i ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-transparent hover:bg-muted/80"
                                    )}
                                >
                                    <ProfileIcon name={i} className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => {
                                onUpdate(profile.id, { displayName: name, icon });
                                setIsEditing(false);
                            }}
                            className="flex-1 bg-primary text-primary-foreground h-9 rounded-md text-sm font-medium hover:bg-primary/90"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-secondary text-secondary-foreground h-9 px-3 rounded-md text-sm font-medium hover:bg-secondary/80"
                        >
                            Cancel
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this profile?')) {
                                onDelete(profile.id);
                            }
                        }}
                        className="w-full text-destructive text-sm h-8 hover:bg-destructive/10 rounded-md"
                    >
                        Delete Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
            <Pencil className="w-4 h-4" />
        </button>
    );
}

const themes = [
    { id: 'classic', name: 'Classic', color: 'bg-emerald-500' },
    { id: 'ocean', name: 'Ocean', color: 'bg-blue-500' },
    { id: 'sunset', name: 'Sunset', color: 'bg-orange-500' },
    { id: 'lemon', name: 'Lemon', color: 'bg-yellow-400' },
    { id: 'magenta', name: 'Magenta', color: 'bg-pink-500' },
    { id: 'custom', name: 'Custom', color: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' },
] as const;

export function Settings() {
    const { user, logout, profiles, updateProfile, deleteProfile } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleMode = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
        // Force re-render if needed, but classList manipulation usually triggers CSS updates directly
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences and account</p>
            </header>

            <div className="space-y-6">
                {/* Account Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Account</h2>
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-medium">{user?.name || 'Student'}</div>
                                <div className="text-sm text-muted-foreground">{user?.school || 'High School'}</div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </section>

                {/* Profile Management Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Manage Profiles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profiles.map(p => (
                            <div key={p.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ProfileIcon name={p.icon} className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{p.displayName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{p.username}</div>
                                </div>
                                <div className="flex gap-2">
                                    <ProfileEditor profile={p} onUpdate={updateProfile} onDelete={deleteProfile} />
                                </div>
                            </div>
                        ))}
                        {profiles.length === 0 && (
                            <div className="col-span-1 md:col-span-2 text-center py-8 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
                                No profiles saved. Add one from the login screen.
                            </div>
                        )}
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Appearance</h2>
                    <Card className="p-6 space-y-6">
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-full">
                                    <Sun className="w-5 h-5 hidden dark:block" />
                                    <Moon className="w-5 h-5 block dark:hidden" />
                                </div>
                                <div>
                                    <div className="font-medium">Dark Mode</div>
                                    <div className="text-sm text-muted-foreground">
                                        Adjust the brightness for your environment
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={toggleMode}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-primary"
                            >
                                <span
                                    className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:translate-x-6"
                                />
                            </button>
                        </div>

                        <div className="border-t border-border" />

                        {/* Theme Selector */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-muted-foreground" />
                                <div className="font-medium">Color Theme</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                            theme === t.id
                                                ? "border-primary bg-primary/5"
                                                : "border-transparent bg-secondary/50 hover:bg-secondary"
                                        )}
                                    >
                                        <div className={cn("h-10 w-10 rounded-full shadow-sm flex items-center justify-center", t.color)}>
                                            {theme === t.id && <Check className="w-5 h-5 text-white" />}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-sm">{t.name}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{t.id} Gradient</span>
                                        </div>
                                        {/* Decorative gradient splash */}
                                        <div className={cn(
                                            "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/10 to-transparent rounded-r-xl",
                                            t.color, "opacity-20"
                                        )} />
                                    </button>
                                ))}
                            </div>

                            {/* Custom Theme Builder */}
                            {theme === 'custom' && (
                                <div className="pt-2">
                                    <ThemeBuilder />
                                </div>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Notifications Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-full">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium">Push Notifications</div>
                                    <div className="text-sm text-muted-foreground">Get alerts for new grades (Coming Soon)</div>
                                </div>
                            </div>
                            <div className="h-6 w-11 rounded-full bg-input" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
