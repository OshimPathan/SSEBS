import React from 'react';
import { Monitor, Library, Bus, Trophy, Wifi, Home, Utensils, FlaskConical, Shield } from 'lucide-react';

const facilities = [
    { name: "Boys & Girls Hostel", icon: <Home className="w-6 h-6" />, desc: "Separate wings with warden supervision, nutritious meals & 24/7 security", color: "bg-blue-50 text-blue-600" },
    { name: "Computer Lab", icon: <Monitor className="w-6 h-6" />, desc: "30+ modern PCs with high-speed internet and smart board", color: "bg-purple-50 text-purple-600" },
    { name: "Science Labs", icon: <FlaskConical className="w-6 h-6" />, desc: "Physics, Chemistry & Biology labs with updated equipment", color: "bg-amber-50 text-amber-600" },
    { name: "Library", icon: <Library className="w-6 h-6" />, desc: "5,000+ books, newspapers, digital resources & quiet reading room", color: "bg-emerald-50 text-emerald-600" },
    { name: "Transportation", icon: <Bus className="w-6 h-6" />, desc: "10+ GPS-tracked buses covering Butwal, Bhairahawa & surrounding areas", color: "bg-green-50 text-green-600" },
    { name: "Sports Ground", icon: <Trophy className="w-6 h-6" />, desc: "Football, cricket, basketball, volleyball courts & indoor games", color: "bg-orange-50 text-orange-600" },
    { name: "Canteen", icon: <Utensils className="w-6 h-6" />, desc: "Hygienic cafeteria serving nutritious meals at affordable prices", color: "bg-rose-50 text-rose-600" },
    { name: "Wi-Fi Campus", icon: <Wifi className="w-6 h-6" />, desc: "High-speed fiber internet supporting digital learning campus-wide", color: "bg-cyan-50 text-cyan-600" },
    { name: "Safety & Security", icon: <Shield className="w-6 h-6" />, desc: "CCTV surveillance, security guards, visitor registration & fire safety", color: "bg-slate-50 text-slate-600" },
];

const Facilities = () => {
    return (
        <section id="facilities" className="py-16 md:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="section-title">Campus & Facilities</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">Modern infrastructure for an enriched learning environment</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilities.map((f, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all group">
                            <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                {f.icon}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{f.name}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Facilities;
