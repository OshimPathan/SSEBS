import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, FileText, GraduationCap, CheckCircle, ArrowRight, Phone, School } from 'lucide-react';

const steps = [
    { num: 1, icon: <ClipboardList className="w-5 h-5" />, title: "Inquiry", desc: "Visit campus or call us" },
    { num: 2, icon: <FileText className="w-5 h-5" />, title: "Documents", desc: "Submit required papers" },
    { num: 3, icon: <GraduationCap className="w-5 h-5" />, title: "Assessment", desc: "Grade-appropriate test" },
    { num: 4, icon: <CheckCircle className="w-5 h-5" />, title: "Confirmed", desc: "Pay fees & join us!" },
];

const Admissions = () => {
    return (
        <section id="admissions" className="py-16 md:py-20 bg-gradient-to-br from-primary to-red-900 text-white relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <School className="w-3.5 h-3.5" /> Admissions Open 2082 B.S.
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-serif mb-3">Begin Your Journey at Seven Star</h2>
                    <p className="text-white/75 max-w-xl mx-auto text-sm">Nursery to +2 — quality English-medium education with hostel, transport, and modern facilities in Devdaha.</p>
                </div>

                {/* Compact Steps */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
                    {steps.map((s, idx) => (
                        <div key={idx} className="relative text-center">
                            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-2 border border-white/20">
                                <span className="text-accent font-bold text-lg">{s.num}</span>
                            </div>
                            <h4 className="font-bold text-sm mb-0.5">{s.title}</h4>
                            <p className="text-white/60 text-xs">{s.desc}</p>
                            {idx < steps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-white/30 absolute top-5 -right-2 hidden md:block" />
                            )}
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/admission"
                        className="bg-accent hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-colors shadow-lg">
                        <GraduationCap className="w-4 h-4" /> Apply Now
                    </Link>
                    <a href="https://wa.me/9779857078448?text=Hello%20Seven%20Star!%20I%20want%20admission%20information."
                        target="_blank" rel="noopener noreferrer"
                        className="bg-white/15 hover:bg-white/25 backdrop-blur text-white font-semibold px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-colors border border-white/20">
                        <Phone className="w-4 h-4" /> WhatsApp Inquiry
                    </a>
                </div>

                <p className="text-center text-white/50 text-xs mt-6">
                    Admission Office: Sun–Fri, 9 AM – 5 PM &nbsp;|&nbsp; 9857078448 / 9851206206
                </p>
            </div>
        </section>
    );
};

export default Admissions;
