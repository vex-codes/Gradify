export interface Assignment {
    id: string;
    name: string;
    category: string;
    score: number | null;
    totalPoints: number;
    dueDate: string; // ISO date string
    weight: number; // e.g., 0.4 for 40%
}

export interface Course {
    id: string;
    name: string;
    teacher: string;
    period: string;
    average: number;
    letterGrade: string;
    assignments: Assignment[];
    categories: {
        name: string;
        weight: number;
        average: number;
    }[];
    room?: string;
    days?: string;
    email?: string;
}

export interface User {
    id: string;
    name: string;
    school: string;
    district: string;
    username?: string;
    password?: string;
}

export interface Reminder {
    id: string;
    courseId: string;
    title: string;
    date: string; // ISO date string YYYY-MM-DD
    completed: boolean;
}

export interface AttendanceEvent {
    date: string;
    code: string;
    description: string;
}

export interface UserProfile {
    id: string;
    username: string; // The login ID (s-number)
    password: string; // Stored for auto-login
    displayName: string; // "My Account", "Brother", etc.
    icon: string; // Lucide icon name: 'User', 'GraduationCap', 'Star', 'Zap', 'Heart'
    lastActive: number;
}
