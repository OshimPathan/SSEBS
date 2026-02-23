import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit2, Bell, Megaphone, AlertTriangle, Info, CheckCircle, AlertCircle, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../../api';

const priorityConfig = {
    ALL: { color: 'bg-red-50 text-red-600 border-red-200', label: 'All Users', icon: AlertTriangle },
    STUDENT: { color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Students', icon: Megaphone },
    TEACHER: { color: 'bg-green-50 text-green-600 border-green-200', label: 'Teachers', icon: Info },
    PARENT: { color: 'bg-orange-50 text-orange-600 border-orange-200', label: 'Parents', icon: Info },
    ADMIN: { color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Admin Only', icon: Info },
};

const AdminNotices = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [selectedNotice, setSelectedNotice] = useState(null);

    const [form, setForm] = useState({ title: '', content: '', target_role: 'ALL' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchNotices = async () => {
        try {
            const res = await getNotices();
            setNotices(res.notices || []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const resetForm = () => { setForm({ title: '', content: '', target_role: 'ALL' }); setEditing(null); };

    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (n) => {
        setEditing(n);
        setForm({ title: n.title, content: n.content, target_role: n.target_role || 'ALL' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await updateNotice(editing.id, form);
                showToast('Notice updated successfully');
            } else {
                await createNotice({ ...form, created_by: user?.id });
                showToast('Notice published successfully');
            }
            setShowModal(false); resetForm();
            await fetchNotices();
        } catch (err) {
            showToast(err.message, 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this notice permanently?')) return;
        try {
            await deleteNotice(id);
            showToast('Notice deleted');
            await fetchNotices();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const filtered = notices.filter(n => {
        if (filterRole && n.target_role !== filterRole) return false;
        if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

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
                    <h1 className="text-2xl font-bold text-gray-900">Manage Notices</h1>
                    <p className="text-sm text-gray-500 mt-1">{notices.length} total notices • Publish notices in real-time</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" /> New Notice
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notices..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">All Audiences</option>
                    <option value="ALL">All Users</option>
                    <option value="STUDENT">Students</option>
                    <option value="TEACHER">Teachers</option>
                    <option value="PARENT">Parents</option>
                </select>
            </div>

            {/* Notice Cards */}
            <div className="space-y-3">
                {filtered.map((notice) => {
                    const config = priorityConfig[notice.target_role] || priorityConfig.ALL;
                    const Icon = config.icon;
                    return (
                        <div key={notice.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedNotice(notice)}>
                                            <h3 className="text-sm font-bold text-gray-900 hover:text-primary transition-colors">{notice.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{notice.content}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openEdit(notice)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(notice.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-400">
                                            {notice.created_at ? new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No notices found</p>
                        <p className="text-sm mt-1">Click "New Notice" to publish one</p>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNotice(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedNotice.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {selectedNotice.created_at ? new Date(selectedNotice.created_at).toLocaleDateString() : ''} • Target: {priorityConfig[selectedNotice.target_role]?.label || 'All'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedNotice(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Notice' : 'Publish New Notice'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{editing ? 'Update this notice' : 'This will be visible to selected audience immediately'}</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Second Terminal Exam Routine Published" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Write the notice content here..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                                <select required value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="ALL">All Users</option>
                                    <option value="STUDENT">Students Only</option>
                                    <option value="TEACHER">Teachers Only</option>
                                    <option value="PARENT">Parents Only</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editing ? 'Update Notice' : 'Publish Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotices;
