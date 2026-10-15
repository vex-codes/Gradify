import { useState } from 'react';
import { Course, Assignment } from '@/lib/types';
import { Plus, Calculator, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatIfCalculatorProps {
    course: Course;
}

export function WhatIfCalculator({ course }: WhatIfCalculatorProps) {
    const [simulatedAssignments, setSimulatedAssignments] = useState<Assignment[]>([]);
    const [newAssignmentName, setNewAssignmentName] = useState('Hypothetical Assignment');
    const [newAssignmentScore, setNewAssignmentScore] = useState('');
    const [newAssignmentTotal, setNewAssignmentTotal] = useState('100');
    const [newAssignmentCategory, setNewAssignmentCategory] = useState('Formative');

    // Helper to get robust categories including defaults if missing
    const getRobustCategories = () => {
        // Normalize weights first (handle 60 vs 0.6)
        const cats = course.categories.map(c => ({
            ...c,
            weight: c.weight > 10 ? c.weight / 100 : c.weight // Assuming weight > 10 implies 0-100 scale (safe for 60, but what about 5?) 
            // Better: if any weight > 1, assume all are 0-100? No, mixed is possible? 
            // Lets just say if > 1 it's likely a percentage. 
            // If they have 5 categories each weight 1.0 (equally weighted)? 
            // Safe bet: if weight > 1, divide by 100.
        }));

        const hasFormative = cats.some(c => c.name.toLowerCase().includes('formative'));
        const hasSummative = cats.some(c => c.name.toLowerCase().includes('summative'));

        if (hasFormative && !hasSummative) {
            const formativeWeight = cats.find(c => c.name.toLowerCase().includes('formative'))?.weight || 0.6;
            cats.push({ name: 'Summative', weight: 1 - formativeWeight, average: 0 });
        } else if (!hasFormative && hasSummative) {
            const summativeWeight = cats.find(c => c.name.toLowerCase().includes('summative'))?.weight || 0.4;
            cats.push({ name: 'Formative', weight: 1 - summativeWeight, average: 0 });
        } else if (!hasFormative && !hasSummative) {
            // Default fallback if neither exist (rare but possible with weird scraping)
            cats.push({ name: 'Formative', weight: 0.6, average: 0 });
            cats.push({ name: 'Summative', weight: 0.4, average: 0 });
        }

        // Final check: ensure weights are roughly 0-1 for display consistency, 
        // though logic above ensures newly added ones are 0-1.
        return cats.map(c => ({
            ...c,
            weight: c.weight > 1 ? c.weight / 100 : c.weight
        }));
    };

    const categories = getRobustCategories();

    // Calculate original grade (simplified weighted average logic)
    const calculateGrade = (assignments: Assignment[]) => {
        let totalWeightedScore = 0;
        let totalWeight = 0;

        categories.forEach(cat => {
            const catAssignments = assignments.filter(a => a.category === cat.name && a.score !== null);
            if (catAssignments.length > 0) {
                const catTotalScore = catAssignments.reduce((sum, a) => sum + (a.score || 0), 0);
                const catTotalPoints = catAssignments.reduce((sum, a) => sum + a.totalPoints, 0);
                const catAverage = catTotalPoints > 0 ? (catTotalScore / catTotalPoints) : 0;

                totalWeightedScore += catAverage * cat.weight;
                totalWeight += cat.weight;
            } else if (simulatedAssignments.some(a => a.category === cat.name)) {
                // Even if no original assignments, if we simulated one, we count the weight
                // But average is calculated from simulated ones only
                // Logic below handles combined list, so if assignments is passed as 'currentAssignments', it includes simulated.
            }
        });

        // Re-loop with safe weights
        totalWeightedScore = 0;
        totalWeight = 0;

        categories.forEach(cat => {
            const catAssignments = assignments.filter(a => a.category === cat.name && a.score !== null);
            if (catAssignments.length > 0) {
                const catTotalScore = catAssignments.reduce((sum, a) => sum + (a.score || 0), 0);
                const catTotalPoints = catAssignments.reduce((sum, a) => sum + a.totalPoints, 0);
                const catAverage = catTotalPoints > 0 ? (catTotalScore / catTotalPoints) : 0;

                totalWeightedScore += catAverage * cat.weight;
                totalWeight += cat.weight;
            }
        });

        // If we have weights but no assignments in them, should we count them? 
        // Standard grading usually ignores empty categories unless policy says 0.
        // But for "What If", if I add a Summative, I want it to count.
        // The loop above naturally handles this: if `catAssignments.length > 0`, it adds to totalWeight.

        return totalWeight > 0 ? ((totalWeightedScore / totalWeight) * 100).toFixed(2) : '0.00';
    };

    const originalGradeVal = parseFloat(calculateGrade(course.assignments));
    const currentAssignments = [...course.assignments, ...simulatedAssignments];
    const simulatedGradeVal = parseFloat(calculateGrade(currentAssignments));

    // "Drift" Adjustment:
    const reportedAverage = course.average; // It's already a number
    // Fallback? If reportedAverage is 0 and original is 90, drift is -90? Yes, correct, purely relative.

    // However, if reportedAverage is somehow missing or validly 0 (unlikely for "B Average"), 
    // we should trust it. If it's undefined, we fallback.
    const baseline = reportedAverage !== undefined ? reportedAverage : originalGradeVal;

    const drift = baseline - originalGradeVal;

    // Adjusted grades
    const finalProjectedGrade = (simulatedGradeVal + drift).toFixed(2);

    const gradeDiff = parseFloat(finalProjectedGrade) - baseline;

    const addSimulation = () => {
        if (!newAssignmentScore || !newAssignmentTotal) return;

        const newAssignment: Assignment = {
            id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newAssignmentName,
            category: newAssignmentCategory,
            score: parseFloat(newAssignmentScore),
            totalPoints: parseFloat(newAssignmentTotal),
            dueDate: 'Hypothetical',
            weight: 1
        };

        setSimulatedAssignments([...simulatedAssignments, newAssignment]);
        setNewAssignmentName('Hypothetical Assignment');
        setNewAssignmentScore('');
    };

    const resetSimulation = () => {
        setSimulatedAssignments([]);
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">What-If Calculator</h2>
                </div>
                {simulatedAssignments.length > 0 && (
                    <button
                        onClick={resetSimulation}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                    <div className="text-sm text-muted-foreground">Projected Grade</div>
                    <div className={cn(
                        "text-3xl font-black tracking-tighter transition-colors",
                        gradeDiff > 0 ? "text-green-600" : gradeDiff < 0 ? "text-destructive" : "text-primary"
                    )}>
                        {finalProjectedGrade}%
                    </div>
                </div>
                {gradeDiff !== 0 && (
                    <div className={cn(
                        "text-sm font-bold px-2 py-1 rounded",
                        gradeDiff > 0 ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"
                    )}>
                        {gradeDiff > 0 ? '+' : ''}{gradeDiff.toFixed(2)}%
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Score</label>
                        <input
                            type="number"
                            value={newAssignmentScore}
                            onChange={(e) => setNewAssignmentScore(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="95"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Total Points</label>
                        <input
                            type="number"
                            value={newAssignmentTotal}
                            onChange={(e) => setNewAssignmentTotal(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="100"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium">Category</label>
                    <select
                        value={newAssignmentCategory}
                        onChange={(e) => setNewAssignmentCategory(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {categories.map(cat => (
                            <option key={cat.name} value={cat.name}>{cat.name} ({(cat.weight * 100).toFixed(0)}%)</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={addSimulation}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground h-9 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Hypothetical Assignment
                </button>
            </div>

            {simulatedAssignments.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Simulated Items</h3>
                    {simulatedAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex justify-between items-center text-sm p-2 bg-background border border-border rounded-md">
                            <span>{assignment.name} ({assignment.category})</span>
                            <span className="font-bold">{assignment.score}/{assignment.totalPoints}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
