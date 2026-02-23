import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    School, Home, Calendar, Clock, BookOpen, MapPin, Loader2, Search,
    ChevronDown, FileText, AlertCircle, ClipboardCheck, Filter
} from 'lucide-react';
import { getPublishedExamSchedule } from '../api';

const examTypeColors = {
    'First Terminal': 'bg-blue-50 text-blue-600 border-blue-200',
    'Second Terminal': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    'Third Terminal': 'bg-violet-50 text-violet-600 border-violet-200',
    'Final': 'bg-red-50 text-red-600 border-red-200',
    'Weekly Test': 'bg-teal-50 text-teal-600 border-teal-200',
    'Unit Test': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    'Mid-term': 'bg-amber-50 text-amber-600 border-amber-200',
    'Pre-board': 'bg-orange-50 text-orange-600 border-orange-200',
};

const ExamSchedule = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterClass, setFilterClass] = useState('');
    const [filterType, setFilterType] = useState('');
    const [expandedExam, setExpandedExam] = useState(null);

    useEffect(() => {
        getPublishedExamSchedule()
            .then(data => {
                setExams(data);
                // Auto-expand first exam with routines
                const first = data.find(e => e.routines?.length > 0);
                if (first) setExpandedExam(first.id);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const classNames = [...new Set(exams.map(e => e.class_name))].filter(Boolean).sort();
    const examTypes = [...new Set(exams.map(e => e.exam_type))].filter(Boolean);

    const filtered = exams.filter(e => {
        if (filterClass && e.class_name !== filterClass) return false;
        if (filterType && e.exam_type !== filterType) return false;
        return true;
    });

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5">
            {/* Top Bar */}
            <div className="bg-primary text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <School className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-wide">SEVEN STAR ENGLISH BOARDING SCHOOL</h1>
                            <p className="text-[10px] text-white/70">Devdaha, Rupandehi, Nepal</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/results" className="text-xs text-white/70 hover:text-white transition-colors hidden sm:block">
                            Check Results
                        </Link>
                        <Link to="/" className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" /> Home
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <ClipboardCheck className="w-3.5 h-3.5" /> Exam Department
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">Examination Schedule</h2>
                    <p className="text-sm text-gray-500 mt-2">View upcoming and past exam schedules with subject-wise dates and timings</p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <Link to="/results" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary/30 hover:text-primary transition-colors shadow-sm">
                        <FileText className="w-4 h-4" /> Check Results Online
                    </Link>
                    <Link to="/admission" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary/30 hover:text-primary transition-colors shadow-sm">
                        <BookOpen className="w-4 h-4" /> Apply for Admission
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-xs">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                            className="w-full appearance-none pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                            <option value="">All Classes</option>
                            {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                            <option value="">All Exam Types</option>
                            {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-gray-500 font-semibold text-lg">No Exam Schedules Found</h3>
                        <p className="text-gray-400 text-sm mt-1">Check back later for updated examination schedules.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(exam => {
                            const isExpanded = expandedExam === exam.id;
                            const typeColor = examTypeColors[exam.exam_type] || 'bg-gray-50 text-gray-600 border-gray-200';
                            const hasRoutines = exam.routines?.length > 0;

                            return (
                                <div key={exam.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Exam Header */}
                                    <button
                                        onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 text-left hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <ClipboardCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{exam.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColor}`}>
                                                        {exam.exam_type || 'Exam'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <BookOpen className="w-3 h-3" /> {exam.class_name}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3" /> {formatDate(exam.start_date)}
                                                        {exam.end_date && exam.end_date !== exam.start_date ? ` — ${formatDate(exam.end_date)}` : ''}
                                                    </span>
                                                </div>
                                                {(exam.full_marks || exam.pass_marks) && (
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                                        {exam.full_marks && <span>Full Marks: <strong className="text-gray-600">{exam.full_marks}</strong></span>}
                                                        {exam.pass_marks && <span>Pass Marks: <strong className="text-gray-600">{exam.pass_marks}</strong></span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {hasRoutines && (
                                                <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">
                                                    {exam.routines.length} subjects
                                                </span>
                                            )}
                                            {exam.published && (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                                    Results Published
                                                </span>
                                            )}
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    {/* Expanded Routine Table */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 animate-fade-in">
                                            {hasRoutines ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-50">
                                                                <th className="text-left py-3 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                                                                <th className="text-left py-3 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Day</th>
                                                                <th className="text-left py-3 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Subject</th>
                                                                <th className="text-center py-3 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Time</th>
                                                                <th className="text-center py-3 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Room</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {exam.routines.map((r, idx) => {
                                                                const d = new Date(r.exam_date);
                                                                const isToday = new Date().toDateString() === d.toDateString();
                                                                const isPast = d < new Date() && !isToday;
                                                                return (
                                                                    <tr key={r.id || idx} className={`transition-colors ${isToday ? 'bg-primary/5 font-semibold' : isPast ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                                                                        <td className="py-3.5 px-5">
                                                                            <span className={`text-sm ${isToday ? 'text-primary font-bold' : 'text-gray-700'}`}>
                                                                                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                            {isToday && <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">TODAY</span>}
                                                                        </td>
                                                                        <td className="py-3.5 px-5 text-gray-500 text-sm">
                                                                            {d.toLocaleDateString('en-US', { weekday: 'long' })}
                                                                        </td>
                                                                        <td className="py-3.5 px-5 font-semibold text-gray-800">{r.subject_name}</td>
                                                                        <td className="py-3.5 px-5 text-center text-gray-600">
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {formatTime(r.start_time)}{r.end_time ? ` — ${formatTime(r.end_time)}` : ''}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-3.5 px-5 text-center">
                                                                            {r.room ? (
                                                                                <span className="inline-flex items-center gap-1 text-gray-600">
                                                                                    <MapPin className="w-3 h-3" /> {r.room}
                                                                                </span>
                                                                            ) : '—'}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-10">
                                                    <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-400">Subject-wise schedule not yet published</p>
                                                    <p className="text-xs text-gray-300 mt-1">Exam period: {formatDate(exam.start_date)} — {formatDate(exam.end_date)}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Info Note */}
                <div className="mt-10 bg-amber-50 border border-amber-100 rounded-xl p-5 max-w-2xl mx-auto">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-800 mb-1">Important Notice</h4>
                            <ul className="text-xs text-amber-700 space-y-1">
                                <li>• Students must carry their Student ID Card to the examination hall.</li>
                                <li>• Report 15 minutes before the scheduled time.</li>
                                <li>• Electronic devices (mobile phones, calculators*) are not allowed.</li>
                                <li>• For schedule changes, check the school notice board or contact the Exam Department.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-400">
                        Exam Department — Seven Star English Boarding School, Devdaha, Rupandehi •
                        <a href="tel:9779857078448" className="text-primary font-semibold hover:underline ml-1">9857078448</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExamSchedule;
