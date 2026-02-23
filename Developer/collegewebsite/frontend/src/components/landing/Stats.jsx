import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpenCheck, Clock, Award } from 'lucide-react';

const useCountUp = (end, duration = 2000, startCounting = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!startCounting) return;
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration, startCounting]);
    return count;
};

const Stats = () => {
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const stats = [
        { label: "Active Students", value: 971, suffix: "+", icon: <Users className="w-8 h-8" /> },
        { label: "Expert Teachers", value: 80, suffix: "+", icon: <BookOpenCheck className="w-8 h-8" /> },
        { label: "Years of Excellence", value: 19, suffix: "+", icon: <Clock className="w-8 h-8" /> },
        { label: "SLC Pass Rate", value: 100, suffix: "%", icon: <Award className="w-8 h-8" /> },
    ];

    return (
        <section ref={ref} className="relative py-20 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <img src="/gallery1.jpg" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/90" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">Facts & Figures</h2>
                    <div className="w-20 h-1 bg-accent mx-auto mt-3"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                    {stats.map((stat, idx) => (
                        <StatItem key={idx} stat={stat} visible={visible} />
                    ))}
                </div>
            </div>

            {/* Decorative rhombus shapes like Trinity */}
            <div className="absolute top-10 left-10 w-16 h-16 border-2 border-accent/20 rotate-45 hidden lg:block"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-accent/20 rotate-45 hidden lg:block"></div>
        </section>
    );
};

const StatItem = ({ stat, visible }) => {
    const count = useCountUp(stat.value, 2000, visible);
    return (
        <div className="text-center group">
            <div className="flex justify-center mb-4 text-accent group-hover:-translate-y-1 transition-transform duration-300">
                {stat.icon}
            </div>
            <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 font-serif tabular-nums">
                {count}{stat.suffix}
            </div>
            <div className="text-accent text-sm font-semibold uppercase tracking-[0.15em]">
                {stat.label}
            </div>
        </div>
    );
};

export default Stats;
