import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { CourseDetail } from '@/pages/CourseDetail';
import GPACalculator from '@/pages/GPA';
import { Calendar } from '@/pages/Calendar';
import { ContactTeachers } from '@/pages/ContactTeachers';
import { Settings } from '@/pages/Settings';
import Placeholders from '@/pages/Placeholders';
import { Login } from '@/pages/Login';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return user ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/course/:id" element={<CourseDetail />} />
                            <Route path="/teachers" element={<ContactTeachers />} />
                            <Route path="/grades" element={<Placeholders title="Grades" />} />
                            <Route path="/gpa" element={<GPACalculator />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
