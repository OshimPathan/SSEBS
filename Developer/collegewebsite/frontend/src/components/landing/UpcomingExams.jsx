import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen, MapPin, ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react';
import { getPublishedExamSchedule } from '../../api';

const examTypeColors = {
    'First Terminal': 'bg-blue-500',
    'Second Terminal': 'bg-indigo-500',
    'Third Terminal': 'bg-violet-500',
    'Final': 'bg-red-500',
    'Weekly Test': 'bg-teal-500',
    'Unit Test': 'bg-cyan-500',
    'Mid-term': 'bg-amber-500',
    'Pre-board': 'bg-orange-500',
};

const UpcomingExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPublishedExamSchedule()
            .then(data => {
                // Show only upcoming or recent exams (next 60 days or started in last 7 days)
                const now = new Date();
                const filtered = (data || []).filter(e => {
                    if (!e.start_date) return false;
                    const start = new Date(e.start_date);
                    const daysDiff = (start - now) / (1000 * 60 * 60 * 24);
                    return daysDiff >= -7 && daysDiff <= 60;
                });
                setExams(filtered.slice(0, 6));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const formatTime = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    if (loading) return null;
    if (exams.length === 0) return null;

    return (
        <section className="py-16 bg-gradient-to-b from-white to-primary/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                        <ClipboardCheck className="w-4 h-4" /> Examination Schedule
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 font-serif">Upcoming Exams</h2>
                    <p className="text-gray-500 mt-2 max-w-xl mx-auto">Stay informed about upcoming terminal exams, tests, and assessments</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {exams.map(exam => {
                        const bgColor = examTypeColors[exam.exam_type] || 'bg-gray-500';
                        const routineCount = exam.routines?.length || 0;
                        const nextRoutine = exam.routines?.[0];
                        const daysUntil = exam.start_date ? Math.ceil((new Date(exam.start_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

                        return (
                            <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                                <div className={`${bgColor} px-5 py-3 flex items-center justify-between`}>
                                    <span className="text-white text-xs font-bold uppercase tracking-wider">{exam.exam_type || 'Exam'}</span>
                                    {daysUntil !== null && (
                                        <span className="text-white/90 text-xs font-medium">
                                            {daysUntil > 0 ? `${daysUntil} day${daysUntil !== 1 ? 's' : ''} away` : daysUntil === 0 ? 'Today!' : 'Ongoing'}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{exam.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{exam.class_name}</p>

                                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(exam.start_date)}
                                            {exam.end_date && exam.end_date !== exam.start_date ? ` — ${formatDate(exam.end_date)}` : ''}
                                        </span>
                                        {routineCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3.5 h-3.5" /> {routineCount} subject{routineCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    {nextRoutine && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs">
                                            <p className="font-semibold text-gray-700 mb-1">Next: {nextRoutine.subject_name}</p>
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(nextRoutine.exam_date)}</span>
                                                {nextRoutine.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(nextRoutine.start_time)}</span>}
                                                {nextRoutine.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {nextRoutine.room}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {exam.full_marks && (
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                            <span>Full Marks: <span className="font-semibold text-gray-600">{exam.full_marks}</span></span>
                                            {exam.pass_marks && <span>Pass Marks: <span className="font-semibold text-gray-600">{exam.pass_marks}</span></span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-8">
                    <Link to="/exam-schedule"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-colors">
                        View Full Exam Schedule <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default UpcomingExams;
