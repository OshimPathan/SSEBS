import React, { useState, useEffect } from 'react';
import { Quote, Star, Send, CheckCircle, Loader2, User, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { getApprovedReviews, submitReview } from '../../api';

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [form, setForm] = useState({ name: '', role: 'Parent', rating: 5, content: '' });

    const defaultTestimonials = [
        { id: 'd1', name: "Ram Bahadur Thapa", role: "Parent", rating: 5, content: "The transformation I've seen in my child's academic performance and discipline since joining Seven Star is remarkable. The teachers truly care about each student's development.", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { id: 'd2', name: "Sita Sharma", role: "Alumni (+2 Science)", rating: 5, content: "The foundational knowledge and guidance I received at Seven Star helped me secure a full scholarship for my engineering degree. Eternally grateful to the faculty.", image: "https://randomuser.me/api/portraits/women/44.jpg" },
        { id: 'd3', name: "Bikash Gurung", role: "Parent", rating: 5, content: "Not just academics, the school's focus on extracurriculars like sports and arts ensures students develop holistically. Best school in Devdaha area, hands down.", image: "https://randomuser.me/api/portraits/men/67.jpg" },
    ];

    useEffect(() => {
        getApprovedReviews()
            .then(data => setReviews(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const allTestimonials = [...defaultTestimonials, ...reviews.map(r => ({
        ...r,
        image: null,
    }))];

    const perPage = 3;
    const totalPages = Math.ceil(allTestimonials.length / perPage);
    const visibleTestimonials = allTestimonials.slice(currentPage * perPage, currentPage * perPage + perPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.content.trim()) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            await submitReview(form);
            setSubmitted(true);
            setForm({ name: '', role: 'Parent', rating: 5, content: '' });
            setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
        } catch (err) {
            console.error('Review submit error:', err);
            setSubmitError(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ rating, onChange, interactive = false }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type={interactive ? "button" : undefined}
                    onClick={interactive ? () => onChange(s) : undefined}
                    className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}>
                    <Star className={`w-4 h-4 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
        </div>
    );

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="section-title">What People Say</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">Hear from our community of parents, students and alumni.</p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {visibleTestimonials.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white rounded-xl p-7 relative shadow-sm hover:shadow-lg transition-all border-b-4 border-b-primary group">
                            <Quote className="w-10 h-10 text-primary/10 absolute top-6 right-6" />

                            <div className="flex items-center gap-4 mb-5">
                                {item.image ? (
                                    <img src={item.image} alt={item.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border-2 border-primary/20">
                                        {getInitials(item.name)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-900 font-serif">{item.name}</h4>
                                    <p className="text-xs text-accent-dark font-semibold">{item.role}</p>
                                    <StarRating rating={item.rating || 5} />
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm italic leading-relaxed">
                                "{item.content}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i)}
                                className={`w-3 h-3 rounded-full transition-all ${currentPage === i ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Write a Review CTA / Form */}
                <div className="max-w-2xl mx-auto">
                    {!showForm ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
                            <MessageSquarePlus className="w-10 h-10 text-primary mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">Share Your Experience</h3>
                            <p className="text-sm text-gray-500 mb-5">Are you a parent, student, or alumni? We'd love to hear about your experience at Seven Star.</p>
                            <button onClick={() => setShowForm(true)}
                                className="btn-primary inline-flex items-center gap-2 px-8">
                                <Star className="w-4 h-4" /> Write a Review
                            </button>
                        </div>
                    ) : submitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-green-800 mb-2">Thank You!</h3>
                            <p className="text-sm text-green-600">Your review has been submitted and will appear after approval by the admin.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm animate-fade-in-up">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 font-serif">Write a Review</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Cancel</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Your Name *</label>
                                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                                            placeholder="e.g. Ram Bahadur Thapa"
                                            className="w-full px-4 py-2.5 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Your Role</label>
                                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                                            <option>Parent</option>
                                            <option>Student</option>
                                            <option>Alumni</option>
                                            <option>Teacher</option>
                                            <option>Visitor</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Rating</label>
                                    <StarRating rating={form.rating} onChange={(r) => setForm(f => ({ ...f, rating: r }))} interactive />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Your Review *</label>
                                    <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows="4"
                                        placeholder="Share your experience at Seven Star..."
                                        className="w-full px-4 py-2.5 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none" />
                                </div>
                                <button type="submit" disabled={submitting || !form.name.trim() || !form.content.trim()}
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Review</>}
                                </button>
                                {submitError && (
                                    <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg p-2">{submitError}</p>
                                )}
                                <p className="text-[11px] text-gray-400 text-center">Your review will be published after admin approval.</p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
