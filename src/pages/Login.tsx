import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User as UserIcon, Loader2, Plus, Star, Zap, Heart, Smile, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Login() {
    const { login, profiles, switchProfile, saveProfile } = useAuth();
    const navigate = useNavigate();

    // Default view: 'profiles' if we have any, else 'login'
    const [view, setView] = useState<'profiles' | 'login'>(() =>
        (profiles && profiles.length > 0) ? 'profiles' : 'login'
    );

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [saveAccount, setSaveAccount] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Effect to handle view switching if profiles change (e.g. all deleted)
    // although unlikely to happen on login screen

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);

            if (saveAccount) {
                // Save with default metadata, user can edit in settings
                saveProfile({
                    username,
                    password,
                    displayName: username, // Default to username
                    icon: 'User'
                });
            }

            navigate('/');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileClick = async (profileId: string) => {
        setIsLoading(true);
        setError('');
        try {
            await switchProfile(profileId);
            navigate('/');
        } catch (err) {
            setError('Failed to login with profile. Please try entering credentials manually.');
            setIsLoading(false);
        }
    };

    // Icon mapping helper
    const ProfileIcon = ({ name, className }: { name: string, className?: string }) => {
        switch (name) {
            case 'GraduationCap': return <GraduationCap className={className} />;
            case 'Star': return <Star className={className} />;
            case 'Zap': return <Zap className={className} />;
            case 'Heart': return <Heart className={className} />;
            case 'Smile': return <Smile className={className} />;
            default: return <UserIcon className={className} />;
        }
    };

    if (view === 'profiles') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Who's checking grades?</h1>
                        <p className="text-muted-foreground">Select a profile to continue</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 place-items-center">
                        {profiles.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => handleProfileClick(profile.id)}
                                disabled={isLoading}
                                className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-all w-full"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-transparent group-hover:border-primary/50 transition-all shadow-sm group-hover:shadow-md overflow-hidden relative">
                                    {isLoading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    ) : (
                                        <ProfileIcon name={profile.icon} className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                                    )}
                                </div>
                                <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                                    {profile.displayName}
                                </span>
                            </button>
                        ))}

                        <button
                            onClick={() => setView('login')}
                            className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-all w-full"
                        >
                            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-muted/50 transition-all">
                                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                Add Account
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    {profiles.length > 0 && (
                        <button
                            onClick={() => setView('profiles')}
                            className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            All Profiles
                        </button>
                    )}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                            <GraduationCap className="w-10 h-10 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Gradify</h1>
                    <p className="text-muted-foreground">Sign in with your Home Access Center credentials</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="username">
                                Username
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="District Username"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="saveAccount"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={saveAccount}
                                onChange={(e) => setSaveAccount(e.target.checked)}
                            />
                            <label htmlFor="saveAccount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Save account for future visits
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-muted-foreground">
                        <p>Credentials are encrypted and stored locally.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { AlertCircle } from 'lucide-react';
