import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import AdmissionForm from './pages/AdmissionForm';
import ExamSchedule from './pages/ExamSchedule';
import ResultChecker from './pages/ResultChecker';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy-loaded dashboard pages (code-split into separate chunks)
const AdminDashboard = React.lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminStudents = React.lazy(() => import('./pages/dashboard/AdminStudents'));
const AdminTeachers = React.lazy(() => import('./pages/dashboard/AdminTeachers'));
const AdminClasses = React.lazy(() => import('./pages/dashboard/AdminClasses'));
const AdminParents = React.lazy(() => import('./pages/dashboard/AdminParents'));
const TeacherAttendance = React.lazy(() => import('./pages/dashboard/TeacherAttendance'));
const TeacherMarks = React.lazy(() => import('./pages/dashboard/TeacherMarks'));
const TeacherStudents = React.lazy(() => import('./pages/dashboard/TeacherStudents'));
const StudentNotices = React.lazy(() => import('./pages/dashboard/StudentNotices'));
const StudentResults = React.lazy(() => import('./pages/dashboard/StudentResults'));
const StudentFees = React.lazy(() => import('./pages/dashboard/StudentFees'));
const AdminNotices = React.lazy(() => import('./pages/dashboard/AdminNotices'));
const AdminEvents = React.lazy(() => import('./pages/dashboard/AdminEvents'));
const AdminGallery = React.lazy(() => import('./pages/dashboard/AdminGallery'));
const AdminPrograms = React.lazy(() => import('./pages/dashboard/AdminPrograms'));
const AdminExams = React.lazy(() => import('./pages/dashboard/AdminExams'));
const AdminReviews = React.lazy(() => import('./pages/dashboard/AdminReviews'));
const AdminAdmissions = React.lazy(() => import('./pages/dashboard/AdminAdmissions'));
const AdminFees = React.lazy(() => import('./pages/dashboard/AdminFees'));
const AdminSettings = React.lazy(() => import('./pages/dashboard/AdminSettings'));

const PageLoader = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admission" element={<AdmissionForm />} />
            <Route path="/exam-schedule" element={<ExamSchedule />} />
            <Route path="/results" element={<ResultChecker />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                <Route path="students" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminStudents /></Suspense></ProtectedRoute>} />
                <Route path="teachers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminTeachers /></Suspense></ProtectedRoute>} />
                <Route path="classes" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminClasses /></Suspense></ProtectedRoute>} />
                <Route path="parents" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminParents /></Suspense></ProtectedRoute>} />
                <Route path="attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><Suspense fallback={<PageLoader />}><TeacherAttendance /></Suspense></ProtectedRoute>} />
                <Route path="exams" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><Suspense fallback={<PageLoader />}><TeacherMarks /></Suspense></ProtectedRoute>} />
                <Route path="my-students" element={<ProtectedRoute allowedRoles={['TEACHER']}><Suspense fallback={<PageLoader />}><TeacherStudents /></Suspense></ProtectedRoute>} />
                <Route path="notices" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><StudentNotices /></Suspense></ProtectedRoute>} />
                <Route path="manage-notices" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminNotices /></Suspense></ProtectedRoute>} />
                <Route path="manage-events" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminEvents /></Suspense></ProtectedRoute>} />
                <Route path="manage-gallery" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminGallery /></Suspense></ProtectedRoute>} />
                <Route path="manage-programs" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminPrograms /></Suspense></ProtectedRoute>} />
                <Route path="manage-exams" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminExams /></Suspense></ProtectedRoute>} />
                <Route path="manage-reviews" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminReviews /></Suspense></ProtectedRoute>} />
                <Route path="admissions" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminAdmissions /></Suspense></ProtectedRoute>} />
                <Route path="manage-fees" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminFees /></Suspense></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suspense fallback={<PageLoader />}><AdminSettings /></Suspense></ProtectedRoute>} />
                <Route path="results" element={<ProtectedRoute allowedRoles={['ADMIN', 'STUDENT', 'PARENT']}><Suspense fallback={<PageLoader />}><StudentResults /></Suspense></ProtectedRoute>} />
                <Route path="fees" element={<ProtectedRoute allowedRoles={['ADMIN', 'STUDENT', 'PARENT']}><Suspense fallback={<PageLoader />}><StudentFees /></Suspense></ProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
