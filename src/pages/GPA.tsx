import { useAuth } from '../context/AuthContext';
import { ChevronLeft, GraduationCap, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GPACalculator = () => {
    const { courses } = useAuth();

    const calculateGPA = (courseList: any[]) => {
        let totalWeightedPoints = 0;
        let totalUnweightedPoints = 0;
        let count = 0;
        const courseDetails: any[] = [];

        courseList.forEach(course => {
            if (course.average !== null && !isNaN(course.average)) {
                const avg = course.average;
                let unweighted = 0;
                if (avg >= 90) unweighted = 4.0;
                else if (avg >= 80) unweighted = 3.0;
                else if (avg >= 70) unweighted = 2.0;
                else unweighted = 0.0;

                const isAdvanced = course.name.includes('AP') || course.name.includes('Adv') || course.name.includes('IB');
                let weighted = unweighted;
                if (isAdvanced && unweighted > 0) {
                    weighted += 1.0;
                }

                totalUnweightedPoints += unweighted;
                totalWeightedPoints += weighted;
                count++;

                courseDetails.push({
                    name: course.name,
                    average: course.average,
                    unweighted: unweighted.toFixed(3),
                    weighted: weighted.toFixed(3),
                    isAdvanced
                });
            }
        });

        return {
            unweighted: count > 0 ? (totalUnweightedPoints / count).toFixed(3) : "0.000",
            weighted: count > 0 ? (totalWeightedPoints / count).toFixed(3) : "0.000",
            details: courseDetails
        };
    };

    const gpaData = calculateGPA(courses);

    return (
        <div className="space-y-6">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <header>
                <h1 className="text-3xl font-bold tracking-tight mb-2">GPA Calculator</h1>
                <p className="text-muted-foreground">Estimated GPA based on current course averages.</p>
            </header>

            {/* GPA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm dark:bg-slate-900 dark:border-emerald-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900 uppercase tracking-wider dark:text-emerald-400">Unweighted GPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-emerald-600 tracking-tighter dark:text-emerald-500">{gpaData.unweighted}</div>
                        <p className="text-emerald-700/60 text-sm font-medium mt-2 dark:text-emerald-400/60">4.0 Scale</p>
                    </CardContent>
                </Card>
                <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm dark:bg-slate-900 dark:border-indigo-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900 uppercase tracking-wider dark:text-indigo-400">Weighted GPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-indigo-600 tracking-tighter dark:text-indigo-500">{gpaData.weighted}</div>
                        <p className="text-indigo-700/60 text-sm font-medium mt-2 dark:text-indigo-400/60">5.0/6.0 Scale (Estimated)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Course Breakdown */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <GraduationCap className="w-5 h-5" />
                    GPA Breakdown Per Course
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {gpaData.details.map((course: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl shadow-sm dark:bg-slate-900/50 dark:border-white/10">
                            <div className="min-w-0">
                                <div className="font-bold text-base truncate pr-4 text-foreground">{course.name}</div>
                                <div className="text-sm text-muted-foreground font-medium">Average: {course.average}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground bg-secondary px-1.5 py-0.5 rounded dark:bg-white/10">
                                        {course.isAdvanced ? 'Advanced' : 'Regular'}
                                    </span>
                                </div>
                                <div className="text-right space-x-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                        {course.unweighted} UW
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                        {course.weighted} W
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-xl text-sm flex items-start gap-3 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-900/40">
                <Calculator className="w-5 h-5 shrink-0" />
                <p>
                    <strong>Note:</strong> This is an estimate using common district weighting rules (+1.0 for AP/Adv). Check your official transcript for the verified GPA.
                </p>
            </div>
        </div>
    );
};

export default GPACalculator;
