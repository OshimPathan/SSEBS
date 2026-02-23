import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, GraduationCap, FileText, ClipboardCheck, CalendarDays } from 'lucide-react';

const QuickInfoBar = () => {
    const items = [
        { icon: <Phone className="w-5 h-5" />, label: 'Call Us', value: '9857078448', href: 'tel:9857078448', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: 'Devdaha-2, Rupandehi', href: 'https://maps.google.com/?q=Seven+Star+English+Boarding+School+Devdaha', external: true, color: 'bg-green-50 text-green-600 border-green-100' },
        { icon: <GraduationCap className="w-5 h-5" />, label: 'Admissions Open', value: 'Nursery – Grade 12', href: '#admissions', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { icon: <CalendarDays className="w-5 h-5" />, label: 'Exam Schedule', value: 'View Schedule', href: '/exam-schedule', isRoute: true, color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Check Results', value: 'SEE & NEB', href: '/results', isRoute: true, color: 'bg-rose-50 text-rose-600 border-rose-100' },
        { icon: <FileText className="w-5 h-5" />, label: 'Notice Board', value: 'Latest Updates', href: '#notices', color: 'bg-teal-50 text-teal-600 border-teal-100' },
    ];

    return (
        <section className="relative -mt-10 z-30 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {items.map((item, idx) => {
                        const inner = (
                            <div className={`flex flex-col items-center text-center p-4 rounded-xl border ${item.color} bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group`}>
                                <div className="mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{item.label}</span>
                                <span className="text-xs font-semibold leading-tight">{item.value}</span>
                            </div>
                        );

                        if (item.isRoute) {
                            return <Link key={idx} to={item.href}>{inner}</Link>;
                        }
                        if (item.external) {
                            return <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a>;
                        }
                        return <a key={idx} href={item.href}>{inner}</a>;
                    })}
                </div>
            </div>
        </section>
    );
};

export default QuickInfoBar;
