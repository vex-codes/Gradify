
export function Planner() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Planner</h1>
            <p className="text-muted-foreground">Assignment tracking and due dates coming soon.</p>
        </div>
    );
}

export function Insights() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">Grade trends and GPA analysis coming soon.</p>
        </div>
    );
}



export function Settings() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Theme and account management coming soon.</p>
        </div>
    );
}

export default function Placeholders({ title }: { title: string }) {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
}
