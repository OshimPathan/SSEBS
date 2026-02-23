import React, { useState, useEffect } from 'react';
import { Loader2, Search, AlertCircle, CheckCircle, Trash2, ChevronDown, UserPlus, X, Clock, Check, XCircle, Eye, Calendar, Phone, Mail, MapPin, School, User, FileText, GraduationCap } from 'lucide-react';
import { getAdmissionApplications, updateAdmissionStatus, deleteAdmissionApplication, convertAdmissionToStudent } from '../../api';

const statusConfig = {
    PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock, label: 'Pending' },
    ACCEPTED: { color: 'bg-green-50 text-green-600 border-green-200', icon: Check, label: 'Accepted' },
    REJECTED: { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, label: 'Rejected' },
};

const AdminAdmissions = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [enrolling, setEnrolling] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchApplications = async () => {
        try {
            const data = await getAdmissionApplications();
            setApplications(data);
        } catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchApplications(); }, []);

    const handleStatusChange = async (id, status) => {
        const action = status === 'ACCEPTED' ? 'Accept' : 'Reject';
        if (!confirm(`${action} this admission application?`)) return;
        try {
            await updateAdmissionStatus(id, status);
            showToast(`Application ${status.toLowerCase()}`);
            if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, status });
            await fetchApplications();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this application permanently?')) return;
        try {
            await deleteAdmissionApplication(id);
            showToast('Application deleted');
            setSelectedApp(null);
            await fetchApplications();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const handleEnroll = async (app) => {
        if (!confirm(`Enroll ${app.student_name} as a student? This will create a student account and login credentials.`)) return;
        setEnrolling(app.id);
        try {
            const result = await convertAdmissionToStudent(app.id);
            const creds = result.credentials || result;
            showToast(`Student enrolled! Login: ${creds.email || 'created'} / ${creds.password || 'student123'}`);
            await fetchApplications();
        } catch (err) {
            showToast(err.error || err.message || 'Enrollment failed', 'error');
        } finally {
            setEnrolling(null);
        }
    };

    const filtered = applications.filter(a => {
        if (filterStatus && a.status !== filterStatus) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!a.student_name?.toLowerCase().includes(q) &&
                !a.parent_name?.toLowerCase().includes(q) &&
                !a.parent_phone?.includes(q) &&
                !a.applied_for_class?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'PENDING').length,
        accepted: applications.filter(a => a.status === 'ACCEPTED').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-serif">Admission Applications</h1>
                <p className="text-sm text-gray-500 mt-1">Review and manage incoming admission applications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-amber-100 p-4">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Accepted</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
                </div>
                <div className="bg-white rounded-xl border border-red-100 p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Rejected</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">{stats.rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by student name, parent, phone, or class..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Applications List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">No applications found</h3>
                    <p className="text-gray-400 text-sm mt-1">Admission applications from the website will appear here</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(app => {
                        const statusConf = statusConfig[app.status] || statusConfig.PENDING;
                        const StatusIcon = statusConf.icon;
                        return (
                            <div key={app.id} className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${app.status === 'PENDING' ? 'border-amber-100 bg-amber-50/20' : 'border-gray-100'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : app.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {app.student_name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-sm">{app.student_name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${statusConf.color}`}>
                                                    <StatusIcon className="w-3 h-3" /> {statusConf.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><School className="w-3 h-3" /> Applied for: <strong className="text-gray-700">{app.applied_for_class}</strong></span>
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Parent: {app.parent_name}</span>
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.parent_phone}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(app.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => setSelectedApp(app)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        {app.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors">
                                                    <Check className="w-3.5 h-3.5" /> Accept
                                                </button>
                                                <button onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {app.status === 'ACCEPTED' && (
                                            <button onClick={() => handleEnroll(app)} disabled={enrolling === app.id}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50">
                                                {enrolling === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GraduationCap className="w-3.5 h-3.5" />} Enroll as Student
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(app.id)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 font-serif">Application Details</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Submitted {formatDate(selectedApp.created_at)}</p>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Status Badge */}
                            {(() => {
                                const sc = statusConfig[selectedApp.status] || statusConfig.PENDING;
                                const SIcon = sc.icon;
                                return (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${sc.color}`}>
                                        <SIcon className="w-4 h-4" /> {sc.label}
                                    </div>
                                );
                            })()}

                            {/* Student Info */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Student Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400">Full Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedApp.student_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Date of Birth</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatDate(selectedApp.date_of_birth)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Applied For</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedApp.applied_for_class}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Previous School</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedApp.previous_school || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Guardian Info */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Guardian Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400">Parent / Guardian</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedApp.parent_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedApp.parent_phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Email</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedApp.parent_email || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3">{selectedApp.address || '—'}</p>
                            </div>

                            {/* Actions */}
                            {selectedApp.status === 'PENDING' && (
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => { handleStatusChange(selectedApp.id, 'ACCEPTED'); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
                                        <Check className="w-4 h-4" /> Accept
                                    </button>
                                    <button onClick={() => { handleStatusChange(selectedApp.id, 'REJECTED'); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            )}
                            {selectedApp.status === 'ACCEPTED' && (
                                <div className="pt-2">
                                    <button onClick={() => handleEnroll(selectedApp)} disabled={enrolling === selectedApp.id}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
                                        {enrolling === selectedApp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                                        Enroll as Student
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdmissions;
