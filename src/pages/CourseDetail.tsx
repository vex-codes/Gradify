import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Award, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatIfCalculator } from '@/components/course/WhatIfCalculator';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function CourseDetail() {
    const { id } = useParams();
    const { courses } = useAuth();
    const [showInsights, setShowInsights] = useState(false);
    const course = courses.find(c => c.id === id);

    if (!course) {
        return <div className="p-8 text-center text-muted-foreground">Course not found</div>;
    }

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'bg-grade-a text-grade-a-fg border-grade-a ring-1 ring-grade-a/50 shadow-[0_0_40px_-5px] shadow-grade-a/50';
        if (grade >= 80) return 'bg-grade-b text-grade-b-fg border-grade-b';
        if (grade >= 70) return 'bg-grade-c text-grade-c-fg border-grade-c';
        if (grade >= 60) return 'bg-grade-d text-grade-d-fg border-grade-d';
        return 'bg-grade-f text-grade-f-fg border-grade-f';
    };

    const getScoreColor = (score: number, total: number) => {
        const percentage = score / total;
        if (percentage >= 0.9) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (percentage >= 0.8) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        if (percentage >= 0.7) return 'text-orange-600 bg-orange-50 border-orange-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Navigation */}
            <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            {/* Hero Header */}
            <div className={cn(
                "relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-500",
                getGradeColor(course.average)
            )}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-90 flex-wrap">
                            <span className="text-sm font-bold uppercase tracking-wider border border-current px-2 py-0.5 rounded-full">
                                Period {course.period || '?'}
                            </span>
                            {course.room && (
                                <span className="text-sm font-bold uppercase tracking-wider border border-current px-2 py-0.5 rounded-full">
                                    Room {course.room}
                                </span>
                            )}
                            {course.days && (
                                <span className="text-sm font-bold uppercase tracking-wider border border-current px-2 py-0.5 rounded-full">
                                    Days {course.days}
                                </span>
                            )}
                            <span className="text-sm font-medium">{course.teacher}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl">
                            {course.name}
                        </h1>
                    </div>

                    {/* Grade Circles */}
                    <div className="flex items-center gap-4 md:gap-8 text-center">
                        {/* Formative */}
                        <div className="hidden md:block">
                            <div className="text-2xl font-bold opacity-90">
                                {course.categories.find(c => c.name.toLowerCase().includes('formative'))?.average || '-'}%
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Formative</div>
                        </div>

                        {/* Overall */}
                        <div className="text-right">
                            <div className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                                {course.average}<span className="text-4xl md:text-5xl opacity-60">%</span>
                            </div>
                            <div className="text-xl font-bold opacity-80 mt-1">{course.letterGrade} Average</div>
                        </div>

                        {/* Summative */}
                        <div className="hidden md:block">
                            <div className="text-2xl font-bold opacity-90">
                                {course.categories.find(c => c.name.toLowerCase().includes('summative'))?.average || '-'}%
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Summative</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Grade Breakdown (visible only on small screens) */}
                <div className="md:hidden grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black/10">
                    <div>
                        <div className="text-2xl font-bold opacity-90">
                            {course.categories.find(c => c.name.toLowerCase().includes('formative'))?.average || '-'}%
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">Formative</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold opacity-90">
                            {course.categories.find(c => c.name.toLowerCase().includes('summative'))?.average || '-'}%
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">Summative</div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/5 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Insights Toggle */}
                    <Button
                        variant="outline"
                        className="w-full justify-between py-6 text-lg font-semibold"
                        onClick={() => setShowInsights(!showInsights)}
                    >
                        <span className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Grade Breakdown & Insights
                        </span>
                        {showInsights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>

                    {/* Collapsible Insights Section */}
                    {showInsights && (
                        <div className="animate-in slide-in-from-top-4 duration-300 space-y-8">

                            {/* Charts Container */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pie Chart: Grade Breakdown */}
                                <Card className="border-none shadow-sm bg-secondary/20">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Category Weights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[250px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={course.categories.map(c => ({ name: c.name, value: c.average }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {course.categories.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#3B82F6', '#EC4899'][index % 4]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Line Chart: Assignment Trend */}
                                <Card className="border-none shadow-sm bg-secondary/20">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Grade Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={course.assignments.filter(a => a.score !== null).reverse()}>
                                                <XAxis dataKey="name" hide />
                                                <YAxis domain={[0, 100]} hide />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="#10B981"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: '#10B981' }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {course.categories.map((cat) => (
                                    <Card key={cat.name} className="overflow-hidden border-none shadow-sm bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 truncate" title={cat.name}>
                                                {cat.name}
                                            </div>
                                            <div className="text-2xl font-black tracking-tight">
                                                {cat.average}%
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 font-medium">
                                                Weight: {cat.weight * 100}%
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assignments List */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" />
                            Assignments
                        </h2>
                        <div className="space-y-3">
                            {course.assignments.map((assignment, index) => (
                                <div
                                    key={assignment.id}
                                    className="group bg-card hover:bg-accent/5 border border-border/50 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                                                {assignment.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {assignment.dueDate}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-base truncate pr-4">
                                            {assignment.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-lg font-black px-3 py-1 rounded-lg border",
                                                assignment.score !== null ? getScoreColor(assignment.score, assignment.totalPoints) : "text-muted-foreground bg-secondary border-transparent"
                                            )}>
                                                {assignment.score === null ? '-' : assignment.score}
                                                <span className="text-xs font-normal opacity-60 ml-1">/ {assignment.totalPoints}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="sticky top-6">
                        <WhatIfCalculator course={course} />
                    </div>
                </div>
            </div>
        </div>
    );
}
