import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Save, Search, CheckCircle2, ArrowDown, Clipboard, BarChart3, AlertTriangle, ShieldCheck, ShieldX, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherClasses, getExams, getTeacherSubjectsForClass, getStudentsByClass, getResults, saveMarks } from '../../api';

const getGrade = (marks) => {
    if (marks >= 90) return { grade: 'A+', color: 'bg-emerald-50 text-emerald-700' };
    if (marks >= 80) return { grade: 'A', color: 'bg-emerald-50 text-emerald-600' };
    if (marks >= 70) return { grade: 'B+', color: 'bg-blue-50 text-blue-700' };
    if (marks >= 60) return { grade: 'B', color: 'bg-blue-50 text-blue-600' };
    if (marks >= 50) return { grade: 'C+', color: 'bg-amber-50 text-amber-700' };
    if (marks >= 40) return { grade: 'C', color: 'bg-amber-50 text-amber-600' };
    return { grade: 'F', color: 'bg-red-50 text-red-600' };
};

const TeacherMarks = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [examsList, setExamsList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [saved, setSaved] = useState(false);
    const [fillAll, setFillAll] = useState('');
    const [showPasteHint, setShowPasteHint] = useState(false);
    const inputRefs = useRef({});

    useEffect(() => {
        if (user?.teacher_id) {
            Promise.all([
                getTeacherClasses(user.teacher_id),
                getExams(),
            ]).then(([clsRes, exRes]) => {
                const cls = clsRes.classes || [];
                const exams = exRes.exams || [];
                setClasses(cls);
                setExamsList(exams);
                if (cls.length > 0) {
                    setSelectedClass(cls[0].id);
                    loadSubjects(cls[0].id);
                }
                if (exams.length > 0) setSelectedExam(exams[0].id);
            }).catch(() => {});
        }
    }, [user?.teacher_id]);

    const loadSubjects = async (classId) => {
        try {
            const subs = await getTeacherSubjectsForClass(user.teacher_id, classId);
            setSubjectsList(subs);
            if (subs.length > 0) setSelectedSubject(subs[0].id);
        } catch (e) { /* ignore */ }
    };

    const loadStudents = async (classId, examId, subjectId) => {
        if (!classId || !examId || !subjectId) return;
        try {
            const [studentsList, existingResults] = await Promise.all([
                getStudentsByClass(classId),
                getResults(examId, subjectId),
            ]);
            const resMap = Object.fromEntries(existingResults.map(r => [r.student_id, r]));
            setStudents(studentsList.map(s => ({
                ...s,
                marks: resMap[s.id]?.marks_obtained || 0,
                editedMarks: resMap[s.id]?.marks_obtained ?? '',
                grade: resMap[s.id]?.grade || '',
                remarks: resMap[s.id]?.remarks || '',
                verified: resMap[s.id]?.verified || false,
            })));
        } catch (e) { /* ignore */ }
    };

    useEffect(() => {
        if (selectedClass && selectedExam && selectedSubject) {
            loadStudents(selectedClass, selectedExam, selectedSubject);
        }
    }, [selectedClass, selectedExam, selectedSubject]);

    const handleMarksChange = (id, value) => {
        const numVal = Math.min(100, Math.max(0, parseInt(value) || 0));
        setStudents(current =>
            current.map(s => s.id === id ? { ...s, editedMarks: value === '' ? '' : numVal } : s)
        );
        setSaved(false);
    };

    const handleSave = async () => {
        const marks = students.map(s => ({
            exam_id: selectedExam,
            student_id: s.id,
            subject_id: selectedSubject,
            marks_obtained: s.editedMarks || 0,
            total_marks: currentExam?.full_marks || 100,
            grade: getGrade(s.editedMarks || 0).grade,
            remarks: s.remarks || '',
        }));
        try {
            await saveMarks(marks);
            setStudents(current => current.map(s => ({
                ...s, marks: s.editedMarks || 0, grade: getGrade(s.editedMarks || 0).grade,
            })));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { /* ignore */ }
    };

    const currentExam = examsList.find(e => e.id === selectedExam) || { full_marks: 100, pass_marks: 40 };
    const currentSubject = subjectsList.find(s => s.id === selectedSubject);

    const handleFillAll = () => {
        if (fillAll === '') return;
        const val = Math.min(currentExam?.full_marks || 100, Math.max(0, parseInt(fillAll) || 0));
        setStudents(current => current.map(s => ({ ...s, editedMarks: val })));
        setSaved(false);
        setFillAll('');
    };

    const handlePasteMarks = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            const lines = text.trim().split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) return;
            // Try to parse as: roll_number\tmarks or just marks per line
            const hasTab = lines[0].includes('\t');
            if (hasTab) {
                // Format: roll_number\tmarks
                const parsed = {};
                lines.forEach(line => {
                    const [roll, marks] = line.split('\t').map(s => s.trim());
                    if (roll && marks) parsed[roll] = Math.min(currentExam?.full_marks || 100, Math.max(0, parseInt(marks) || 0));
                });
                setStudents(current => current.map(s => {
                    const m = parsed[s.roll_number];
                    return m !== undefined ? { ...s, editedMarks: m } : s;
                }));
            } else {
                // Just marks in order
                const marks = lines.map(l => Math.min(currentExam?.full_marks || 100, Math.max(0, parseInt(l) || 0)));
                setStudents(current => current.map((s, i) => i < marks.length ? { ...s, editedMarks: marks[i] } : s));
            }
            setSaved(false);
        } catch { /* clipboard not available */ }
    }, [currentExam]);

    const handleKeyDown = (e, studentId, studentIdx) => {
        const studentIds = filteredStudents.map(s => s.id);
        const currentIdx = studentIds.indexOf(studentId);
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
            const nextId = studentIds[currentIdx + 1];
            if (nextId && inputRefs.current[nextId]) inputRefs.current[nextId].focus();
        } else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) {
            e.preventDefault();
            const prevId = studentIds[currentIdx - 1];
            if (prevId && inputRefs.current[prevId]) inputRefs.current[prevId].focus();
        }
    };

    const filteredStudents = students.filter(s =>
        !search || s.name.toLowerCase().includes(search.toLowerCase())
    );

    const stats = useMemo(() => {
        const validMarks = students.filter(s => s.editedMarks !== '').map(s => Number(s.editedMarks));
        return {
            avg: validMarks.length ? Math.round(validMarks.reduce((a, b) => a + b, 0) / validMarks.length) : 0,
            highest: validMarks.length ? Math.max(...validMarks) : 0,
            lowest: validMarks.length ? Math.min(...validMarks) : 0,
            passed: validMarks.filter(m => m >= 40).length,
            failed: validMarks.filter(m => m < 40).length,
        };
    }, [students]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Results Entry</h1>
                    <p className="text-sm text-gray-500 mt-1">{currentExam?.name} — {currentSubject?.name} (Full Marks: {currentExam?.full_marks})</p>
                </div>
                <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all self-start ${saved ? 'bg-emerald-500' : 'bg-primary hover:bg-primary/90'}`}>
                    {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Marks</>}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); loadSubjects(e.target.value); }} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium">
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
                <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium">
                    {examsList.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                </select>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium">
                    {subjectsList.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Average', value: stats.avg, suffix: '%' },
                    { label: 'Highest', value: stats.highest },
                    { label: 'Lowest', value: stats.lowest },
                    { label: 'Passed', value: stats.passed, color: 'text-emerald-600' },
                    { label: 'Failed', value: stats.failed, color: 'text-red-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                        <p className={`text-xl font-bold ${s.color || 'text-gray-900'}`}>{s.value}{s.suffix || ''}</p>
                        <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-full sm:w-72 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                            <input type="number" value={fillAll} onChange={e => setFillAll(e.target.value)} placeholder="Fill all"
                                className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" min="0" max={currentExam?.full_marks || 100} />
                            <button onClick={handleFillAll} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors flex items-center gap-1" title="Fill all students with this mark">
                                <ArrowDown className="w-3 h-3" /> Fill
                            </button>
                        </div>
                        <button onClick={handlePasteMarks} className="px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-600 transition-colors flex items-center gap-1" title="Paste marks from clipboard (one per line, or roll_number[Tab]marks)">
                            <Clipboard className="w-3 h-3" /> Paste
                        </button>
                        {students.some(s => s.editedMarks !== '' && (parseInt(s.editedMarks) || 0) < (currentExam?.pass_marks || 40)) && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {students.filter(s => s.editedMarks !== '' && (parseInt(s.editedMarks) || 0) < (currentExam?.pass_marks || 40)).length} failing
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-3.5 px-5 w-16">Roll</th>
                                <th className="py-3.5 px-5">Student Name</th>
                                <th className="py-3.5 px-5 w-36">Marks (/{currentExam?.full_marks})</th>
                                <th className="py-3.5 px-5 w-20 text-center">Grade</th>
                                <th className="py-3.5 px-5 w-24 text-center">Status</th>
                                <th className="py-3.5 px-5 hidden md:table-cell">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student) => {
                                const gradeInfo = getGrade(student.editedMarks || 0);
                                const isFailing = (student.editedMarks || 0) < (currentExam?.pass_marks || 40);
                                return (
                                    <tr key={student.id} className={`hover:bg-gray-50/50 transition-colors ${isFailing && student.editedMarks !== '' ? 'bg-red-50/30' : ''}`}>
                                        <td className="py-3.5 px-5 font-bold text-gray-400 text-sm">{student.roll_number}</td>
                                        <td className="py-3.5 px-5">
                                            <span className="text-sm font-medium text-gray-800">{student.name}</span>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <input
                                                ref={el => inputRefs.current[student.id] = el}
                                                type="number"
                                                max={currentExam?.full_marks || 100}
                                                min="0"
                                                value={student.editedMarks}
                                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, student.id)}
                                                className={`w-full px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${isFailing && student.editedMarks !== '' ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                            />
                                        </td>
                                        <td className="py-3.5 px-5 text-center">
                                            {student.editedMarks !== '' && (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-5 text-center">
                                            {student.verified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700" title="Verified by admin — editing will reset verification">
                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                </span>
                                            ) : student.editedMarks !== '' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                                    <ShieldX className="w-3 h-3" /> Pending
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="py-3.5 px-5 hidden md:table-cell">
                                            <input
                                                type="text"
                                                value={student.remarks}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStudents(current => current.map(s => s.id === student.id ? { ...s, remarks: val } : s));
                                                    setSaved(false);
                                                }}
                                                placeholder="Remarks..."
                                                className="w-full px-3 py-2 border border-transparent hover:border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent focus:bg-white transition-all"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherMarks;
