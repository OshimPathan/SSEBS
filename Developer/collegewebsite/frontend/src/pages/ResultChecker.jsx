import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    School, Home, Search, Loader2, Calendar, BookOpen, Award, ChevronDown,
    FileText, Download, AlertCircle, ClipboardCheck, User, Hash, Trophy,
    CheckCircle, XCircle, TrendingUp, BarChart3
} from 'lucide-react';
import { getPublishedExamsForResults, checkResultPublic } from '../api';
import { generateReportCard } from '../utils/generateReportCard';

const getGrade = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (pct >= 80) return { grade: 'A', color: 'text-green-600' };
    if (pct >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (pct >= 60) return { grade: 'B', color: 'text-blue-600' };
    if (pct >= 50) return { grade: 'C+', color: 'text-yellow-600' };
    if (pct >= 40) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'F', color: 'text-red-600' };
};

const getDivision = (pct) => {
    if (pct >= 80) return { label: 'Distinction', color: 'bg-green-100 text-green-700 border-green-200' };
    if (pct >= 60) return { label: 'First Division', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (pct >= 45) return { label: 'Second Division', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    if (pct >= 32) return { label: 'Third Division', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' };
};

const ResultChecker = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [examsLoading, setExamsLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const resultRef = useRef(null);

    useEffect(() => {
        getPublishedExamsForResults()
            .then(data => setExams(data || []))
            .catch(() => {})
            .finally(() => setExamsLoading(false));
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!selectedExam || !rollNumber.trim()) {
            setError('Please select an exam and enter your roll number.');
            return;
        }
        setError('');
        setResult(null);
        setSearched(true);
        setLoading(true);
        try {
            const data = await checkResultPublic(selectedExam, rollNumber.trim());
            if (data?.error) {
                setError(data.error);
            } else if (!data || !data.subjects || data.subjects.length === 0) {
                setError('No results found. Please check your roll number and selected exam.');
            } else {
                setResult(data);
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }
        } catch (err) {
            setError(err?.message || 'Unable to fetch results. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!result) return;
        const examObj = exams.find(e => e.id === selectedExam);
        generateReportCard({
            studentName: result.student_name,
            rollNumber: result.roll_number,
            className: result.class_name || examObj?.class_name || '—',
            examName: result.exam_name || examObj?.name || 'Examination',
            subjects: result.subjects.map(s => ({
                name: s.subject_name,
                marks: s.marks_obtained,
                totalMarks: s.total_marks,
                grade: getGrade(s.marks_obtained, s.total_marks).grade
            })),
            totalMarks: result.total_obtained,
            maxMarks: result.total_marks,
            percentage: result.percentage,
            division: result.division
        });
    };

    const selectedExamName = exams.find(e => e.id === selectedExam)?.name || '';

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
                        <Link to="/exam-schedule" className="text-xs text-white/70 hover:text-white transition-colors hidden sm:block">
                            Exam Schedule
                        </Link>
                        <Link to="/" className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" /> Home
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <Award className="w-3.5 h-3.5" /> Result Checker
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">Check Your Results Online</h2>
                    <p className="text-sm text-gray-500 mt-2">Enter your roll number and select the examination to view your results</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Select Examination
                            </label>
                            <div className="relative">
                                <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
                                    className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    disabled={examsLoading}>
                                    <option value="">{examsLoading ? 'Loading exams...' : 'Choose an exam'}</option>
                                    {exams.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} — {e.class_name} ({e.exam_type})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Hash className="w-3.5 h-3.5 inline mr-1" /> Roll Number
                            </label>
                            <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                                placeholder="e.g. 1001"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {loading ? 'Checking...' : 'Check Result'}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div ref={resultRef} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-fade-in">
                        {/* Result Header */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Examination Result</p>
                                    <h3 className="text-xl font-bold">{result.exam_name || selectedExamName}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold">{result.percentage}%</p>
                                    <div className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                        result.percentage >= 60 ? 'bg-green-400/30 text-green-100' : 
                                        result.percentage >= 32 ? 'bg-yellow-400/30 text-yellow-100' : 'bg-red-400/30 text-red-100'
                                    }`}>
                                        {result.division}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Name</p>
                                    <p className="text-sm font-semibold text-gray-800">{result.student_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Roll No.</p>
                                    <p className="text-sm font-semibold text-gray-800">{result.roll_number}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Class</p>
                                    <p className="text-sm font-semibold text-gray-800">{result.class_name || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">GPA</p>
                                    <p className="text-sm font-semibold text-gray-800">{(result.percentage / 25).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Marks Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left py-3 px-5 font-semibold text-gray-600 text-xs uppercase">#</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-600 text-xs uppercase">Subject</th>
                                        <th className="text-center py-3 px-5 font-semibold text-gray-600 text-xs uppercase">Full Marks</th>
                                        <th className="text-center py-3 px-5 font-semibold text-gray-600 text-xs uppercase">Obtained</th>
                                        <th className="text-center py-3 px-5 font-semibold text-gray-600 text-xs uppercase">Grade</th>
                                        <th className="text-center py-3 px-5 font-semibold text-gray-600 text-xs uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {result.subjects.map((s, i) => {
                                        const { grade, color } = getGrade(s.marks_obtained, s.total_marks);
                                        const passed = (s.marks_obtained / s.total_marks) * 100 >= 32;
                                        return (
                                            <tr key={s.subject_name + i} className="hover:bg-gray-50/50">
                                                <td className="py-3 px-5 text-gray-400">{i + 1}</td>
                                                <td className="py-3 px-5 font-medium text-gray-800">{s.subject_name}</td>
                                                <td className="py-3 px-5 text-center text-gray-500">{s.total_marks}</td>
                                                <td className="py-3 px-5 text-center font-bold text-gray-800">{s.marks_obtained}</td>
                                                <td className={`py-3 px-5 text-center font-bold ${color}`}>{grade}</td>
                                                <td className="py-3 px-5 text-center">
                                                    {passed ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                                            <CheckCircle className="w-3.5 h-3.5" /> Pass
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                                                            <XCircle className="w-3.5 h-3.5" /> Fail
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                        <td className="py-3.5 px-5" colSpan={2}>Total</td>
                                        <td className="py-3.5 px-5 text-center">{result.total_marks}</td>
                                        <td className="py-3.5 px-5 text-center text-primary">{result.total_obtained}</td>
                                        <td className="py-3.5 px-5 text-center">{result.percentage}%</td>
                                        <td className="py-3.5 px-5 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDivision(result.percentage).color}`}>
                                                {result.division}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-gray-50/50 border-t border-gray-100">
                            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                <BarChart3 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-800">{result.total_obtained}/{result.total_marks}</p>
                                <p className="text-[10px] text-gray-400 uppercase">Total Marks</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-800">{result.percentage}%</p>
                                <p className="text-[10px] text-gray-400 uppercase">Percentage</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                <Award className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-800">{(result.percentage / 25).toFixed(2)}</p>
                                <p className="text-[10px] text-gray-400 uppercase">GPA (4.0)</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                <p className={`text-lg font-bold ${getDivision(result.percentage).color.split(' ')[1]}`}>{result.division}</p>
                                <p className="text-[10px] text-gray-400 uppercase">Division</p>
                            </div>
                        </div>

                        {/* Download Button */}
                        <div className="p-5 border-t border-gray-100 text-center">
                            <button onClick={handleDownloadPDF}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
                                <Download className="w-4 h-4" /> Download Report Card (PDF)
                            </button>
                        </div>
                    </div>
                )}

                {/* No Result Searched But Empty */}
                {searched && !loading && !result && !error && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-gray-500 font-semibold text-lg">No Results Found</h3>
                        <p className="text-gray-400 text-sm mt-1">Please verify your roll number and exam selection.</p>
                    </div>
                )}

                {/* Quick Links */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to="/exam-schedule" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary/30 hover:text-primary transition-colors shadow-sm">
                        <ClipboardCheck className="w-4 h-4" /> View Exam Schedule
                    </Link>
                    <Link to="/" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary/30 hover:text-primary transition-colors shadow-sm">
                        <Home className="w-4 h-4" /> Back to Home
                    </Link>
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

export default ResultChecker;
