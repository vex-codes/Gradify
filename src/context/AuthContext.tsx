import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Course, UserProfile } from '@/lib/types';
import * as api from '@/lib/api';

interface AuthContextType {
    user: User | null;
    courses: Course[];
    attendance: any[];
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    refreshData: () => Promise<void>;
    profiles: UserProfile[];
    saveProfile: (data: Omit<UserProfile, 'id' | 'lastActive'>) => void;
    switchProfile: (profileId: string) => Promise<void>;
    deleteProfile: (profileId: string) => void;
    updateProfile: (id: string, updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for stored session
        const storedUser = localStorage.getItem('gradify_user');
        const storedCourses = localStorage.getItem('gradify_courses');
        const storedAttendance = localStorage.getItem('gradify_attendance');
        const storedProfiles = localStorage.getItem('gradify_profiles');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedCourses) {
            setCourses(JSON.parse(storedCourses));
        }
        if (storedAttendance) {
            setAttendance(JSON.parse(storedAttendance));
        }
        if (storedProfiles) {
            setProfiles(JSON.parse(storedProfiles));
        }
        setIsLoading(false);
    }, []);

    // Persist profiles whenever they change
    useEffect(() => {
        localStorage.setItem('gradify_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const refreshData = useCallback(async () => {
        if (!user || !user.username || !user.password) return;
        try {
            const data = await api.getGrades(user.username, user.password);
            if (data && data.courses) {
                setCourses(data.courses);
                localStorage.setItem('gradify_courses', JSON.stringify(data.courses));
            }
            if (data && data.fullData && data.fullData.attendance) {
                setAttendance(data.fullData.attendance);
                localStorage.setItem('gradify_attendance', JSON.stringify(data.fullData.attendance));
            }
        } catch (error) {
            console.error("Failed to refresh data:", error);
        }
    }, [user]);

    // Auto-sync every 5 minutes
    useEffect(() => {
        if (!user) return;

        const intervalId = setInterval(() => {
            console.log('Auto-syncing data...');
            refreshData();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(intervalId);
    }, [user, refreshData]);

    const login = async (username: string, password: string) => {
        try {
            const data = await api.getGrades(username, password);
            const userWithCreds = { ...data.user, username, password };

            setUser(userWithCreds);
            setCourses(data.courses);

            if (data.fullData && data.fullData.attendance) {
                setAttendance(data.fullData.attendance);
                localStorage.setItem('gradify_attendance', JSON.stringify(data.fullData.attendance));
            }

            localStorage.setItem('gradify_user', JSON.stringify(userWithCreds));
            localStorage.setItem('gradify_courses', JSON.stringify(data.courses));
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setCourses([]);
        setAttendance([]);
        localStorage.removeItem('gradify_user');
        localStorage.removeItem('gradify_courses');
        localStorage.removeItem('gradify_attendance');
    };

    // Profile Management
    const saveProfile = (data: Omit<UserProfile, 'id' | 'lastActive'>) => {
        const newProfile: UserProfile = {
            id: Date.now().toString(),
            ...data,
            lastActive: Date.now()
        };

        setProfiles(prev => {
            // Check if profile with same username already exists, update it if so
            const existingIndex = prev.findIndex(p => p.username === data.username);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], ...data, lastActive: Date.now() };
                return updated;
            }
            return [...prev, newProfile];
        });
    };

    const switchProfile = async (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) throw new Error('Profile not found');

        // Update last active
        setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, lastActive: Date.now() } : p));

        // Use stored credentials to login
        await login(profile.username, profile.password);
    };

    const deleteProfile = (profileId: string) => {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
    };

    const updateProfile = (id: string, updates: Partial<UserProfile>) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    return (
        <AuthContext.Provider value={{
            user, courses, attendance, login, logout, isLoading, refreshData,
            profiles, saveProfile, switchProfile, deleteProfile, updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
