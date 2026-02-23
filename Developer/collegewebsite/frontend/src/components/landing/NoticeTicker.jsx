import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';
import { getNotices } from '../../api';

const NoticeTicker = () => {
    const [notices, setNotices] = useState([]);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        getNotices()
            .then(data => {
                const recent = (data.notices || []).slice(0, 8);
                setNotices(recent);
            })
            .catch(() => {});
    }, []);

    if (notices.length === 0) return null;

    return (
        <div className="bg-primary text-white overflow-hidden">
            <div className="max-w-7xl mx-auto flex items-center">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-accent text-gray-900 font-bold text-xs uppercase tracking-wider shrink-0 z-10">
                    <Megaphone className="w-4 h-4" />
                    <span className="hidden sm:inline">Latest</span>
                </div>
                <div
                    className="flex-1 overflow-hidden relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div
                        className={`flex whitespace-nowrap ticker-scroll ${isPaused ? 'paused' : ''}`}
                    >
                        {[...notices, ...notices].map((n, i) => (
                            <a key={i} href="#notices" className="inline-flex items-center gap-2 px-6 py-2.5 text-xs hover:text-accent transition-colors">
                                <ChevronRight className="w-3 h-3 text-accent shrink-0" />
                                <span className="truncate max-w-[300px]">{n.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeTicker;
