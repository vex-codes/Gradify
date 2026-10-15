import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    const { average } = course;

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'bg-grade-a text-grade-a-fg border-grade-a ring-4 ring-grade-a/30 shadow-[0_0_50px_-5px] shadow-grade-a/80 hover:shadow-grade-a/100 z-10 scale-[1.03] transition-all duration-500';
        if (grade >= 80) return 'bg-grade-b text-grade-b-fg border-grade-b';
        if (grade >= 70) return 'bg-grade-c text-grade-c-fg border-grade-c';
        if (grade >= 60) return 'bg-grade-d text-grade-d-fg border-grade-d';
        return 'bg-grade-f text-grade-f-fg border-grade-f';
    };

    return (
        <Link to={`/course/${course.id}`}>
            <div
                className={cn(
                    "p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden border h-full flex flex-col justify-between",
                    getGradeColor(average)
                )}
                style={{ borderRadius: 'var(--radius)' }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{course.name}</h3>
                        <p className="text-sm opacity-90 font-medium">{course.teacher}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black tracking-tighter">{average}%</div>
                        <div className="text-sm font-bold opacity-80">{course.letterGrade}</div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                        {course.period ? `Period ${course.period}` : ''}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
