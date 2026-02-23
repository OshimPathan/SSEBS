import React, { useState } from 'react';
import { Award, Users, Lightbulb, Heart, ShieldCheck, Globe, BookOpen, GraduationCap, Trophy, Bus, Home, Wifi, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

const WhyChooseUs = () => {
    const [expandedCard, setExpandedCard] = useState(null);

    const reasons = [
        {
            title: "19+ Years of Academic Excellence",
            icon: <Award className="w-6 h-6" />,
            summary: "Established in 2063 B.S. with nearly two decades of educational expertise in Devdaha, Rupandehi.",
            details: [
                "Established in 2063 B.S. (2007 A.D.) in Devdaha Municipality, Rupandehi",
                "One of the most trusted private schools in Lumbini Province",
                "Consistently producing top SEE results in the district",
                "100% SLC/SEE pass rate with numerous distinction holders",
                "Recognized for quality by District Education Office",
                "Trusted by 900+ families across Rupandehi and neighboring districts"
            ],
            color: "from-primary to-red-800"
        },
        {
            title: "English-Medium Instruction",
            icon: <Globe className="w-6 h-6" />,
            summary: "Complete English-medium education from Nursery to +2, preparing students for global opportunities.",
            details: [
                "All subjects taught in English from Nursery level",
                "Dedicated English communication practice on campus",
                "Students demonstrate strong reading, writing, and speaking skills",
                "Nepali language and culture maintained through dedicated periods",
                "Students confidently participate in inter-school English debate, essay, and speech competitions",
                "Global language advantage for higher education abroad"
            ],
            color: "from-blue-600 to-blue-800"
        },
        {
            title: "NEB-Affiliated +2 Programs",
            icon: <GraduationCap className="w-6 h-6" />,
            summary: "Five career-oriented Higher Secondary streams: Management, Computer Science, Hotel Management, Finance, Education.",
            details: [
                "+2 Management — Accounting, Economics, Business Studies with career guidance",
                "+2 Computer Science — Programming, Database, Networking with dedicated lab",
                "+2 Hotel Management — Hospitality & Tourism with practical kitchen and internship",
                "+2 Finance — Banking, Investment, Financial Analysis for banking careers",
                "+2 Education — Teaching pedagogy with school practicum for teaching license",
                "NEB Board examination preparation with mock tests and extra classes"
            ],
            color: "from-purple-600 to-purple-800"
        },
        {
            title: "80+ Experienced Faculty",
            icon: <Users className="w-6 h-6" />,
            summary: "Highly qualified teachers with years of experience, offering personal attention to every student.",
            details: [
                "80+ full-time qualified teachers with B.Ed / M.Ed / M.Sc degrees",
                "Maximum 35 students per class for personal attention",
                "Regular teacher training workshops and professional development",
                "Dedicated class teachers for Nursery & primary with caring approach",
                "Subject specialist teachers for secondary & +2 students",
                "Accessible faculty — regular parent-teacher meetings every quarter"
            ],
            color: "from-emerald-600 to-emerald-800"
        },
        {
            title: "Holistic Student Development",
            icon: <Trophy className="w-6 h-6" />,
            summary: "Beyond textbooks — sports, arts, debates, clubs, and leadership programs shaping well-rounded individuals.",
            details: [
                "Annual Sports Week with inter-house competitions (Football, Cricket, Basketball, Athletics)",
                "Science Exhibition & Project Showcase every year",
                "Debate, Quiz, Essay, and Speech competitions with inter-school participation",
                "Art, Music, Dance classes and cultural performance opportunities",
                "NCC, Scouts, Red Cross, and Ecology Club for social responsibility",
                "Educational tours, field visits, and industry exposure trips"
            ],
            color: "from-amber-600 to-orange-700"
        },
        {
            title: "Modern Facilities & Infrastructure",
            icon: <Home className="w-6 h-6" />,
            summary: "Well-equipped campus with hostel, labs, library, transport, sports ground, and Wi-Fi connectivity.",
            details: [
                "Spacious hostel with separate boys & girls wings, warden supervision, 3 meals + snacks",
                "Computer lab with 30+ modern PCs, high-speed internet, and smart boards",
                "Science labs (Physics, Chemistry, Biology) with updated equipment",
                "Library with 5,000+ books, digital resources, reading room, and newspaper corner",
                "10+ school buses covering Butwal, Bhairahawa, Manigram & surrounding areas",
                "Full campus Wi-Fi, CCTV surveillance, and 24/7 security guards"
            ],
            color: "from-teal-600 to-teal-800"
        },
        {
            title: "Discipline & Safe Environment",
            icon: <ShieldCheck className="w-6 h-6" />,
            summary: "Zero-tolerance for bullying, strict discipline policy, and a nurturing campus environment.",
            details: [
                "Strict anti-bullying policy with counselor support",
                "CCTV monitored campus with security guards at all entry points",
                "Mandatory uniform and ID card policy for safety",
                "Regular emergency drills and fire safety training",
                "Student counseling service for academic stress and personal guidance",
                "Strong moral & value education integrated into the curriculum"
            ],
            color: "from-slate-600 to-slate-800"
        },
        {
            title: "Affordable Fees & Scholarships",
            icon: <Heart className="w-6 h-6" />,
            summary: "Quality education at competitive prices with merit-based scholarships for deserving students.",
            details: [
                "Monthly tuition starting from NRs. 2,500 (Nursery) to NRs. 6,500 (+2)",
                "Flexible payment options: cash, bank transfer, eSewa, Khalti",
                "Merit-based scholarships for 80%+ scorers in entrance exams",
                "Special scholarships for economically disadvantaged families",
                "Sibling discount for families enrolling multiple children",
                "Transparent fee structure with no hidden charges"
            ],
            color: "from-rose-600 to-pink-800"
        },
        {
            title: "Strong Alumni Network & Results",
            icon: <Lightbulb className="w-6 h-6" />,
            summary: "Our graduates excel in medicine, engineering, CA, and civil service. Proven results that speak for themselves.",
            details: [
                "Alumni working in Nepal and abroad as doctors, engineers, CAs, and officers",
                "Multiple scholarship recipients for higher education in India, Japan, Korea, Australia",
                "SEE toppers from our school regularly secure district-level rankings",
                "Active alumni association helping current students with career guidance",
                "100% SEE pass rate with majority achieving A+ and A grades",
                "Strong network of parents and alumni recommending Seven Star"
            ],
            color: "from-indigo-600 to-indigo-800"
        },
    ];

    return (
        <section id="whychoose" className="py-16 md:py-24 bg-gray-900 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -ml-40 -mb-40"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Why Choose Seven Star?</h2>
                    <div className="w-20 h-1 bg-accent mx-auto mt-3 mb-6"></div>
                    <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        For nearly two decades, Seven Star English Boarding School has been shaping future leaders in Devdaha, Rupandehi. Here's what sets us apart and why 900+ families trust us with their children's education.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reasons.map((reason, idx) => {
                        const isExpanded = expandedCard === idx;
                        return (
                            <div key={idx}
                                className={`rounded-xl border transition-all duration-300 cursor-pointer group ${
                                    isExpanded
                                        ? 'bg-white/10 border-accent/40 shadow-lg shadow-accent/5 md:col-span-2 lg:col-span-1'
                                        : 'bg-white/5 border-white/10 hover:border-accent/30 hover:bg-white/[0.08]'
                                }`}
                                onClick={() => setExpandedCard(isExpanded ? null : idx)}>

                                <div className="p-6">
                                    {/* Icon + Title */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reason.color} text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-lg`}>
                                            {reason.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold font-serif leading-snug mb-1">{reason.title}</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed">{reason.summary}</p>
                                        </div>
                                    </div>

                                    {/* Expand indicator */}
                                    <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isExpanded ? 'text-accent' : 'text-gray-500 group-hover:text-accent/70'}`}>
                                        {isExpanded ? 'Show Less' : 'Read More'}
                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                                            <div className="space-y-2.5">
                                                {reason.details.map((detail, i) => (
                                                    <div key={i} className="flex items-start gap-2.5">
                                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                                        <p className="text-sm text-gray-300 leading-relaxed">{detail}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-14 text-center">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto backdrop-blur-sm">
                        <h3 className="font-serif text-xl font-bold text-white mb-2">Ready to Join Seven Star Family?</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
                            Experience the difference that 19+ years of educational excellence brings. Visit our campus or speak with our admissions team today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a href="#admissions" className="btn-primary px-8 py-3 inline-flex items-center gap-2 text-sm">
                                Apply for Admission <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href="#contact" className="btn-outline px-8 py-3 inline-flex items-center gap-2 text-sm border-white/30 text-white hover:bg-white/10">
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
