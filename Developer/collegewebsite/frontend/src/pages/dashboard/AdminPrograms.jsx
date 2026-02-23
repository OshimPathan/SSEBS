import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit2, BookOpen, Loader2, AlertCircle, CheckCircle, Search, GraduationCap } from 'lucide-react';
import { getProgramSubjects, createProgramSubject, updateProgramSubject, deleteProgramSubject } from '../../api';

const PROGRAMS = [
    { value: 'montessori', label: 'Montessori' },
    { value: 'primary', label: 'Primary (1-5)' },
    { value: 'lower_secondary', label: 'Lower Secondary (6-8)' },
    { value: 'secondary', label: 'Secondary (9-10)' },
    { value: 'management', label: '+2 Management' },
    { value: 'computer_science', label: '+2 Computer Science' },
    { value: 'hotel_management', label: '+2 Hotel Management' },
    { value: 'finance', label: '+2 Finance' },
    { value: 'education', label: '+2 Education' },
];

const programColors = {
    montessori: 'bg-pink-50 text-pink-700 border-pink-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    lower_secondary: 'bg-green-50 text-green-700 border-green-200',
    secondary: 'bg-purple-50 text-purple-700 border-purple-200',
    management: 'bg-orange-50 text-orange-700 border-orange-200',
    computer_science: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    hotel_management: 'bg-amber-50 text-amber-700 border-amber-200',
    finance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    education: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const AdminPrograms = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [filterProgram, setFilterProgram] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({ program: '', subject_name: '', description: '' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchSubjects = async () => {
        try {
            const data = await getProgramSubjects();
            setSubjects(data);
        } catch (err) {
            showToast(err.message, 'error');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const resetForm = () => { setForm({ program: '', subject_name: '', description: '' }); setEditing(null); };
    const openAdd = (program = '') => { resetForm(); setForm(f => ({ ...f, program })); setShowModal(true); };
    const openEdit = (s) => {
        setEditing(s);
        setForm({ program: s.program, subject_name: s.subject_name, description: s.description || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await updateProgramSubject(editing.id, form);
                showToast('Subject updated');
            } else {
                await createProgramSubject(form);
                showToast('Subject added');
            }
            setShowModal(false); resetForm();
            await fetchSubjects();
        } catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this subject?')) return;
        try {
            await deleteProgramSubject(id);
            showToast('Subject removed');
            await fetchSubjects();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const filtered = subjects.filter(s => {
        if (filterProgram && s.program !== filterProgram) return false;
        if (search && !s.subject_name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    // Group by program
    const grouped = {};
    filtered.forEach(s => {
        if (!grouped[s.program]) grouped[s.program] = [];
        grouped[s.program].push(s);
    });

    const getProgramLabel = (key) => PROGRAMS.find(p => p.value === key)?.label || key;

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

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
                    <h1 className="text-2xl font-bold text-gray-900">Academic Programs & Syllabus</h1>
                    <p className="text-sm text-gray-500 mt-1">{subjects.length} subjects across {PROGRAMS.length} programs • Shown on the homepage</p>
                </div>
                <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" /> Add Subject
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">All Programs</option>
                    {PROGRAMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>

            {/* Grouped by Program */}
            {Object.keys(grouped).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([program, subs]) => {
                        const color = programColors[program] || 'bg-gray-50 text-gray-700 border-gray-200';
                        return (
                            <div key={program} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color}`}>
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{getProgramLabel(program)}</h3>
                                            <p className="text-xs text-gray-500">{subs.length} subject{subs.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openAdd(program)} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Add
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {subs.map(s => (
                                        <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-800">{s.subject_name}</p>
                                                {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 ml-3">
                                                <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No subjects added yet</p>
                    <p className="text-sm mt-1">Add subjects to each program — they'll appear on the homepage</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Subject' : 'Add Subject'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">This will be displayed on the homepage under the program</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                                <select required value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="">Select program</option>
                                    {PROGRAMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                                <input type="text" required value={form.subject_name} onChange={e => setForm({ ...form, subject_name: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Accountancy" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Syllabus Notes</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="Brief syllabus description or notes (optional)" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editing ? 'Update' : 'Add Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPrograms;
