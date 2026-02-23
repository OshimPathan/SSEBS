import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, GraduationCap, Phone, Mail, MapPin, Calendar, ChevronDown, ChevronUp, Eye, X, User, Heart, Globe, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherSubjectsWithClasses, getStudentsByClassDetailed } from '../../api';

const TeacherStudents = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [studentsByClass, setStudentsByClass] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedClass, setExpandedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [detailTab, setDetailTab] = useState('personal');

    useEffect(() => {
        if (user?.teacher_id) {
            loadData();
        }
    }, [user?.teacher_id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getTeacherSubjectsWithClasses(user.teacher_id);
            setClasses(res.classes || []);
            setSubjects(res.subjects || []);

            const studentsMap = {};
            for (const cls of (res.classes || [])) {
                const students = await getStudentsByClassDetailed(cls.id);
                studentsMap[cls.id] = students;
            }
            setStudentsByClass(studentsMap);

            if (res.classes?.length > 0) {
                setExpandedClass(res.classes[0].id);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const getSubjectsForClass = (classId) => {
        return subjects.filter(s => s.class_id === classId);
    };

    const totalStudents = useMemo(() => {
        return Object.values(studentsByClass).reduce((sum, arr) => sum + arr.length, 0);
    }, [studentsByClass]);

    const filteredStudents = useMemo(() => {
        const result = {};
        for (const [classId, students] of Object.entries(studentsByClass)) {
            if (!search) {
                result[classId] = students;
            } else {
                result[classId] = students.filter(s =>
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    s.admission_number?.toLowerCase().includes(search.toLowerCase()) ||
                    s.roll_number?.toString().includes(search)
                );
            }
        }
        return result;
    }, [studentsByClass, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {classes.length} {classes.length === 1 ? 'class' : 'classes'} • {totalStudents} total students
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                        <p className="text-xs text-gray-400 font-medium">Total Students</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                        <p className="text-xs text-gray-400 font-medium">Classes</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 col-span-2">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900">My Subjects</p>
                        <p className="text-xs text-gray-400 font-medium truncate">
                            {subjects.map(s => s.name).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, admission number, or roll number..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                />
            </div>

            {/* Classes Accordion */}
            <div className="space-y-4">
                {classes.map((cls) => {
                    const classStudents = filteredStudents[cls.id] || [];
                    const classSubs = getSubjectsForClass(cls.id);
                    const isExpanded = expandedClass === cls.id;

                    return (
                        <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Class Header */}
                            <button
                                onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-800 text-white flex items-center justify-center font-bold text-lg">
                                        {cls.name.replace('Class ', '').charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-bold text-gray-900">{cls.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {classStudents.length} students • {classSubs.map(s => s.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                                        {classStudents.length} students
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                            </button>

                            {/* Students Table */}
                            {isExpanded && (
                                <div className="border-t border-gray-100">
                                    {classStudents.length === 0 ? (
                                        <div className="py-12 text-center text-gray-400 text-sm">No students found</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        <th className="py-3 px-5 w-16">Roll</th>
                                                        <th className="py-3 px-5">Student</th>
                                                        <th className="py-3 px-5 hidden md:table-cell">Admission No.</th>
                                                        <th className="py-3 px-5 hidden lg:table-cell">Parent</th>
                                                        <th className="py-3 px-5 hidden lg:table-cell">Contact</th>
                                                        <th className="py-3 px-5 w-20 text-center">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {classStudents.map((student) => (
                                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-5">
                                                                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                                                                    {student.roll_number}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-5">
                                                                <div className="flex items-center gap-3">
                                                                    {student.photo_url ? (
                                                                        <img src={student.photo_url} alt={student.name} className="w-9 h-9 rounded-lg object-cover" />
                                                                    ) : (
                                                                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                                            {student.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                                                        <p className="text-xs text-gray-400">{student.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-5 hidden md:table-cell">
                                                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{student.admission_number}</span>
                                                            </td>
                                                            <td className="py-3 px-5 hidden lg:table-cell">
                                                                <p className="text-sm text-gray-700">{student.parent_name || '—'}</p>
                                                            </td>
                                                            <td className="py-3 px-5 hidden lg:table-cell">
                                                                <p className="text-sm text-gray-500">{student.parent_phone || '—'}</p>
                                                            </td>
                                                            <td className="py-3 px-5 text-center">
                                                                <button
                                                                    onClick={() => { setSelectedStudent(student); setDetailTab('personal'); }}
                                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Student Detail Modal - Enhanced */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary to-red-800 px-6 py-5 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {selectedStudent.photo_url ? (
                                        <img src={selectedStudent.photo_url} alt={selectedStudent.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl">
                                            {selectedStudent.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                                        <p className="text-white/70 text-sm">Roll No. {selectedStudent.roll_number} • {selectedStudent.admission_number}</p>
                                        {selectedStudent.gender && (
                                            <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedStudent.gender}</span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
                            {[
                                { key: 'personal', label: 'Personal', icon: User },
                                { key: 'guardian', label: 'Guardian', icon: Users },
                                { key: 'academic', label: 'Academic', icon: GraduationCap },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setDetailTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        detailTab === tab.key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {detailTab === 'personal' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Email', value: selectedStudent.email, icon: Mail },
                                            { label: 'Date of Birth', value: selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: Calendar },
                                            { label: 'Gender', value: selectedStudent.gender || '—', icon: User },
                                            { label: 'Blood Group', value: selectedStudent.blood_group || '—', icon: Heart },
                                            { label: 'Nationality', value: selectedStudent.nationality || '—', icon: Globe },
                                            { label: 'Religion', value: selectedStudent.religion || '—', icon: BookOpen },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <item.icon className="w-3.5 h-3.5 text-gray-400" />
                                                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-700">{item.value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            <p className="text-xs text-gray-400 font-medium">Address</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{selectedStudent.address || '—'}</p>
                                    </div>
                                    {selectedStudent.emergency_contact && (
                                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                <p className="text-xs text-amber-600 font-medium">Emergency Contact</p>
                                            </div>
                                            <p className="text-sm font-medium text-amber-700">{selectedStudent.emergency_contact}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailTab === 'guardian' && (
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Father / Guardian</h5>
                                        <div className="space-y-3">
                                            {[
                                                { icon: Users, label: 'Name', value: selectedStudent.parent_name },
                                                { icon: Phone, label: 'Phone', value: selectedStudent.parent_phone },
                                                { icon: Mail, label: 'Email', value: selectedStudent.parent_email },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                                        <item.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                                        <p className="text-sm font-medium text-gray-700">{item.value || '—'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {(selectedStudent.mother_name || selectedStudent.mother_phone) && (
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mother</h5>
                                            <div className="space-y-3">
                                                {[
                                                    { icon: Users, label: 'Name', value: selectedStudent.mother_name },
                                                    { icon: Phone, label: 'Phone', value: selectedStudent.mother_phone },
                                                ].filter(item => item.value).map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                        <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                                                            <item.icon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                                            <p className="text-sm font-medium text-gray-700">{item.value || '—'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailTab === 'academic' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs text-gray-400 font-medium mb-1">Admission Number</p>
                                            <p className="text-sm font-bold font-mono text-gray-700">{selectedStudent.admission_number || '—'}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs text-gray-400 font-medium mb-1">Roll Number</p>
                                            <p className="text-sm font-bold text-gray-700">{selectedStudent.roll_number || '—'}</p>
                                        </div>
                                    </div>
                                    {(selectedStudent.previous_school || selectedStudent.previous_class) && (
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Previous Education</h5>
                                            <div className="space-y-3">
                                                {selectedStudent.previous_school && (
                                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                        <p className="text-xs text-gray-400 font-medium mb-1">Previous School</p>
                                                        <p className="text-sm font-medium text-gray-700">{selectedStudent.previous_school}</p>
                                                    </div>
                                                )}
                                                {selectedStudent.previous_class && (
                                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                        <p className="text-xs text-gray-400 font-medium mb-1">Previous Class</p>
                                                        <p className="text-sm font-medium text-gray-700">{selectedStudent.previous_class}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {selectedStudent.certificate_url && (
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Documents</h5>
                                            <a
                                                href={selectedStudent.certificate_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                                            >
                                                <FileText className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-700">View Certificate</p>
                                                    <p className="text-xs text-blue-400">Transfer / Records Certificate</p>
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;