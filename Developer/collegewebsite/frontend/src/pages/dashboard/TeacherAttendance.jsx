import React, { useState, useMemo, useEffect } from 'react';
import { Save, Search, Check, X as XIcon, Clock, CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherClasses, getStudentsByClass, getAttendanceByDate, saveAttendance } from '../../api';

const TeacherAttendance = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user?.teacher_id) {
            getTeacherClasses(user.teacher_id).then(res => {
                const cls = res.classes || [];
                setClasses(cls);
                if (cls.length > 0) {
                    setSelectedClass(cls[0].id);
                    loadStudents(cls[0].id, selectedDate);
                }
            }).catch(() => {});
        }
    }, [user?.teacher_id]);

    const loadStudents = async (classId, date) => {
        try {
            const studentsList = await getStudentsByClass(classId);
            const attendance = await getAttendanceByDate(classId, date);
            const attMap = Object.fromEntries(attendance.map(a => [a.student_id, a.status]));
            setStudents(studentsList.map(s => ({
                ...s,
                status: attMap[s.id] || 'PRESENT',
            })));
        } catch (e) { /* ignore */ }
    };

    const handleClassChange = (classId) => {
        setSelectedClass(classId);
        loadStudents(classId, selectedDate);
        setSaved(false);
    };

    const toggleStatus = (id, newStatus) => {
        setStudents(current => current.map(s => s.id === id ? { ...s, status: newStatus } : s));
        setSaved(false);
    };

    const markAllPresent = () => {
        setStudents(current => current.map(s => ({ ...s, status: 'PRESENT' })));
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            await saveAttendance(students.map(s => ({
                student_id: s.id,
                class_id: selectedClass,
                date: selectedDate,
                status: s.status,
                marked_by: user?.teacher_id,
            })));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { /* ignore */ }
    };

    const filteredStudents = students.filter(s =>
        !search || s.name.toLowerCase().includes(search.toLowerCase())
    );

    const stats = useMemo(() => ({
        present: students.filter(s => s.status === 'PRESENT').length,
        absent: students.filter(s => s.status === 'ABSENT').length,
        late: students.filter(s => s.status === 'LATE').length,
    }), [students]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                    <p className="text-sm text-gray-500 mt-1">{classes.find(c => c.id === selectedClass)?.name || ''} • {new Date(selectedDate).toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={markAllPresent} className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Mark All Present</button>
                    <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${saved ? 'bg-emerald-500' : 'bg-primary hover:bg-primary/90'}`}>
                        {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium">
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
                <div className="relative">
                    <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); loadStudents(selectedClass, e.target.value); }} className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Present', value: stats.present, color: 'bg-emerald-50 text-emerald-600', icon: Check },
                    { label: 'Absent', value: stats.absent, color: 'bg-red-50 text-red-600', icon: XIcon },
                    { label: 'Late', value: stats.late, color: 'bg-amber-50 text-amber-600', icon: Clock },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}><stat.icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-full sm:w-72 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">{student.roll_number}</span>
                                <span className="text-sm font-medium text-gray-800">{student.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {[
                                    { status: 'PRESENT', label: 'P', activeClass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200', inactiveClass: 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500' },
                                    { status: 'ABSENT', label: 'A', activeClass: 'bg-red-500 text-white shadow-lg shadow-red-200', inactiveClass: 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500' },
                                    { status: 'LATE', label: 'L', activeClass: 'bg-amber-500 text-white shadow-lg shadow-amber-200', inactiveClass: 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500' },
                                ].map(btn => (
                                    <button
                                        key={btn.status}
                                        onClick={() => toggleStatus(student.id, btn.status)}
                                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${student.status === btn.status ? btn.activeClass : btn.inactiveClass}`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
