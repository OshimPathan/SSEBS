import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    Calendar, FileText, LogOut, Menu, X,
    MessageSquareWarning, ClipboardCheck, CreditCard,
    Award, Bell, ChevronDown, UserCheck, Megaphone, CalendarPlus,
    ImagePlus, LibraryBig, Star, UserPlus, ClipboardList, Settings, DollarSign
} from 'lucide-react';

const SidebarLink = ({ to, icon, label, onClick }) => (
    <NavLink
        to={to}
        end
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`
        }
    >
        {icon}
        <span className="text-sm">{label}</span>
    </NavLink>
);

const DashboardLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const role = user?.role || 'STUDENT';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleColor = (r) => {
        switch (r) {
            case 'ADMIN': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
            case 'TEACHER': return 'bg-green-500/20 text-green-300 border-green-400/30';
            case 'STUDENT': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
            case 'PARENT': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
        }
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
                <BookOpen className="h-8 w-8 text-accent mr-3 shrink-0" />
                <div className="min-w-0">
                    <h1 className="font-bold text-lg leading-tight text-white truncate">Seven Star</h1>
                    <p className="text-xs text-accent font-medium">School Management</p>
                </div>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent text-primary-dark flex items-center justify-center font-bold text-sm shrink-0">
                        {getInitials(user?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium inline-block mt-0.5 ${getRoleColor(role)}`}>
                            {role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <SidebarLink to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" onClick={closeSidebar} />

                {/* Admin routes */}
                {role === 'ADMIN' && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Management</div>
                        <SidebarLink to="/dashboard/students" icon={<GraduationCap className="w-5 h-5" />} label="Students" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/teachers" icon={<Users className="w-5 h-5" />} label="Teachers" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/classes" icon={<BookOpen className="w-5 h-5" />} label="Classes & Subjects" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/parents" icon={<UserCheck className="w-5 h-5" />} label="Parents" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/manage-fees" icon={<DollarSign className="w-5 h-5" />} label="Fee Management" onClick={closeSidebar} />
                    </>
                )}

                {/* Admin + Teacher routes */}
                {(role === 'ADMIN' || role === 'TEACHER') && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Academics</div>
                        <SidebarLink to="/dashboard/attendance" icon={<ClipboardCheck className="w-5 h-5" />} label="Attendance" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/exams" icon={<FileText className="w-5 h-5" />} label="Exams & Marks" onClick={closeSidebar} />
                    </>
                )}

                {/* Teacher-only routes */}
                {role === 'TEACHER' && (
                    <>
                        <SidebarLink to="/dashboard/my-students" icon={<GraduationCap className="w-5 h-5" />} label="My Students" onClick={closeSidebar} />
                    </>
                )}

                {/* Student/Parent routes */}
                {(role === 'STUDENT' || role === 'PARENT') && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Academics</div>
                        <SidebarLink to="/dashboard/results" icon={<Award className="w-5 h-5" />} label="Results" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/fees" icon={<CreditCard className="w-5 h-5" />} label="Fee Details" onClick={closeSidebar} />
                    </>
                )}

                {/* Admin Communication */}
                {role === 'ADMIN' && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Communication</div>
                        <SidebarLink to="/dashboard/manage-notices" icon={<Megaphone className="w-5 h-5" />} label="Manage Notices" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/manage-events" icon={<CalendarPlus className="w-5 h-5" />} label="Manage Events" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/manage-exams" icon={<ClipboardList className="w-5 h-5" />} label="Manage Exams" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/notices" icon={<MessageSquareWarning className="w-5 h-5" />} label="View Notices" onClick={closeSidebar} />
                    </>
                )}

                {/* Admin Website Content */}
                {role === 'ADMIN' && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Website Content</div>
                        <SidebarLink to="/dashboard/manage-gallery" icon={<ImagePlus className="w-5 h-5" />} label="Gallery Photos" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/manage-programs" icon={<LibraryBig className="w-5 h-5" />} label="Programs & Syllabus" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/manage-reviews" icon={<Star className="w-5 h-5" />} label="Reviews / Testimonials" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/admissions" icon={<UserPlus className="w-5 h-5" />} label="Admissions" onClick={closeSidebar} />
                        <SidebarLink to="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Site Settings" onClick={closeSidebar} />
                    </>
                )}

                {/* Non-Admin Communication */}
                {role !== 'ADMIN' && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Communication</div>
                        <SidebarLink to="/dashboard/notices" icon={<MessageSquareWarning className="w-5 h-5" />} label="Notices" onClick={closeSidebar} />
                    </>
                )}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-300 hover:bg-red-500/15 w-full transition-colors text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={closeSidebar} />
            )}

            {/* Sidebar - Mobile (Drawer) */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-primary-dark to-[#0a1045] flex flex-col
                transform transition-transform duration-300 ease-in-out md:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <button onClick={closeSidebar} className="absolute top-6 right-4 text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
                {sidebarContent}
            </aside>

            {/* Sidebar - Desktop */}
            <aside className="w-72 bg-gradient-to-b from-primary-dark to-[#0a1045] flex-shrink-0 hidden md:flex flex-col shadow-2xl z-20">
                {sidebarContent}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-primary p-1">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-lg font-bold text-gray-800">
                                {role === 'ADMIN' ? 'Admin Panel' :
                                 role === 'TEACHER' ? 'Teacher Panel' :
                                 role === 'STUDENT' ? 'Student Portal' : 'Parent Portal'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                                {getInitials(user?.name)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
