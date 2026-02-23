import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Trash2, Eye, Edit2, Users, CheckCircle, AlertCircle, Loader2, Mail, Phone, BookOpen, PlusCircle, XCircle } from 'lucide-react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, getAllSubjects, getTeacherAssignedSubjectIds, assignTeacherSubjects } from '../../api';

const AdminTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [credentials, setCredentials] = useState(null);

    // Subject management
    const [showSubjectModal, setShowSubjectModal] = useState(null); // teacher object
    const [allSubjects, setAllSubjects] = useState([]);
    const [assignedSubjectIds, setAssignedSubjectIds] = useState([]);
    const [subjectSaving, setSubjectSaving] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState('');

    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '',
        qualification: '', address: '', joined_date: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchTeachers = useCallback(async () => {
        try {
            const data = await getTeachers({ search });
            setTeachers(data.teachers || []);
        } catch (err) {
            showToast(err.message || 'Failed to fetch teachers', 'error');
        }
    }, [search]);

    useEffect(() => {
        const init = async () => { setLoading(true); await fetchTeachers(); setLoading(false); };
        init();
    }, []);

    useEffect(() => {
        if (!loading) fetchTeachers();
    }, [search]);

    const resetForm = () => {
        setForm({ name: '', email: '', password: '', phone: '', qualification: '', address: '', joined_date: '' });
        setEditingTeacher(null);
        setCredentials(null);
    };

    const openAddModal = () => { resetForm(); setShowModal(true); };

    const openEditModal = (t) => {
        setEditingTeacher(t);
        setForm({
            name: t.name || '', email: t.email || '', password: '',
            phone: t.phone || '', qualification: t.qualification || '',
            address: t.address || '',
            joined_date: t.joined_date ? t.joined_date.split('T')[0] : ''
        });
        setCredentials(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingTeacher) {
                await updateTeacher(editingTeacher.id, form);
                showToast('Teacher updated successfully');
                setShowModal(false); resetForm();
            } else {
                const data = await createTeacher(form);
                showToast('Teacher created successfully');
                if (data.credentials) {
                    setCredentials(data.credentials);
                } else {
                    setShowModal(false); resetForm();
                }
            }
            await fetchTeachers();
        } catch (err) {
            showToast(err.error || err.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete ${name}? This removes their user account too.`)) return;
        try {
            await deleteTeacher(id);
            showToast('Teacher deleted');
            await fetchTeachers();
        } catch (err) {
            showToast(err.message || 'Failed to delete', 'error');
        }
    };

    const openSubjectModal = async (teacher) => {
        setShowSubjectModal(teacher);
        setSubjectFilter('');
        try {
            const [subjects, assignedIds] = await Promise.all([
                getAllSubjects(),
                getTeacherAssignedSubjectIds(teacher.id),
            ]);
            setAllSubjects(subjects);
            setAssignedSubjectIds(assignedIds);
        } catch (err) {
            showToast('Failed to load subjects', 'error');
        }
    };

    const toggleSubject = (subjectId) => {
        setAssignedSubjectIds(prev =>
            prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
        );
    };

    const saveSubjectAssignments = async () => {
        if (!showSubjectModal) return;
        setSubjectSaving(true);
        try {
            await assignTeacherSubjects(showSubjectModal.id, assignedSubjectIds);
            showToast(`Subjects updated for ${showSubjectModal.name}`);
            setShowSubjectModal(null);
            await fetchTeachers();
        } catch (err) {
            showToast(err.message || 'Failed to save subjects', 'error');
        } finally {
            setSubjectSaving(false);
        }
    };

    // Group subjects by class for the subject modal
    const groupedSubjects = allSubjects.reduce((acc, sub) => {
        const key = `${sub.class_name || 'Unassigned'}${sub.class_section ? ` (${sub.class_section})` : ''}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(sub);
        return acc;
    }, {});

    const filteredGroupedSubjects = Object.entries(groupedSubjects).reduce((acc, [className, subs]) => {
        const filtered = subjectFilter
            ? subs.filter(s => s.name.toLowerCase().includes(subjectFilter.toLowerCase()) || className.toLowerCase().includes(subjectFilter.toLowerCase()))
            : subs;
        if (filtered.length > 0) acc[className] = filtered;
        return acc;
    }, {});

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
                    <p className="text-sm text-gray-500 mt-1">{teachers.length} teachers registered</p>
                </div>
                <button onClick={openAddModal} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" /> Add Teacher
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, ID, or email..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-3.5 px-5">Teacher</th>
                                <th className="py-3.5 px-5">Emp. ID</th>
                                <th className="py-3.5 px-5 hidden md:table-cell">Qualification</th>
                                <th className="py-3.5 px-5 hidden lg:table-cell">Subjects</th>
                                <th className="py-3.5 px-5 hidden md:table-cell">Phone</th>
                                <th className="py-3.5 px-5 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {teachers.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                {t.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{t.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 text-sm font-mono text-gray-600">{t.employee_id}</td>
                                    <td className="py-3.5 px-5 text-sm text-gray-600 hidden md:table-cell">{t.qualification || '-'}</td>
                                    <td className="py-3.5 px-5 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {(t.subjects || []).filter(s => s).map((sub, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-purple-50 text-purple-600">{sub}</span>
                                            ))}
                                            {(!t.subjects || t.subjects.length === 0) && <span className="text-xs text-gray-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 text-sm text-gray-500 hidden md:table-cell">{t.phone || '-'}</td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => setSelectedTeacher(t)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openSubjectModal(t)} className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg" title="Manage Subjects"><BookOpen className="w-4 h-4" /></button>
                                            <button onClick={() => openEditModal(t)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(t.id, t.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {teachers.length === 0 && (
                                <tr><td colSpan="6" className="py-12 text-center text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No teachers found</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {selectedTeacher && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTeacher(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Teacher Details</h3>
                            <button onClick={() => setSelectedTeacher(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                                    {selectedTeacher.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedTeacher.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedTeacher.qualification || 'No qualification listed'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {[
                                    ['Employee ID', selectedTeacher.employee_id],
                                    ['Email', selectedTeacher.email],
                                    ['Phone', selectedTeacher.phone || 'N/A'],
                                    ['Joined', selectedTeacher.joined_date ? new Date(selectedTeacher.joined_date).toLocaleDateString() : 'N/A'],
                                    ['Address', selectedTeacher.address || 'N/A'],
                                ].map(([label, value], i) => (
                                    <div key={i}>
                                        <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">{label}</p>
                                        <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2">Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedTeacher.subjects || []).filter(s => s).map((sub, i) => (
                                        <span key={i} className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-50 text-purple-700">{sub}</span>
                                    ))}
                                    {(!selectedTeacher.subjects || selectedTeacher.subjects.filter(s => s).length === 0) && <span className="text-sm text-gray-400">No subjects assigned</span>}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <a href={`mailto:${selectedTeacher.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"><Mail className="w-4 h-4" />Email</a>
                                {selectedTeacher.phone && <a href={`tel:${selectedTeacher.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100 transition-colors"><Phone className="w-4 h-4" />Call</a>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{editingTeacher ? 'Update teacher information' : 'Register a new teacher with login credentials'}</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>

                        {credentials && (
                            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Login Credentials Created</h4>
                                <div className="bg-white p-3 rounded-lg border border-green-100 text-sm">
                                    <p>Email: <span className="font-mono font-bold">{credentials.email}</span></p>
                                    <p>Password: <span className="font-mono font-bold">{credentials.password}</span></p>
                                </div>
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="mt-3 w-full btn-primary py-2">Done</button>
                            </div>
                        )}

                        {!credentials && (
                            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Teacher full name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="teacher@sevenstar.edu.np" />
                                    </div>
                                </div>
                                {!editingTeacher && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Default: teacher123" />
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="98XXXXXXXX" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                        <input type="text" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. M.Sc. Mathematics" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                                    <input type="date" value={form.joined_date} onChange={e => setForm({ ...form, joined_date: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Full address" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Subject Management Modal */}
            {showSubjectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSubjectModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-bold text-gray-900">Manage Subjects</h3>
                                <button onClick={() => setShowSubjectModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-gray-500">Assign or remove teaching subjects for <span className="font-semibold text-gray-700">{showSubjectModal.name}</span></p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Currently assigned */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Currently Assigned ({assignedSubjectIds.length} subjects)
                                </h4>
                                {assignedSubjectIds.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {assignedSubjectIds.map(sid => {
                                            const sub = allSubjects.find(s => s.id === sid);
                                            if (!sub) return null;
                                            return (
                                                <span key={sid} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                                    {sub.name}
                                                    <span className="text-xs text-purple-400">({sub.class_name})</span>
                                                    <button type="button" onClick={() => toggleSubject(sid)} className="ml-0.5 text-purple-400 hover:text-red-500 transition-colors">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No subjects assigned yet. Select from below.</p>
                                )}
                            </div>

                            {/* Search and select */}
                            <div className="border-t border-gray-100 pt-4">
                                <div className="relative mb-3">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="text" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
                                        placeholder="Search subjects or classes..."
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>

                                <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                                    {Object.entries(filteredGroupedSubjects).map(([className, subs]) => (
                                        <div key={className}>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{className}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {subs.map(sub => {
                                                    const isAssigned = assignedSubjectIds.includes(sub.id);
                                                    return (
                                                        <button key={sub.id} type="button" onClick={() => toggleSubject(sub.id)}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                                                                isAssigned
                                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200 font-medium'
                                                                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                                                            }`}>
                                                            {isAssigned ? (
                                                                <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
                                                            ) : (
                                                                <PlusCircle className="w-4 h-4 text-gray-400 shrink-0" />
                                                            )}
                                                            <span className="truncate">{sub.name}</span>
                                                            {sub.code && <span className="text-xs text-gray-400 ml-auto shrink-0">{sub.code}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(filteredGroupedSubjects).length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">No subjects found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex gap-3 pt-3 border-t border-gray-100">
                                <button type="button" onClick={() => setShowSubjectModal(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="button" onClick={saveSubjectAssignments} disabled={subjectSaving}
                                    className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                    {subjectSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Subjects ({assignedSubjectIds.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTeachers;
