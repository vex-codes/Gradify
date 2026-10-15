import { CourseCard } from '@/components/dashboard/CourseCard';
import { useAuth } from '@/context/AuthContext';

export function Dashboard() {
    const { courses, user } = useAuth();

    // Calculate overall GPA (Unweighted for now)
    const calculateGPA = () => {
        if (courses.length === 0) return '0.00';
        let totalPoints = 0;
        courses.forEach(course => {
            if (course.average >= 90) totalPoints += 4.0;
            else if (course.average >= 80) totalPoints += 3.0;
            else if (course.average >= 70) totalPoints += 2.0;
            else if (course.average >= 60) totalPoints += 1.0;
        });
        return (totalPoints / courses.length).toFixed(2);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back{user?.name ? `, ${user.name}` : ''}
                    </h1>
                    <p className="text-muted-foreground">Here's how you're doing this semester</p>
                </div>
                {courses.length > 0 && (
                    <div className="text-right">
                        <span className="text-xs font-medium text-muted-foreground block">Estimated GPA</span>
                        <span className="text-2xl font-bold text-primary">{calculateGPA()}</span>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
}
