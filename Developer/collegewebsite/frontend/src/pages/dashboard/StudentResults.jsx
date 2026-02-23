import React, { useState, useEffect } from 'react';
import { Award, Download, TrendingUp, Trophy, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentResults } from '../../api';
import { generateReportCard } from '../../utils/generateReportCard';

const getGradeColor = (grade) => {
    if (grade.includes('A+')) return 'bg-emerald-100 text-emerald-700';
    if (grade.includes('A')) return 'bg-emerald-50 text-emerald-600';
    if (grade.includes('B+')) return 'bg-blue-100 text-blue-700';
    if (grade.includes('B')) return 'bg-blue-50 text-blue-600';
    if (grade.includes('C')) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
};

const StudentResults = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        if (user?.student_id) {
            getStudentResults(user.student_id).then(res => {
                const loaded = res.exams || [];
                setExams(loaded);
                if (loaded.length > 0) setSelectedExam(loaded[0].id);
            }).catch(() => {});
        }
    }, [user?.student_id]);

    const exam = exams.find(e => e.id === selectedExam);

    const handleDownloadPDF = () => {
        if (!exam || !exam.subjects?.length) return;
        setPdfLoading(true);
        try {
            generateReportCard({
                studentName: user?.name || '',
                className: user?.class_name || '',
                rollNumber: exam.student?.rollNumber || '',
                examName: exam.name,
                examDate: exam.date || '',
                examType: exam.exam_type || '',
                subjects: exam.subjects,
            });
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setPdfLoading(false);
        }
    };

    if (!exam || !exam.subjects?.length) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
                <p className="text-sm text-gray-500">Loading results...</p>
            </div>
        );
    }

    const totalObtained = exam.subjects.reduce((s, sub) => s + sub.total, 0);
    const totalFull = exam.subjects.reduce((s, sub) => s + sub.full, 0);
    const percentage = ((totalObtained / totalFull) * 100).toFixed(1);
    const avgGPA = (exam.subjects.reduce((s, sub) => s + sub.gpa, 0) / exam.subjects.length).toFixed(2);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
                    <p className="text-sm text-gray-500 mt-1">{user?.name || ''} • {user?.class_name || ''} • Roll #{exam.student?.rollNumber || ''}</p>
                </div>
                <div className="flex gap-2">
                    <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                    <button onClick={handleDownloadPDF} disabled={pdfLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                        {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Marks', value: `${totalObtained}/${totalFull}`, icon: BookOpen, color: 'bg-primary/10 text-primary' },
                    { label: 'Percentage', value: `${percentage}%`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'GPA', value: avgGPA, icon: Award, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Result', value: percentage >= 80 ? 'Distinction' : percentage >= 60 ? 'First Division' : 'Second Division', icon: Trophy, color: 'bg-purple-50 text-purple-600' },
                ].map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Marksheet */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Subject-wise Results</h3>
                    <span className="text-sm text-gray-500 font-medium">{exam.date}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="py-3.5 px-5">Subject</th>
                                <th className="py-3.5 px-5 text-center">Theory</th>
                                <th className="py-3.5 px-5 text-center">Practical</th>
                                <th className="py-3.5 px-5 text-center">Total</th>
                                <th className="py-3.5 px-5 text-center">Grade</th>
                                <th className="py-3.5 px-5 text-center">GPA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {exam.subjects.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3.5 px-5 font-semibold text-gray-800 text-sm">{sub.name}</td>
                                    <td className="py-3.5 px-5 text-center text-sm text-gray-600">{sub.th}</td>
                                    <td className="py-3.5 px-5 text-center text-sm text-gray-600">{sub.pr !== null ? sub.pr : '—'}</td>
                                    <td className="py-3.5 px-5 text-center">
                                        <span className="text-sm font-bold text-gray-900">{sub.total}</span>
                                        <span className="text-xs text-gray-400">/{sub.full}</span>
                                    </td>
                                    <td className="py-3.5 px-5 text-center">
                                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                                    </td>
                                    <td className="py-3.5 px-5 text-center text-sm font-semibold text-gray-700">{sub.gpa}</td>
                                </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-gray-50 font-bold">
                                <td className="py-4 px-5 text-gray-900">Total</td>
                                <td className="py-4 px-5 text-center text-gray-600">{exam.subjects.reduce((s, sub) => s + sub.th, 0)}</td>
                                <td className="py-4 px-5 text-center text-gray-600">{exam.subjects.filter(s => s.pr !== null).reduce((s, sub) => s + sub.pr, 0)}</td>
                                <td className="py-4 px-5 text-center text-gray-900">{totalObtained}/{totalFull}</td>
                                <td className="py-4 px-5 text-center text-gray-900">{percentage}%</td>
                                <td className="py-4 px-5 text-center text-gray-900">{avgGPA}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentResults;
