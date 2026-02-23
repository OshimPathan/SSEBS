import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronRight, Megaphone, FileText, Loader2, CalendarDays, MapPin } from 'lucide-react';
import { getNotices, getEvents } from '../../api';

const NoticeBoard = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getNotices().catch(() => ({ notices: [] })),
            getEvents().catch(() => ({ events: [] })),
        ]).then(([noticeRes, eventRes]) => {
            setNotices(noticeRes.notices || []);
            setEvents((eventRes.events || []).filter(e => e.start_date && new Date(e.start_date) >= new Date(Date.now() - 30 * 86400000)));
        }).finally(() => setLoading(false));
    }, []);

    const getTypeFromRole = (role) => {
        const map = { ALL: 'notice', STUDENT: 'academic', TEACHER: 'academic', PARENT: 'notice', ADMIN: 'notice' };
        return map[role] || 'notice';
    };

    const mappedNotices = notices.map(n => ({
        ...n,
        type: getTypeFromRole(n.target_role),
        date: n.created_at,
        desc: n.content,
    }));

    const filteredNotices = activeTab === 'all' ? mappedNotices : mappedNotices.filter(n => n.type === activeTab);

    const tabs = [
        { key: 'all', label: 'All Notices' },
        { key: 'academic', label: 'Academic' },
        { key: 'notice', label: 'General' },
    ];

    const getTypeColor = (type) => {
        const colors = {
            academic: 'bg-purple-100 text-purple-700',
            notice: 'bg-yellow-100 text-yellow-700',
            event: 'bg-blue-100 text-blue-700',
            admission: 'bg-green-100 text-green-700',
            result: 'bg-primary/10 text-primary',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <section id="notices" className="py-16 md:py-20 bg-white">
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    return (
        <section id="notices" className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="section-title">Notice Board & Events</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">Stay updated with the latest announcements and happenings at Seven Star.</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Notices */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-2 mb-5">
                            <Bell className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold text-gray-900 font-serif">Notices</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide rounded transition-colors ${
                                        activeTab === tab.key
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                            {filteredNotices.length > 0 ? filteredNotices.map((notice, idx) => (
                                <div key={notice.id || idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors group cursor-pointer border border-transparent hover:border-primary/20">
                                    <div className="shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                                        <Calendar className="w-4 h-4 mb-0.5" />
                                        <span className="text-[10px] font-bold">{notice.date ? new Date(notice.date).getDate() : ''}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors leading-snug">{notice.title}</h4>
                                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getTypeColor(notice.type)}`}>
                                                {notice.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2">{notice.desc}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(notice.date)}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No notices yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Events */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-5">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold text-gray-900 font-serif">Upcoming Events</h3>
                        </div>

                        <div className="space-y-4">
                            {events.length > 0 ? events.slice(0, 5).map((event, idx) => (
                                <div key={event.id || idx} className="group cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-14 h-14 bg-primary rounded-lg flex flex-col items-center justify-center text-white">
                                            <span className="text-lg font-bold leading-none">{event.start_date ? new Date(event.start_date).getDate() : ''}</span>
                                            <span className="text-[10px] uppercase">{event.start_date ? new Date(event.start_date).toLocaleString('default', { month: 'short' }) : ''}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors">{event.title}</h4>
                                            {event.description && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.description}</p>}
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                                                    <MapPin className="w-3 h-3" /> {event.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {idx < Math.min(events.length, 5) - 1 && <hr className="mt-4 border-gray-100" />}
                                </div>
                            )) : (
                                <div className="text-center py-12 text-gray-400">
                                    <CalendarDays className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No upcoming events</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NoticeBoard;
