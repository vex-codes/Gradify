import { Course } from './types';

export const MOCK_COURSES: Course[] = [
    {
        id: '1',
        name: 'AP Calculus BC',
        teacher: 'Mr. Smith',
        period: '1',
        average: 94.5,
        letterGrade: 'A',
        categories: [
            { name: 'Tests', weight: 0.6, average: 92 },
            { name: 'Quizzes', weight: 0.2, average: 98 },
            { name: 'Homework', weight: 0.2, average: 100 },
        ],
        assignments: [
            { id: 'a1', name: 'Unit 1 Test', category: 'Tests', score: 92, totalPoints: 100, dueDate: '2023-09-15', weight: 1 },
            { id: 'a2', name: 'Quiz 1.1', category: 'Quizzes', score: 20, totalPoints: 20, dueDate: '2023-09-05', weight: 1 },
            { id: 'a3', name: 'HW 1.1', category: 'Homework', score: 10, totalPoints: 10, dueDate: '2023-09-02', weight: 1 },
        ]
    },
    {
        id: '2',
        name: 'AP Physics C',
        teacher: 'Ms. Johnson',
        period: '2',
        average: 88.2,
        letterGrade: 'B+',
        categories: [
            { name: 'Labs', weight: 0.3, average: 95 },
            { name: 'Tests', weight: 0.5, average: 82 },
            { name: 'Homework', weight: 0.2, average: 98 },
        ],
        assignments: [
            { id: 'b1', name: 'Kinematics Test', category: 'Tests', score: 82, totalPoints: 100, dueDate: '2023-09-20', weight: 1 },
            { id: 'b2', name: 'Lab 1: Motion', category: 'Labs', score: 48, totalPoints: 50, dueDate: '2023-09-10', weight: 1 },
        ]
    },
    {
        id: '3',
        name: 'Honors English IV',
        teacher: 'Mrs. Davis',
        period: '3',
        average: 76.4,
        letterGrade: 'C',
        categories: [
            { name: 'Essays', weight: 0.5, average: 72 },
            { name: 'Classwork', weight: 0.5, average: 80 },
        ],
        assignments: [
            { id: 'c1', name: 'Hamlet Essay', category: 'Essays', score: 72, totalPoints: 100, dueDate: '2023-10-01', weight: 1 },
        ]
    },
    {
        id: '4',
        name: 'Spanish III',
        teacher: 'Sr. Garcia',
        period: '4',
        average: 65.0,
        letterGrade: 'D',
        categories: [
            { name: 'Speaking', weight: 0.4, average: 60 },
            { name: 'Writing', weight: 0.4, average: 70 },
            { name: 'Homework', weight: 0.2, average: 65 },
        ],
        assignments: [
            { id: 'd1', name: 'Oral Exam', category: 'Speaking', score: 60, totalPoints: 100, dueDate: '2023-09-25', weight: 1 },
        ]
    },
    {
        id: '5',
        name: 'Gym',
        teacher: 'Coach Miller',
        period: '5',
        average: 45.0,
        letterGrade: 'F',
        categories: [
            { name: 'Participation', weight: 1.0, average: 45 },
        ],
        assignments: [
            { id: 'e1', name: 'Participation Week 1', category: 'Participation', score: 0, totalPoints: 20, dueDate: '2023-09-05', weight: 1 },
            { id: 'e2', name: 'Participation Week 2', category: 'Participation', score: 18, totalPoints: 20, dueDate: '2023-09-12', weight: 1 },
        ]
    }
];
