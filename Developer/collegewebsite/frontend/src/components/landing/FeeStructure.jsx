import React, { useState } from 'react';
import { IndianRupee, GraduationCap, Home, Bus, FlaskConical, Utensils, CreditCard, Info, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';

const FeeStructure = () => {
    const [selectedLevel, setSelectedLevel] = useState('school');

    const schoolFees = [
        { level: "Nursery / LKG / UKG", tuition: "2,500", admission: "5,000", annual: "3,000", exam: "1,500", monthly: "2,500" },
        { level: "Class 1 - 3", tuition: "3,000", admission: "6,000", annual: "3,500", exam: "2,000", monthly: "3,000" },
        { level: "Class 4 - 5", tuition: "3,500", admission: "7,000", annual: "4,000", exam: "2,500", monthly: "3,500" },
        { level: "Class 6 - 8", tuition: "4,000", admission: "8,000", annual: "4,500", exam: "3,000", monthly: "4,000" },
        { level: "Class 9 - 10 (SEE)", tuition: "5,000", admission: "10,000", annual: "5,000", exam: "3,500", monthly: "5,000" },
    ];

    const plusTwoFees = [
        { stream: "Management", tuition: "5,500", admission: "15,000", annual: "5,000", exam: "4,000", monthly: "5,500" },
        { stream: "Computer Science", tuition: "6,000", admission: "18,000", annual: "5,500", exam: "4,500", monthly: "6,000" },
        { stream: "Hotel Management", tuition: "6,500", admission: "20,000", annual: "6,000", exam: "4,500", monthly: "6,500" },
        { stream: "Education", tuition: "5,000", admission: "12,000", annual: "4,500", exam: "3,500", monthly: "5,000" },
    ];

    const additionalFees = [
        { icon: <Home className="w-6 h-6" />, name: "Hostel Fee", amount: "4,500/month", desc: "Includes room, 3 meals + snacks, laundry, warden supervision, 24/7 security", color: "bg-blue-50 text-blue-600 border-blue-200" },
        { icon: <Bus className="w-6 h-6" />, name: "Transportation", amount: "2,000 - 3,500/month", desc: "Based on distance. Routes cover Butwal, Bhairahawa, Manigram & surrounding areas", color: "bg-green-50 text-green-600 border-green-200" },
        { icon: <FlaskConical className="w-6 h-6" />, name: "Computer Lab Fee", amount: "2,000/year", desc: "Access to computer lab with internet, projector, and modern hardware", color: "bg-purple-50 text-purple-600 border-purple-200" },
        { icon: <FlaskConical className="w-6 h-6" />, name: "Science Lab Fee", amount: "2,500/year", desc: "Physics, Chemistry & Biology practical sessions with updated equipment", color: "bg-amber-50 text-amber-600 border-amber-200" },
        { icon: <Utensils className="w-6 h-6" />, name: "Canteen / Tiffin", amount: "1,500/month", desc: "Optional meal plan for day scholars — hygienic, balanced nutrition", color: "bg-rose-50 text-rose-600 border-rose-200" },
        { icon: <GraduationCap className="w-6 h-6" />, name: "Uniform & Stationery", amount: "3,000 - 5,000 (one-time)", desc: "Two sets of uniform, house dress, PE kit, ID card, school diary", color: "bg-teal-50 text-teal-600 border-teal-200" },
    ];

    const paymentInfo = [
        { title: "Payment Modes", items: ["Cash at school office", "Bank transfer (NIC Asia / Nabil)", "eSewa, Khalti, FonePay", "Cheque (in school's name)"] },
        { title: "Payment Schedule", items: ["Admission & annual fee: At admission", "Monthly tuition: By 10th of each month", "Exam fee: Before exam dates", "Late fee: NRs. 50/day after due date"] },
    ];

    return (
        <section id="fees" className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-accent/15 text-accent-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <IndianRupee className="w-3.5 h-3.5" /> Session 2082 B.S.
                    </div>
                    <h2 className="section-title">Fee Structure</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">Transparent and affordable fee structure. Quality education accessible to all families in Rupandehi.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                        <button
                            onClick={() => setSelectedLevel('school')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${selectedLevel === 'school' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            School (Nursery – 10)
                        </button>
                        <button
                            onClick={() => setSelectedLevel('plus2')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${selectedLevel === 'plus2' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Higher Secondary (+2)
                        </button>
                    </div>
                </div>

                {/* School Fee Table */}
                {selectedLevel === 'school' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-16 animate-fade-in">
                        <div className="bg-primary px-6 py-4">
                            <h3 className="text-white font-bold font-serif text-lg">School Level Fee Structure</h3>
                            <p className="text-white/70 text-xs mt-0.5">Nursery to Class 10 (SEE) — All amounts in NRs.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        <th className="py-3.5 px-5">Level</th>
                                        <th className="py-3.5 px-5 text-center">Monthly Tuition</th>
                                        <th className="py-3.5 px-5 text-center hidden sm:table-cell">Admission Fee</th>
                                        <th className="py-3.5 px-5 text-center hidden md:table-cell">Annual Fee</th>
                                        <th className="py-3.5 px-5 text-center hidden md:table-cell">Exam Fee/Term</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {schoolFees.map((fee, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-5 text-sm font-semibold text-gray-800">{fee.level}</td>
                                            <td className="py-4 px-5 text-center">
                                                <span className="text-sm font-bold text-primary">NRs. {fee.monthly}</span>
                                            </td>
                                            <td className="py-4 px-5 text-center text-sm text-gray-500 hidden sm:table-cell">NRs. {fee.admission}</td>
                                            <td className="py-4 px-5 text-center text-sm text-gray-500 hidden md:table-cell">NRs. {fee.annual}</td>
                                            <td className="py-4 px-5 text-center text-sm text-gray-500 hidden md:table-cell">NRs. {fee.exam}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* +2 Fee Table */}
                {selectedLevel === 'plus2' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-16 animate-fade-in">
                        <div className="bg-primary px-6 py-4">
                            <h3 className="text-white font-bold font-serif text-lg">Higher Secondary (+2) Fee Structure</h3>
                            <p className="text-white/70 text-xs mt-0.5">NEB Affiliated Programs — All amounts in NRs.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        <th className="py-3.5 px-5">Stream</th>
                                        <th className="py-3.5 px-5 text-center">Monthly Tuition</th>
                                        <th className="py-3.5 px-5 text-center hidden sm:table-cell">Admission Fee</th>
                                        <th className="py-3.5 px-5 text-center hidden md:table-cell">Annual Fee</th>
                                        <th className="py-3.5 px-5 text-center hidden md:table-cell">Exam Fee/Term</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {plusTwoFees.map((fee, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-5 text-sm font-semibold text-gray-800">{fee.stream}</td>
                                            <td className="py-4 px-5 text-center">
                                                <span className="text-sm font-bold text-primary">NRs. {fee.monthly}</span>
                                            </td>
                                            <td className="py-4 px-5 text-center text-sm text-gray-500 hidden sm:table-cell">NRs. {fee.admission}</td>
                                            <td className="py-4 px-5 text-center text-sm text-gray-500 hidden md:table-cell">NRs. {fee.annual}</td>
                                            <td className="py-4 px-5 text-center text-sm text-gray-500 hidden md:table-cell">NRs. {fee.exam}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Additional Fees - Hostel, Bus, Lab etc */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold text-gray-900 font-serif text-center mb-3">Additional Fees</h3>
                    <p className="text-sm text-gray-500 text-center mb-8">Hostel, transportation, lab, and other optional services</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {additionalFees.map((item, idx) => (
                            <div key={idx} className={`rounded-xl border p-6 hover:shadow-lg transition-all ${item.color}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    {item.icon}
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <span className="text-sm font-bold">NRs. {item.amount}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {paymentInfo.map((section, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 font-serif">
                                <CreditCard className="w-5 h-5 text-primary" /> {section.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-800 font-semibold mb-1">Important Note</p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Fee structure is subject to revision. Fees mentioned are indicative for session 2082 B.S. and may vary slightly. 
                            Sibling discounts, merit scholarships, and financial aid options are available — inquire at the admission office. 
                            All fees are non-refundable once the admission is confirmed. Contact us for the latest updated fee details.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeeStructure;
