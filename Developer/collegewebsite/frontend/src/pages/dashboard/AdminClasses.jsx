import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Users, BookOpen, Loader2, Edit3, PlusCircle } from 'lucide-react';
import { getClasses, addClass, deleteClass, updateClass, addSubjectToClass, deleteSubject } from '../../api';

const AdminClasses = () => {
    const [classes, setClasses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', section: 'A', stream: '' });
    const [editingClass, setEditingClass] = useState(null);
    const [newSubject, setNewSubject] = useState('');
    const [addingSubjectTo, setAddingSubjectTo] = useState(null);

    const loadClasses = () => {
        setLoading(true);
        getClasses().then(res => setClasses(res.classes || [])).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { loadClasses(); }, []);

    const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this class? This will also delete all associated subjects.')) return;
        try {
            await deleteClass(id);
            setClasses(classes.filter(c => c.id !== id));
        } catch (e) {
            alert('Failed to delete class: ' + e.message);
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingClass) {
                await updateClass(editingClass.id, formData);
            } else {
                await addClass(formData);
            }
            setShowModal(false);
            setFormData({ name: '', section: 'A', stream: '' });
            setEditingClass(null);
            loadClasses();
        } catch (e) {
            alert('Failed to save class: ' + e.message);
        }
        setSaving(false);
    };

    const handleEditClass = (cls) => {
        setEditingClass(cls);
        setFormData({ name: cls.name, section: cls.section || 'A', stream: cls.stream || '' });
        setShowModal(true);
    };

    const handleAddSubject = async (classId) => {
        if (!newSubject.trim()) return;
        try {
            await addSubjectToClass(classId, newSubject.trim());
            setNewSubject('');
            setAddingSubjectTo(null);
            loadClasses();
        } catch (e) { alert('Failed to add subject: ' + e.message); }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!confirm('Delete this subject? Teacher assignments for this subject will also be removed.')) return;
        try {
            await deleteSubject(subjectId);
            loadClasses();
        } catch (e) { alert('Failed to delete: ' + e.message); }
    };

    const streamColors = {
        Science: 'bg-blue-50 text-blue-700 border-blue-200',
        Management: 'bg-amber-50 text-amber-700 border-amber-200',
        Humanities: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Classes & Sections</h1>
                    <p className="text-sm text-gray-500 mt-1">{classes.length} classes • {totalStudents} total students</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" />
                    Add Class
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Classes', value: classes.length, icon: BookOpen, color: 'bg-primary/10 text-primary' },
                    { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Avg Students/Class', value: classes.length > 0 ? Math.round(totalStudents / classes.length) : 0, icon: Users, color: 'bg-amber-50 text-amber-600' },
                    { label: '+2 Streams', value: classes.filter(c => c.stream).length, icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Class Cards Grid */}
            {classes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No classes yet</p>
                    <p className="text-gray-400 text-sm mt-1">Click "Add Class" to create your first class</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                        <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                        <p className="text-sm text-gray-500">Section {cls.section}</p>
                                    </div>
                                    {cls.stream ? (
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${streamColors[cls.stream] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>{cls.stream}</span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">General</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {cls.students} students</span>
                                    <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {cls.subjects.length} subjects</span>
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setExpandedId(expandedId === cls.id ? null : cls.id)}
                                        className="text-xs text-primary font-semibold hover:underline"
                                    >
                                        {expandedId === cls.id ? 'Hide Subjects' : 'View Subjects'}
                                    </button>
                                    <button onClick={() => handleEditClass(cls)} className="text-xs text-blue-500 hover:text-blue-600 font-semibold">Edit</button>
                                    <button onClick={() => handleDelete(cls.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold ml-auto">Remove</button>
                                </div>
                                {expandedId === cls.id && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            {cls.subjectsList && cls.subjectsList.length > 0 ? cls.subjectsList.map((sub) => (
                                                <span key={sub.id} className="px-2 py-1 rounded-md text-xs bg-white border border-gray-200 text-gray-600 flex items-center gap-1">
                                                    {sub.name}
                                                    <button onClick={() => handleDeleteSubject(sub.id)} className="text-red-300 hover:text-red-500 ml-0.5" title="Remove subject">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            )) : (
                                                <span className="text-xs text-gray-400">No subjects added yet</span>
                                            )}
                                        </div>
                                        {addingSubjectTo === cls.id ? (
                                            <div className="flex gap-2 mt-2">
                                                <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                                                    placeholder="Subject name" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddSubject(cls.id)}
                                                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary" />
                                                <button onClick={() => handleAddSubject(cls.id)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium">Add</button>
                                                <button onClick={() => { setAddingSubjectTo(null); setNewSubject(''); }} className="px-2 py-1.5 text-gray-400 hover:text-gray-600">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setAddingSubjectTo(cls.id)}
                                                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline mt-1">
                                                <PlusCircle className="w-3.5 h-3.5" /> Add Subject
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Class Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{editingClass ? 'Edit Class' : 'Add New Class'}</h3>
                            <button onClick={() => { setShowModal(false); setEditingClass(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleAddClass}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Class 6" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                                    <select required value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                                        <option value="">Select</option>
                                        <option>A</option><option>B</option><option>C</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stream (for +2 only)</label>
                                <select value={formData.stream} onChange={e => setFormData({ ...formData, stream: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                                    <option value="">None</option>
                                    <option>Science</option><option>Management</option><option>Humanities</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingClass ? 'Save Changes' : 'Add Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClasses;