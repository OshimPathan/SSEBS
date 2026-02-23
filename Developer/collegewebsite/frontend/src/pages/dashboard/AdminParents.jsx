import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Trash2, Eye, Users2, CheckCircle, AlertCircle, Loader2, Link2, Edit3 } from 'lucide-react';
import { getParents, getStudents, createParent, deleteParent, updateParent } from '../../api';

const AdminParents = () => {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [editingParent, setEditingParent] = useState(null);

    const [form, setForm] = useState({
        name: '', email: '', password: '', student_ids: []
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchParents = useCallback(async () => {
        try {
            const data = await getParents({ search });
            setParents(data.parents || []);
        } catch (err) {
            showToast(err.message || 'Failed to fetch parents', 'error');
        }
    }, [search]);

    const fetchStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data.students || []);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchParents(), fetchStudents()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (!loading) fetchParents();
    }, [search]);

    const resetForm = () => {
        setForm({ name: '', email: '', password: '', student_ids: [] });
        setCredentials(null);
        setEditingParent(null);
    };

    const openAddModal = () => { resetForm(); setShowModal(true); };

    const openEditModal = (parent) => {
        setEditingParent(parent);
        setForm({
            name: parent.name || '',
            email: parent.email || '',
            password: '',
            student_ids: (parent.children || []).map(c => c.id),
        });
        setCredentials(null);
        setShowModal(true);
    };

    const toggleStudentSelection = (sid) => {
        setForm(prev => ({
            ...prev,
            student_ids: prev.student_ids.includes(sid)
                ? prev.student_ids.filter(id => id !== sid)
                : [...prev.student_ids, sid]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingParent) {
                await updateParent(editingParent.id, {
                    name: form.name,
                    email: form.email,
                    phone: form.phone || null,
                });
                showToast('Parent updated successfully');
                setShowModal(false); resetForm();
            } else {
                const data = await createParent(form);
                showToast('Parent account created successfully');
                if (data.credentials) {
                    setCredentials(data.credentials);
                } else {
                    setShowModal(false); resetForm();
                }
            }
            await Promise.all([fetchParents(), fetchStudents()]);
        } catch (err) {
            showToast(err.error || err.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete ${name}'s parent account? Students will be unlinked.`)) return;
        try {
            await deleteParent(id);
            showToast('Parent deleted');
            await fetchParents();
        } catch (err) {
            showToast(err.message || 'Failed to delete', 'error');
        }
    };

    // Students not yet linked to any parent
    const unlinkedStudents = students.filter(s => !s.parent_user_id);

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
                    <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
                    <p className="text-sm text-gray-500 mt-1">{parents.length} parent accounts</p>
                </div>
                <button onClick={openAddModal} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" /> Add Parent
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Parents</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{parents.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">With Children Linked</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{parents.filter(p => p.children && p.children.length > 0).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Unlinked Students</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{unlinkedStudents.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search parents..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-3.5 px-5">Parent</th>
                                <th className="py-3.5 px-5">Email</th>
                                <th className="py-3.5 px-5">Linked Children</th>
                                <th className="py-3.5 px-5 hidden md:table-cell">Joined</th>
                                <th className="py-3.5 px-5 text-center w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {parents.map((p) => {
                                const children = Array.isArray(p.children) ? p.children : [];
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-gray-500">{p.email}</td>
                                        <td className="py-3.5 px-5">
                                            <div className="flex flex-wrap gap-1">
                                                {children.map((child, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-blue-50 text-blue-700 font-medium">
                                                        {child.name} ({child.class_name} {child.section || ''})
                                                    </span>
                                                ))}
                                                {children.length === 0 && <span className="text-xs text-gray-400">No children linked</span>}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-gray-400 hidden md:table-cell">
                                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setSelectedParent(p)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => openEditModal(p)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {parents.length === 0 && (
                                <tr><td colSpan="5" className="py-12 text-center text-gray-400">
                                    <Users2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No parent accounts found</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {selectedParent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedParent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Parent Details</h3>
                            <button onClick={() => setSelectedParent(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl">
                                    {selectedParent.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedParent.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedParent.email}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2">Linked Children</p>
                                {(selectedParent.children || []).length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedParent.children.map((child, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                                <Link2 className="w-4 h-4 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{child.name}</p>
                                                    <p className="text-xs text-gray-500">{child.class_name} {child.section || ''} &bull; {child.admission_number}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No children linked to this account</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editingParent ? 'Edit Parent' : 'Add Parent Account'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{editingParent ? 'Update parent information' : 'Create a parent login and link to students'}</p>
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
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Parent full name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="parent@email.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Default: parent123" />
                                </div>

                                {/* Link to Students */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Link to Students</label>
                                    {students.length > 0 ? (
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                                            {students.map((s) => (
                                                <label key={s.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${form.student_ids.includes(s.id) ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50'}`}>
                                                    <input type="checkbox" checked={form.student_ids.includes(s.id)}
                                                        onChange={() => toggleStudentSelection(s.id)}
                                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{s.name}</p>
                                                        <p className="text-xs text-gray-400">{s.class_name} {s.section || ''} &bull; {s.admission_number}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">No students available</p>
                                    )}
                                    {form.student_ids.length > 0 && (
                                        <p className="text-xs text-primary mt-1 font-medium">{form.student_ids.length} student(s) selected</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingParent ? 'Save Changes' : 'Create Parent Account'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminParents;
