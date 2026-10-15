import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Reminder } from '@/lib/types';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Calendar() {
    const { courses, attendance } = useAuth(); // attendance added
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        const saved = localStorage.getItem('gradify-reminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newReminderTitle, setNewReminderTitle] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

    useEffect(() => {
        localStorage.setItem('gradify-reminders', JSON.stringify(reminders));
    }, [reminders]);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const getDayType = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) return null; // Weekend

        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return (dayOfYear % 2 !== 0) ? 'A' : 'B';
    };

    const getClassesForDay = (type: string | null) => {
        if (!type) return [];
        return courses.filter(c => {
            if (!c.days) return false;
            if (c.days.includes(type)) return true; // "A" or "B"
            if (c.days.toLowerCase().includes('daily')) return true;
            return false;
        });
    };

    const addReminder = () => {
        if (!selectedDate || !newReminderTitle) return;

        // Format date as YYYY-MM-DD local
        const dateStr = selectedDate.toLocaleDateString('en-CA');

        const newReminder: Reminder = {
            id: Date.now().toString(),
            courseId: selectedCourseId,
            title: newReminderTitle,
            date: dateStr,
            completed: false
        };

        setReminders([...reminders, newReminder]);
        setNewReminderTitle('');
        setIsAddModalOpen(false);
    };

    const toggleReminder = (id: string) => {
        setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const deleteReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const getRemindersForDate = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toLocaleDateString('en-CA');
        return reminders.filter(r => r.date === dateStr);
    };

    const getAttendanceForDate = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        // Strict Client-Side Filter: Hide attendance for any future date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) return null;

        const dateStr = date.toLocaleDateString('en-CA');
        return attendance?.find(a => a.date === dateStr);
    }

    const getAttendanceColor = (code: string) => {
        switch (code) {
            case 'A': return 'bg-blue-600 text-white border-blue-700';
            case 'P': return 'bg-emerald-600 text-white border-emerald-700'; // Darker green
            case 'T': return 'bg-yellow-500 text-black border-yellow-600';
            case 'H': return 'bg-[#C0C0C0] text-black border-gray-400'; // Gray for School Closed
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">Manage your schedule and attendance</p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-lg shadow-sm">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold w-32 text-center select-none">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}

                {Array.from({ length: firstDayOfMonth(currentDate) }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-32 sm:h-40 bg-muted/20 rounded-xl" />
                ))}

                {Array.from({ length: daysInMonth(currentDate) }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isToday = new Date().toDateString() === date.toDateString();
                    const dayType = getDayType(day);
                    const classes = getClassesForDay(dayType);
                    const dayReminders = getRemindersForDate(day);
                    const dayAttendance = getAttendanceForDate(day);

                    return (
                        <div
                            key={day}
                            onClick={() => {
                                setSelectedDate(date);
                                setIsAddModalOpen(true);
                            }}
                            className={cn(
                                "h-32 sm:h-40 bg-card border rounded-xl p-2 sm:p-3 relative cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group flex flex-col justify-between",
                                isToday ? "border-primary shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "border-border"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}>
                                    {day}
                                </span>
                                {dayType && (
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                        dayType === 'A' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                    )}>
                                        {dayType}
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 flex flex-col justify-start mt-1 gap-1 overflow-hidden">
                                {/* Attendance Marker */}
                                {dayAttendance && (
                                    <div className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded w-full text-center border truncate shadow-sm",
                                        getAttendanceColor(dayAttendance.code)
                                    )}>
                                        {dayAttendance.description}
                                    </div>
                                )}

                                {/* Reminders Dots/List */}
                                {!dayAttendance && (
                                    <div className="space-y-1">
                                        {dayReminders.slice(0, 2).map(r => (
                                            <div key={r.id} className="text-[10px] truncate bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-1 rounded">
                                                {r.title}
                                            </div>
                                        ))}
                                        {dayReminders.length > 2 && (
                                            <div className="text-[10px] text-muted-foreground pl-1">
                                                +{dayReminders.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Classes List (faded) */}
                            {!dayAttendance && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2 hidden sm:block">
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Classes</div>
                                    <div className="flex flex-wrap gap-1">
                                        {classes.slice(0, 3).map(c => (
                                            <div key={c.id} className="h-1.5 w-1.5 rounded-full bg-primary/50" title={c.name} />
                                        ))}
                                        {classes.length > 3 && <span className="text-[10px] text-muted-foreground leading-none">...</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Attendance Legend */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-3">Attendance Key</h3>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-700 shadow-sm" />
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-600 border border-blue-700 shadow-sm" />
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#C0C0C0] border border-gray-400 shadow-sm" />
                        <span>School Closed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500 border border-yellow-600 shadow-sm" />
                        <span>Tardy</span>
                    </div>
                </div>
            </div>

            {/* Add/View Reminder Modal with Attendance Info */}
            {isAddModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h2>
                                {getAttendanceForDate(selectedDate.getDate()) ? (
                                    <div className={cn(
                                        "text-xs font-bold mt-1 px-2 py-0.5 rounded inline-block",
                                        getAttendanceColor(getAttendanceForDate(selectedDate.getDate())!.code)
                                    )}>
                                        Attendance: {getAttendanceForDate(selectedDate.getDate())!.description}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {getDayType(selectedDate.getDate()) ? `${getDayType(selectedDate.getDate())} Day Schedule` : 'No School'}
                                    </p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                                <span className="sr-only">Close</span>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Schedule List */}
                        <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Clock className="w-4 h-4" />
                                Schedule
                            </h3>
                            <div className="space-y-2">
                                {getClassesForDay(getDayType(selectedDate.getDate()))
                                    .sort((a, b) => (parseInt(a.period) || 99) - (parseInt(b.period) || 99))
                                    .map(c => (
                                        <div key={c.id} className="group relative overflow-hidden bg-background/60 hover:bg-background/80 transition-all p-3 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 shadow-sm hover:shadow-md flex justify-between items-center backdrop-blur-sm">
                                            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                    {c.period || '-'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{c.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{c.room || 'No Room'}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                                {c.teacher?.split(',')[0] || 'Teacher'}
                                            </div>
                                        </div>
                                    ))}
                                {getClassesForDay(getDayType(selectedDate.getDate())).length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground bg-background/30 rounded-xl border border-dashed border-border text-sm">
                                        No classes scheduled for this day
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reminders List */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                Tasks & Reminders
                            </h3>
                            <div className="space-y-2">
                                {getRemindersForDate(selectedDate.getDate()).map(r => (
                                    <div key={r.id} className="flex items-center gap-3 p-2 border border-border rounded-lg bg-card">
                                        <button
                                            onClick={() => toggleReminder(r.id)}
                                            className={cn(
                                                "w-5 h-5 rounded border border-primary flex items-center justify-center transition-colors",
                                                r.completed ? "bg-primary text-primary-foreground" : "bg-transparent"
                                            )}
                                        >
                                            {r.completed && <Check className="w-3 h-3" />}
                                        </button>
                                        <div className={cn("flex-1 text-sm", r.completed && "line-through text-muted-foreground")}>
                                            <div className="font-medium">{r.title}</div>
                                            <div className="text-xs text-muted-foreground">{courses.find(c => c.id === r.courseId)?.name || 'General'}</div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => deleteReminder(r.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add New Input */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Add New Reminder</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Read Chapter 4..."
                                    value={newReminderTitle}
                                    onChange={e => setNewReminderTitle(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    onKeyDown={e => e.key === 'Enter' && addReminder()}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1"
                                        value={selectedCourseId}
                                        onChange={e => setSelectedCourseId(e.target.value)}
                                    >
                                        <option value="">General</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <Button onClick={addReminder} disabled={!newReminderTitle}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
