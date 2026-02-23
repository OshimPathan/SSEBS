import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronRight, Megaphone, AlertTriangle, Info, X } from 'lucide-react';
import { getNotices } from '../../api';

const priorityConfig = {
    HIGH: { color: 'bg-red-50 text-red-600 border-red-200', icon: AlertTriangle, dotColor: 'bg-red-500' },
    MEDIUM: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Megaphone, dotColor: 'bg-amber-500' },
    LOW: { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Info, dotColor: 'bg-blue-500' },
};

function mapPriority(targetRole) {
    if (targetRole === 'ALL') return 'HIGH';
    if (targetRole === 'STUDENT') return 'MEDIUM';
    return 'LOW';
}

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [filterPriority, setFilterPriority] = useState('');

    useEffect(() => {
        getNotices().then(res => {
            setNotices((res.notices || []).map(n => ({
                ...n,
                date: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
                sender: 'Administration',
                priority: mapPriority(n.target_role),
                category: n.target_role === 'ALL' ? 'General' : n.target_role || 'General',
            })));
        }).catch(() => {});
    }, []);

    const filteredNotices = notices.filter(n => !filterPriority || n.priority === filterPriority);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
                    <p className="text-sm text-gray-500 mt-1">{filteredNotices.length} notices</p>
                </div>
                <div className="flex gap-2">
                    {['', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                        <button
                            key={p}
                            onClick={() => setFilterPriority(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterPriority === p ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {p || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredNotices.map((notice) => {
                    const config = priorityConfig[notice.priority];
                    return (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                                    <config.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{notice.title}</h3>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{notice.content}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{notice.date}</span>
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{notice.sender}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${config.color}`}>{notice.priority}</span>
                                        <span className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-md">{notice.category}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredNotices.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No notices found</p>
                    </div>
                )}
            </div>

            {/* Notice Detail Modal */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNotice(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${priorityConfig[selectedNotice.priority].color}`}>
                                    {React.createElement(priorityConfig[selectedNotice.priority].icon, { className: 'w-5 h-5' })}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedNotice.title}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{selectedNotice.sender} • {selectedNotice.date}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNotice(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${priorityConfig[selectedNotice.priority].color}`}>{selectedNotice.priority} Priority</span>
                                <span className="text-xs bg-primary/5 text-primary px-2.5 py-1 rounded-lg font-medium">{selectedNotice.category}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentNotices;
