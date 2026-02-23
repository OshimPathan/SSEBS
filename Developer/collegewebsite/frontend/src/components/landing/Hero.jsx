import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, FileText, ClipboardCheck, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
    {
        image: '/banner.jpg',
        title: 'Welcome to Seven Star',
        subtitle: 'English Boarding School',
        desc: 'Quality English-medium education from Nursery to +2 in Devdaha, Rupandehi',
    },
    {
        image: '/gallery1.jpg',
        title: 'Shaping Future Leaders',
        subtitle: 'Since 2063 B.S.',
        desc: 'Nearly two decades of academic excellence and holistic development',
    },
    {
        image: '/gallery3.jpg',
        title: 'NEB Affiliated +2 Programs',
        subtitle: 'Management · Computer Science · Education',
        desc: 'Specialized career paths for bright futures under National Examinations Board',
    },
    {
        image: '/gallery5.jpg',
        title: 'Where Excellence Meets Values',
        subtitle: 'Empowering Minds, Building Character',
        desc: 'Blending tradition with innovation in the heart of Lumbini Province',
    },
];

const Hero = () => {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const goTo = useCallback((idx) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrent(idx);
        setTimeout(() => setIsAnimating(false), 800);
    }, [isAnimating]);

    const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
    const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

    useEffect(() => {
        const timer = setInterval(next, 5500);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section id="hero" className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-gray-900">
            {/* Slides */}
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className={`w-full h-full object-cover ${
                            idx === current ? 'animate-zoom-in' : ''
                        }`}
                        style={{ transformOrigin: 'center center' }}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
                <div className={`max-w-4xl transition-all duration-700 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    {/* Decorative line */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <span className="w-12 h-0.5 bg-accent"></span>
                        <span className="text-accent text-sm font-semibold uppercase tracking-[0.3em]">Est. 2063 B.S.</span>
                        <span className="w-12 h-0.5 bg-accent"></span>
                    </div>

                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                        {slides[current].title}
                    </h1>
                    <h2 className="font-serif text-xl md:text-3xl text-accent font-semibold mb-6">
                        {slides[current].subtitle}
                    </h2>
                    <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-10">
                        {slides[current].desc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#admissions" className="btn-primary bg-accent text-gray-900 hover:bg-accent-dark px-8 py-3.5 text-base flex items-center justify-center gap-2 group">
                            Apply Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="#programs" className="btn-outline px-8 py-3.5 text-base">
                            Explore Programs
                        </a>
                        <a href="#fees" className="btn-outline px-8 py-3.5 text-base border-accent/50 hover:bg-accent hover:text-gray-900 hover:border-accent hidden sm:inline-flex">
                            Fee Structure
                        </a>
                    </div>
                </div>
            </div>

            {/* Side Quick Access (Desktop) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-2">
                {[
                    { icon: <GraduationCap className="w-4 h-4" />, label: 'Admissions', href: '#admissions' },
                    { icon: <FileText className="w-4 h-4" />, label: 'Exam Schedule', href: '/exam-schedule', isRoute: true },
                    { icon: <ClipboardCheck className="w-4 h-4" />, label: 'Results', href: '/results', isRoute: true },
                    { icon: <Phone className="w-4 h-4" />, label: 'Contact', href: '#contact' },
                ].map((item, i) => item.isRoute ? (
                    <Link key={i} to={item.href} className="group flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-white/0 group-hover:text-white/90 transition-all text-right whitespace-nowrap">{item.label}</span>
                        <span className="w-10 h-10 rounded-lg bg-white/10 hover:bg-primary backdrop-blur flex items-center justify-center text-white transition-all group-hover:scale-110">
                            {item.icon}
                        </span>
                    </Link>
                ) : (
                    <a key={i} href={item.href} className="group flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-white/0 group-hover:text-white/90 transition-all text-right whitespace-nowrap">{item.label}</span>
                        <span className="w-10 h-10 rounded-lg bg-white/10 hover:bg-primary backdrop-blur flex items-center justify-center text-white transition-all group-hover:scale-110">
                            {item.icon}
                        </span>
                    </a>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prev}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 hover:bg-primary backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 hover:bg-primary backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            idx === current ? 'w-8 bg-accent' : 'w-2.5 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                ))}
            </div>

            {/* Bottom decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f8f8] to-transparent z-20" />
        </section>
    );
};

export default Hero;
