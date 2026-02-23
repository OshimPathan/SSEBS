import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getTeacherDashboardStats, getStudentDashboardStats, getNotices } from '../../api';
import { Users, GraduationCap, BookOpen, FileText, TrendingUp, Calendar, CreditCard, ClipboardCheck, Bell, ArrowUpRight, Clock, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon, colorClass, trend, loading }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
                {icon}
            </div>
            {trend && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> {trend}
                </span>
            )}
        </div>
        {loading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-1"></div>
        ) : (
            <p className="text-2xl font-black text-gray-900">{value}</p>
        )}
        <p className="text-xs text-gray-400 font-medium mt-1">{title}</p>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const role = user?.role || 'ADMIN';
    const [stats, setStats] = useState(null);
    const [teacherStats, setTeacherStats] = useState(null);
    const [studentStats, setStudentStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [spotlightNotices, setSpotlightNotices] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (role === 'ADMIN') {
                    const data = await getDashboardStats();
                    setStats(data);
                } else if (role === 'TEACHER' && user?.teacher_id) {
                    const [adminData, tData] = await Promise.all([
                        getDashboardStats(),
                        getTeacherDashboardStats(user.teacher_id),
                    ]);
                    setStats(adminData);
                    setTeacherStats(tData);
                } else if ((role === 'STUDENT' || role === 'PARENT') && user?.student_id) {
                    const [adminData, sData] = await Promise.all([
                        getDashboardStats(),
                        getStudentDashboardStats(user.student_id),
                    ]);
                    setStats(adminData);
                    setStudentStats(sData);
                } else {
                    const data = await getDashboardStats();
                    setStats(data);
                }
            } catch (e) {
                console.error('Dashboard load error:', e);
            }
            setLoading(false);
        };
        loadData();
    }, [role, user?.teacher_id, user?.student_id]);

    const totalStudents = stats?.totalStudents || 0;
    const totalTeachers = stats?.totalTeachers || 0;
    const pendingFees = stats?.pendingFees || 0;
    const liveNotices = stats?.notices || [];
    const liveEvents = stats?.events || [];
    const liveRecentStudents = stats?.recentStudents || [];
    const weeklyAttendance = stats?.weeklyAttendance || [];
    const todayAttPercent = stats?.todayAttendancePercent || 0;

    const feeData = [
        { name: 'Paid', value: stats?.paidFees || 0, color: '#22c55e' },
        { name: 'Pending', value: stats?.pendingFees || 0, color: '#f97316' },
        { name: 'Overdue', value: stats?.overdueFees || 0, color: '#ef4444' },
    ];
    const hasFeeData = feeData.some(f => f.value > 0);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {role === 'ADMIN' ? 'Welcome back, Admin' : `Welcome, ${user?.name?.split(' ')[0] || ''}`} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening at Seven Star today.</p>
                </div>
                <p className="text-sm text-gray-400 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {role === 'ADMIN' && (
                    <>
                        <StatCard loading={loading} title="Total Students" value={totalStudents} icon={<GraduationCap className="w-6 h-6" />} colorClass="bg-blue-100 text-blue-600" />
                        <StatCard loading={loading} title="Total Teachers" value={totalTeachers} icon={<Users className="w-6 h-6" />} colorClass="bg-green-100 text-green-600" />
                        <StatCard loading={loading} title="Today's Attendance" value={todayAttPercent > 0 ? `${todayAttPercent}%` : 'No data'} icon={<ClipboardCheck className="w-6 h-6" />} colorClass="bg-purple-100 text-purple-600" />
                        <StatCard loading={loading} title="Pending Fees" value={pendingFees} icon={<CreditCard className="w-6 h-6" />} colorClass="bg-orange-100 text-orange-600" />
                    </>
                )}
                {role === 'TEACHER' && (
                    <>
                        <StatCard loading={loading} title="My Classes" value={teacherStats?.classCount ?? '—'} icon={<BookOpen className="w-6 h-6" />} colorClass="bg-blue-100 text-blue-600" />
                        <StatCard loading={loading} title="My Students" value={teacherStats?.studentCount ?? '—'} icon={<GraduationCap className="w-6 h-6" />} colorClass="bg-green-100 text-green-600" />
                        <StatCard loading={loading} title="Today's Attendance" value={teacherStats?.todayAttendancePercent > 0 ? `${teacherStats.todayAttendancePercent}%` : 'No data'} icon={<ClipboardCheck className="w-6 h-6" />} colorClass="bg-purple-100 text-purple-600" />
                        <StatCard loading={loading} title="My Subjects" value={teacherStats?.subjectCount ?? '—'} icon={<FileText className="w-6 h-6" />} colorClass="bg-orange-100 text-orange-600" />
                    </>
                )}
                {(role === 'STUDENT' || role === 'PARENT') && (
                    <>
                        <StatCard loading={loading} title="Class" value={studentStats?.className ?? '—'} icon={<BookOpen className="w-6 h-6" />} colorClass="bg-blue-100 text-blue-600" />
                        <StatCard loading={loading} title="Attendance" value={studentStats?.attendancePercent > 0 ? `${studentStats.attendancePercent}%` : '—'} icon={<ClipboardCheck className="w-6 h-6" />} colorClass="bg-green-100 text-green-600" />
                        <StatCard loading={loading} title="Overall GPA" value={studentStats?.gpa ?? '—'} icon={<TrendingUp className="w-6 h-6" />} colorClass="bg-purple-100 text-purple-600" />
                        <StatCard loading={loading} title="Pending Fees" value={studentStats?.pendingFees > 0 ? `₨ ${studentStats.pendingFees.toLocaleString()}` : '₨ 0'} icon={<CreditCard className="w-6 h-6" />} colorClass="bg-orange-100 text-orange-600" />
                    </>
                )}
            </div>

            {/* Charts Row - only for Admin */}
            {role === 'ADMIN' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Attendance Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900">Weekly Attendance Overview</h3>
                            <span className="text-xs text-gray-400 font-medium">Last 6 school days</span>
                        </div>
                        {loading ? (
                            <div className="h-[280px] flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                            </div>
                        ) : weeklyAttendance.length > 0 && weeklyAttendance.some(d => d.present > 0 || d.absent > 0) ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={weeklyAttendance}>
                                    <defs>
                                        <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 700, color: '#1e293b' }} />
                                    <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="url(#presentGrad)" strokeWidth={2.5} name="Present" />
                                    <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="url(#absentGrad)" strokeWidth={2.5} name="Absent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                                No attendance data recorded this week
                            </div>
                        )}
                    </div>

                    {/* Fee Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Fee Collection Status</h3>
                        {loading ? (
                            <div className="h-[180px] flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                            </div>
                        ) : hasFeeData ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                            {feeData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {feeData.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 text-xs">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-gray-500 font-medium">{item.name} ({item.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">
                                No fee records found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Notices */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900">Recent Notices</h3>
                        <Bell className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {liveNotices.length > 0 ? liveNotices.map((notice) => (
                            <div key={notice.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="flex items-start gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${notice.target_role === 'ALL' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{notice.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{notice.created_at ? new Date(notice.created_at).toLocaleDateString() : ''}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-4">No notices yet</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900">Upcoming Events</h3>
                        <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {liveEvents.length > 0 ? liveEvents.map((event) => (
                            <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{event.title}</p>
                                    <p className="text-xs text-gray-400">{event.start_date ? new Date(event.start_date).toLocaleDateString() : ''} • {event.location || ''}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
                        )}
                    </div>
                </div>

                {/* Recent Students */}
                {role === 'ADMIN' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900">Recent Students</h3>
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            {liveRecentStudents.length > 0 ? liveRecentStudents.map((student, idx) => (
                                <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                        {student.avatar}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{student.name}</p>
                                        <p className="text-xs text-gray-400">{student.admNo}</p>
                                    </div>
                                    <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md shrink-0">{student.class}</span>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-4">No students yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;