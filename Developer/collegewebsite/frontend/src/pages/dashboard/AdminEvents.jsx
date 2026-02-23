import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit2, Calendar, MapPin, Clock, Loader2, Search, CalendarDays, AlertCircle, CheckCircle } from 'lucide-react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '', location: '' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            setEvents(res.events || []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const resetForm = () => { setForm({ title: '', description: '', start_date: '', end_date: '', location: '' }); setEditing(null); };
    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (ev) => {
        setEditing(ev);
        setForm({
            title: ev.title || '',
            description: ev.description || '',
            start_date: ev.start_date ? ev.start_date.slice(0, 10) : '',
            end_date: ev.end_date ? ev.end_date.slice(0, 10) : '',
            location: ev.location || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await updateEvent(editing.id, form);
                showToast('Event updated successfully');
            } else {
                await createEvent(form);
                showToast('Event created successfully');
            }
            setShowModal(false); resetForm();
            await fetchEvents();
        } catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event permanently?')) return;
        try {
            await deleteEvent(id);
            showToast('Event deleted');
            await fetchEvents();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const isUpcoming = (d) => d ? new Date(d) >= new Date() : false;

    const filtered = events.filter(ev => {
        if (search && !ev.title?.toLowerCase().includes(search.toLowerCase()) && !ev.description?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const upcoming = filtered.filter(e => isUpcoming(e.start_date));
    const past = filtered.filter(e => !isUpcoming(e.start_date));

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];

    const EventCard = ({ event, idx }) => {
        const color = colors[idx % colors.length];
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                <div className={`h-1.5 ${color}`} />
                <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{event.title}</h3>
                            {event.description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{event.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEdit(event)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(event.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(event.start_date)}{event.end_date && event.end_date !== event.start_date ? ` — ${formatDate(event.end_date)}` : ''}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>
                    {isUpcoming(event.start_date) && (
                        <span className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <Clock className="w-3 h-3" /> Upcoming
                        </span>
                    )}
                </div>
            </div>
        );
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
                    <p className="text-sm text-gray-500 mt-1">{events.length} events • {upcoming.length} upcoming</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" /> New Event
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Upcoming Events</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map((ev, idx) => <EventCard key={ev.id} event={ev} idx={idx} />)}
                    </div>
                </div>
            )}

            {/* Past */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Past Events</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {past.map((ev, idx) => <EventCard key={ev.id} event={ev} idx={idx + upcoming.length} />)}
                    </div>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No events found</p>
                    <p className="text-sm mt-1">Click "New Event" to create one</p>
                </div>
            )}

            {/* View Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h3>
                                <div className="text-xs text-gray-400 mt-1 space-x-3">
                                    <span>{formatDate(selectedEvent.start_date)}{selectedEvent.end_date ? ` — ${formatDate(selectedEvent.end_date)}` : ''}</span>
                                    {selectedEvent.location && <span>📍 {selectedEvent.location}</span>}
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description || 'No description provided.'}</p>
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
                                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Event' : 'Create New Event'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{editing ? 'Update event details' : 'Add a new college event'}</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Annual Sports Day 2025" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Event details..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                    <input type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Main Auditorium" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editing ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
