import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, UserCircle } from 'lucide-react';

export const ContactTeachers = () => {
    const { courses } = useAuth();

    // Deduplicate teachers (in case multiple courses have the same teacher)
    const uniqueTeachers = Array.from(new Set(courses.map(c => c.teacher)))
        .filter(t => t && t !== 'Unknown') // Only show valid teachers
        .map(teacherName => {
            return courses.find(c => c.teacher === teacherName);
        });

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Contact Teachers</h1>
                <p className="text-muted-foreground">Quickly email your instructors</p>
            </header>

            <div className="space-y-3">
                {uniqueTeachers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No teacher contact info found.</p>
                        <p className="text-xs mt-1">Try refreshing your HAC data.</p>
                    </div>
                ) : (
                    uniqueTeachers.map((course) => (
                        <Card key={course?.teacher} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <a
                                    href={`mailto:${course?.email || ''}`}
                                    className="flex items-center p-4 gap-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                        {course?.teacher?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate">{course?.teacher}</h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {course?.email || `${course?.teacher?.toLowerCase().replace(/\s+/g, '.')}@roundrockisd.org`}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </a>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ContactTeachers;
