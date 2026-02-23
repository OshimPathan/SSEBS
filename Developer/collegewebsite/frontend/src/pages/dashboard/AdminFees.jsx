import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Plus, Search, X, Eye, Edit3, Trash2, DollarSign,
    Clock, CheckCircle, AlertCircle, Users, Filter, Download } from 'lucide-react';
import { getAllFees, createFee, createBulkFees, updateFee, deleteFee,
    getClasses, getStudentsByClass } from '../../api';

const AdminFees = () => {
    const [fees, setFees] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [viewFee, setViewFee] = useState(null);
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkClass, setBulkClass] = useState('');
    const [bulkStudents, setBulkStudents] = useState([]);
    const [form, setForm] = useState({
        student_id: '', amount: '', due_date: '', status: 'UNPAID',
        amount_paid: '', description: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [feesData, classesData] = await Promise.all([
                getAllFees(),
                getClasses(),
            ]);
            setFees(feesData);
            setClasses(classesData.classes || []);
        } catch (e) { /* ignore */ }
        setLoading(false);
    };

    const loadBulkStudents = async (classId) => {
        setBulkClass(classId);
        if (!classId) { setBulkStudents([]); return; }
        try {
            const list = await getStudentsByClass(classId);
            setBulkStudents(list.map(s => ({ ...s, selected: true })));
        } catch { setBulkStudents([]); }
    };

    const stats = useMemo(() => {
        const filtered = fees.filter(f =>
            (!filterClass || f.class_id === filterClass) &&
            (!filterStatus || f.status === filterStatus) &&
            (!search || f.student_name.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase()))
        );
        return {
            total: filtered.reduce((s, f) => s + parseFloat(f.amount || 0), 0),
            paid: filtered.filter(f => f.status === 'PAID').reduce((s, f) => s + parseFloat(f.amount_paid || 0), 0),
            pending: filtered.filter(f => f.status !== 'PAID').reduce((s, f) => s + parseFloat(f.amount || 0) - parseFloat(f.amount_paid || 0), 0),
            overdue: filtered.filter(f => f.status === 'UNPAID' && new Date(f.due_date) < new Date()).length,
            count: filtered.length,
        };
    }, [fees, filterClass, filterStatus, search]);

    const filteredFees = useMemo(() => {
        return fees.filter(f =>
            (!filterClass || f.class_id === filterClass) &&
            (!filterStatus || f.status === filterStatus) &&
            (!search || f.student_name.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase()))
        );
    }, [fees, filterClass, filterStatus, search]);

    const resetForm = () => {
        setForm({ student_id: '', amount: '', due_date: '', status: 'UNPAID', amount_paid: '', description: '' });
        setEditingFee(null);
        setBulkMode(false);
        setBulkClass('');
        setBulkStudents([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (bulkMode) {
                const selectedIds = bulkStudents.filter(s => s.selected).map(s => s.id);
                if (selectedIds.length === 0) return;
                await createBulkFees(selectedIds, { amount: form.amount, due_date: form.due_date, description: form.description });
            } else if (editingFee) {
                await updateFee(editingFee.id, form);
            } else {
                await createFee(form);
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (e) { console.error(e); }
    };

    const handleEdit = (fee) => {
        setEditingFee(fee);
        setForm({
            student_id: fee.student_id,
            amount: fee.amount,
            due_date: fee.due_date?.split('T')[0] || fee.due_date,
            status: fee.status,
            amount_paid: fee.amount_paid || '',
            description: fee.description || '',
        });
        setBulkMode(false);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this fee record?')) return;
        try {
            await deleteFee(id);
            loadData();
        } catch (e) { /* ignore */ }
    };

    const handleMarkPaid = async (fee) => {
        try {
            await updateFee(fee.id, { status: 'PAID', amount_paid: fee.amount });
            loadData();
        } catch (e) { /* ignore */ }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-100 text-emerald-700';
            case 'UNPAID': return 'bg-red-100 text-red-700';
            case 'PARTIAL': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const exportCSV = () => {
        const headers = ['Student', 'Class', 'Description', 'Amount', 'Paid', 'Due Date', 'Status'];
        const rows = filteredFees.map(f => [
            f.student_name, f.class_name, f.description || '', f.amount,
            f.amount_paid || 0, f.due_date?.split('T')[0] || f.due_date, f.status,
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'fees_report.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const [allStudentsList, setAllStudentsList] = useState([]);
    const [selectedClassForStudent, setSelectedClassForStudent] = useState('');

    const loadStudentsForClass = async (classId) => {
        setSelectedClassForStudent(classId);
        if (!classId) { setAllStudentsList([]); return; }
        try {
            const list = await getStudentsByClass(classId);
            setAllStudentsList(list);
        } catch { setAllStudentsList([]); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                    <p className="text-sm text-gray-500 mt-1">{stats.count} fee records • रू {stats.total.toLocaleString()} total</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={() => { resetForm(); setBulkMode(true); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Users className="w-4 h-4" /> Bulk Assign
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" /> Add Fee
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Amount', value: `रू ${stats.total.toLocaleString()}`, icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Collected', value: `रू ${stats.paid.toLocaleString()}`, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Pending', value: `रू ${stats.pending.toLocaleString()}`, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
                ].map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
                        <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name, description..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">All Classes</option>
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.section || ''}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIAL">Partial</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-3.5 px-5">Student</th>
                                <th className="py-3.5 px-5 hidden sm:table-cell">Class</th>
                                <th className="py-3.5 px-5">Description</th>
                                <th className="py-3.5 px-5 text-right">Amount</th>
                                <th className="py-3.5 px-5 text-right hidden md:table-cell">Paid</th>
                                <th className="py-3.5 px-5 hidden md:table-cell">Due Date</th>
                                <th className="py-3.5 px-5 text-center">Status</th>
                                <th className="py-3.5 px-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredFees.map(fee => (
                                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-5">
                                        <p className="text-sm font-medium text-gray-800">{fee.student_name}</p>
                                        <p className="text-xs text-gray-400 sm:hidden">{fee.class_name}</p>
                                    </td>
                                    <td className="py-3 px-5 text-sm text-gray-600 hidden sm:table-cell">{fee.class_name}</td>
                                    <td className="py-3 px-5 text-sm text-gray-600 max-w-[200px] truncate">{fee.description || '—'}</td>
                                    <td className="py-3 px-5 text-sm font-bold text-gray-900 text-right">रू {parseFloat(fee.amount).toLocaleString()}</td>
                                    <td className="py-3 px-5 text-sm text-gray-600 text-right hidden md:table-cell">रू {parseFloat(fee.amount_paid || 0).toLocaleString()}</td>
                                    <td className="py-3 px-5 text-sm text-gray-600 hidden md:table-cell">{fee.due_date?.split('T')[0] || fee.due_date}</td>
                                    <td className="py-3 px-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadge(fee.status)}`}>{fee.status}</span>
                                    </td>
                                    <td className="py-3 px-5">
                                        <div className="flex items-center justify-center gap-1">
                                            {fee.status !== 'PAID' && (
                                                <button onClick={() => handleMarkPaid(fee)} title="Mark Paid"
                                                    className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(fee)} title="Edit"
                                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(fee.id)} title="Delete"
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFees.length === 0 && (
                                <tr><td colSpan="8" className="py-12 text-center text-gray-400">No fee records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                {bulkMode ? 'Bulk Assign Fees' : editingFee ? 'Edit Fee' : 'Add Fee'}
                            </h3>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                            {bulkMode ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class *</label>
                                        <select required value={bulkClass} onChange={e => loadBulkStudents(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            <option value="">Choose class</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.section || ''}</option>)}
                                        </select>
                                    </div>
                                    {bulkStudents.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Students ({bulkStudents.filter(s => s.selected).length} selected)</label>
                                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                                                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input type="checkbox" checked={bulkStudents.every(s => s.selected)}
                                                        onChange={e => setBulkStudents(bulkStudents.map(s => ({ ...s, selected: e.target.checked })))}
                                                        className="rounded" />
                                                    <span className="text-sm font-medium text-gray-700">Select All</span>
                                                </label>
                                                {bulkStudents.map(s => (
                                                    <label key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                        <input type="checkbox" checked={s.selected}
                                                            onChange={e => setBulkStudents(bulkStudents.map(st => st.id === s.id ? { ...st, selected: e.target.checked } : st))}
                                                            className="rounded" />
                                                        <span className="text-sm text-gray-700">{s.name} (Roll #{s.roll_number})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : !editingFee && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                                        <select required value={selectedClassForStudent} onChange={e => loadStudentsForClass(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            <option value="">Choose class</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.section || ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                                        <select required value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            <option value="">Choose student</option>
                                            {allStudentsList.map(s => <option key={s.id} value={s.id}>{s.name} (Roll #{s.roll_number})</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (रू) *</label>
                                    <input type="number" required min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="5000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                    <input type="date" required value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                            </div>

                            {editingFee && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                                        <input type="number" min="0" value={form.amount_paid} onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            <option value="UNPAID">Unpaid</option>
                                            <option value="PARTIAL">Partial</option>
                                            <option value="PAID">Paid</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. Monthly Tuition Fee - Baisakh 2082" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90">
                                    {bulkMode ? `Assign to ${bulkStudents.filter(s => s.selected).length} Students` : editingFee ? 'Save Changes' : 'Create Fee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFees;
