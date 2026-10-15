import { Course, User } from './types';

const API_URL = 'http://localhost:3000/api';

export async function getGrades(username: string, password: string): Promise<{ courses: Course[], user: User, fullData?: any }> {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch grades');
    }

    const data = await response.json();
    return { courses: data.data, user: data.user, fullData: data.fullData };
}
