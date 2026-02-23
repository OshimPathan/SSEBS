import React from 'react';
import { Facebook, MessageCircle, Mail, MapPin, Phone, ChevronRight, ArrowUp } from 'lucide-react';

const Footer = () => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <img src="/logo.png" alt="Sevenstar Logo" className="h-12 w-12 rounded-full object-cover" />
                            <div>
                                <span className="font-serif font-bold text-lg text-white leading-tight block">Seven Star</span>
                                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">English Boarding School</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-5">
                            Established in 2063 B.S., shaping future leaders through quality education near Rohini River Bridge, Devdaha-2, Rupandehi.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/profile.php?id=100037085914325" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors text-gray-400 hover:text-white">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://wa.me/9779857078448?text=Namaste%21" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors text-gray-400 hover:text-white">
                                <MessageCircle className="w-4 h-4" />
                            </a>
                            <a href="mailto:sevenstar.school2063@gmail.com" className="w-9 h-9 rounded bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-gray-400 hover:text-white">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5 font-serif">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {[
                                { name: 'Home', href: '#hero' },
                                { name: 'About Us', href: '#about' },
                                { name: 'Academic Programs', href: '#programs' },
                                { name: 'Admissions', href: '#admissions' },
                                { name: 'Fee Structure', href: '#fees' },
                                { name: 'Facilities', href: '#facilities' },
                                { name: 'Gallery', href: '#gallery' },
                                { name: 'Notice Board', href: '#notices' },
                                { name: 'Contact Us', href: '#contact' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-gray-400 hover:text-accent transition-colors flex items-center text-sm group">
                                        <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-primary group-hover:text-accent transition-colors" /> {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5 font-serif">Our Programs</h4>
                        <ul className="space-y-2.5">
                            {['Montessori / Nursery', 'Primary Education', 'Lower Secondary', 'Secondary (SEE)', '+2 Management', '+2 Computer Science', '+2 Education'].map((link, idx) => (
                                <li key={idx}>
                                    <a href="#programs" className="text-gray-400 hover:text-accent transition-colors flex items-center text-sm group">
                                        <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-primary group-hover:text-accent transition-colors" /> {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5 font-serif">Contact Us</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-gray-400">Rohini River Bridge, Dhekawar<br />Devdaha-2, Rupandehi, Nepal</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-gray-400">9857078448 / 9851206206<br />071-680529</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-gray-400">sevenstar.school2063@gmail.com</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-gray-800">
                            <p className="text-xs text-gray-500 mb-1">Office Hours</p>
                            <p className="text-sm text-gray-400">Sun - Fri: 9:00 AM - 5:00 PM</p>
                            <p className="text-xs text-gray-500 mt-1">Principal: <span className="text-white">Tikaram Chapagain</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Seven Star English Boarding School. All rights reserved.</p>
                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <span className="text-gray-700">|</span>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <button onClick={scrollToTop} className="ml-4 w-8 h-8 rounded bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors">
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
