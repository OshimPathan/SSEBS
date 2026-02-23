import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp, Phone, X } from 'lucide-react';

const FloatingActions = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showQuickContact, setShowQuickContact] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Quick Contact Popup */}
            {showQuickContact && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[calc(100vw-3rem)] sm:w-72 animate-fade-in-up mb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 text-sm font-serif">Quick Contact</h4>
                        <button onClick={() => setShowQuickContact(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <a href="tel:9857078448" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs font-semibold text-gray-800">Call Office</p>
                                <p className="text-[11px] text-gray-500">9857078448</p>
                            </div>
                        </a>
                        <a href="tel:9851206206" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs font-semibold text-gray-800">Call Principal</p>
                                <p className="text-[11px] text-gray-500">9851206206</p>
                            </div>
                        </a>
                        <a href="https://wa.me/9779857078448?text=Namaste%21%20I%20want%20to%20know%20about%20Seven%20Star%20School." target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-xs font-semibold text-gray-800">WhatsApp</p>
                                <p className="text-[11px] text-gray-500">Chat with us</p>
                            </div>
                        </a>
                        <a href="mailto:sevenstar.school2063@gmail.com"
                            className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <div>
                                <p className="text-xs font-semibold text-gray-800">Email Us</p>
                                <p className="text-[11px] text-gray-500">sevenstar.school2063@gmail.com</p>
                            </div>
                        </a>
                    </div>
                </div>
            )}

            {/* Scroll to Top */}
            {showScrollTop && (
                <button onClick={scrollToTop}
                    className="w-11 h-11 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all hover:scale-110 flex items-center justify-center animate-fade-in">
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}

            {/* WhatsApp FAB */}
            <button
                onClick={() => setShowQuickContact(!showQuickContact)}
                className="w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center relative group">
                {showQuickContact ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {!showQuickContact && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
                )}
            </button>
        </div>
    );
};

export default FloatingActions;
