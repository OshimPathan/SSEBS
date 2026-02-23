import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle, XCircle, Loader2, Search, AlertCircle, MessageSquare, Eye, EyeOff, ChevronDown, User } from 'lucide-react';
import { getAllReviews, approveReview, deleteReview } from '../../api';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchReviews = async () => {
        try {
            const data = await getAllReviews();
            setReviews(data);
        } catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleApprove = async (id, approved) => {
        try {
            await approveReview(id, approved);
            showToast(approved ? 'Review approved — now visible on website' : 'Review hidden from website');
            await fetchReviews();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this review permanently?')) return;
        try {
            await deleteReview(id);
            showToast('Review deleted');
            setSelectedReview(null);
            await fetchReviews();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const filtered = reviews.filter(r => {
        if (filterStatus === 'approved' && !r.is_approved) return false;
        if (filterStatus === 'pending' && r.is_approved) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!r.name?.toLowerCase().includes(q) && !r.content?.toLowerCase().includes(q) && !r.role?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const stats = {
        total: reviews.length,
        approved: reviews.filter(r => r.is_approved).length,
        pending: reviews.filter(r => !r.is_approved).length,
        avgRating: reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0',
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    const renderStars = (rating, size = 'w-4 h-4') => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`${size} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
            ))}
        </div>
    );

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
                <h1 className="text-2xl font-bold text-gray-900 font-serif">Review Moderation</h1>
                <p className="text-sm text-gray-500 mt-1">Manage student and parent testimonials displayed on the website</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by name, role, or content..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Reviews List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">No reviews found</h3>
                    <p className="text-gray-400 text-sm mt-1">Reviews submitted from the website will appear here</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(review => (
                        <div key={review.id} className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${review.is_approved ? 'border-green-100' : 'border-amber-100'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${review.is_approved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {review.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-sm">{review.name}</h3>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                {review.role || 'Visitor'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.is_approved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {review.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3">{review.content}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {review.is_approved ? (
                                        <button onClick={() => handleApprove(review.id, false)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                                            title="Hide from website">
                                            <EyeOff className="w-3.5 h-3.5" /> Hide
                                        </button>
                                    ) : (
                                        <button onClick={() => handleApprove(review.id, true)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                                            title="Approve and show on website">
                                            <Eye className="w-3.5 h-3.5" /> Approve
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(review.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete permanently">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
