import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calculator } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function GPACalculator() {
    const [isWeighted, setIsWeighted] = useState(true);
    const { courses } = useAuth();

    const calculateGPA = (weighted: boolean) => {
        let totalPoints = 0;
        let totalCourses = 0;

        courses.forEach(course => {
            let points = 0;
            const grade = course.average;

            if (grade >= 90) points = 4.0;
            else if (grade >= 80) points = 3.0;
            else if (grade >= 70) points = 2.0;
            else if (grade >= 60) points = 1.0;
            else points = 0.0;

            // Add weighting (simplified logic: +1.0 for AP, +0.5 for Honors)
            if (weighted) {
                if (course.name.startsWith('AP')) points += 1.0;
                else if (course.name.startsWith('Honors')) points += 0.5;
            }

            totalPoints += points;
            totalCourses += 1;
        });

        return totalCourses > 0 ? (totalPoints / totalCourses).toFixed(2) : '0.00';
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">GPA Calculator</h2>
                </div>
                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        onClick={() => setIsWeighted(false)}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                            !isWeighted ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Unweighted
                    </button>
                    <button
                        onClick={() => setIsWeighted(true)}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                            isWeighted ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Weighted
                    </button>
                </div>
            </div>

            <div className="text-center py-4">
                <div className="text-5xl font-black tracking-tighter text-primary">
                    {calculateGPA(isWeighted)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    Based on {courses.length} courses
                </p>
            </div>
        </div>
    );
}
