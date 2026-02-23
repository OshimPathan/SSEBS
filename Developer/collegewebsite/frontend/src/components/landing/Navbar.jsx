import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, Mail, Clock, MapPin, ChevronDown, Facebook } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);

            // Track active section
            const sections = ['hero', 'notices', 'about', 'programs', 'facilities', 'gallery', 'admissions', 'team', 'testimonials', 'contact'];
            let current = 'hero';
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 150) current = id;
                }
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#hero' },
        {
            name: 'About',
            href: '#about',
            children: [
                { name: 'About Us', href: '#about' },
                { name: 'Our Leadership', href: '#team' },
                { name: 'Testimonials', href: '#testimonials' },
            ]
        },
        {
            name: 'Academics',
            href: '#programs',
            children: [
                { name: 'School Programs (Nursery–10)', href: '#programs' },
                { name: 'Higher Secondary (+2)', href: '#programs' },
                { name: 'Facilities & Campus', href: '#facilities' },
                { name: 'Gallery', href: '#gallery' },
            ]
        },
        {
            name: 'Admissions',
            href: '#admissions',
            children: [
                { name: 'Admission Process', href: '#admissions' },
                { name: 'Apply Online', href: '/admission', isRoute: true },
                { name: 'Scholarships', href: '#admissions' },
            ]
        },
        {
            name: 'Exam',
            href: '/exam-schedule',
            isRoute: true,
            children: [
                { name: 'Exam Schedule', href: '/exam-schedule', isRoute: true },
                { name: 'Check Results', href: '/results', isRoute: true },
            ]
        },
        { name: 'Notices', href: '#notices' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <>
            {/* Top Bar */}
            <div className="bg-primary text-white text-xs hidden lg:block">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-10">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" /> 9857078448 / 9851206206
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3" /> sevenstar.school2063@gmail.com
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Devdaha-2, Rupandehi
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Sun - Fri: 9:00 AM - 5:00 PM
                        </span>
                        <div className="flex items-center gap-2 ml-4 border-l border-white/20 pl-4">
                            <a href="https://www.facebook.com/profile.php?id=100037085914325" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                <Facebook className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 shrink-0">
                            <img src="/logo.png" alt="Sevenstar Logo" className="h-14 w-14 rounded-full object-cover" />
                            <div className="flex flex-col">
                                <span className="font-serif font-bold text-xl text-primary leading-tight">Seven Star</span>
                                <span className="text-[11px] text-gray-500 font-medium tracking-wider uppercase">English Boarding School</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative group"
                                    onMouseEnter={() => setActiveDropdown(link.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    {link.isRoute ? (
                                        <Link
                                            to={link.href}
                                            className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                                                activeDropdown === link.name ? 'text-primary' : 'text-gray-700 hover:text-primary'
                                            }`}
                                        >
                                            {link.name}
                                            {link.children && <ChevronDown className="w-3.5 h-3.5" />}
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors relative ${
                                                activeSection === link.href.replace('#', '')
                                                    ? 'text-primary'
                                                    : activeDropdown === link.name ? 'text-primary' : 'text-gray-700 hover:text-primary'
                                            }`}
                                        >
                                            {link.name}
                                            {link.children && <ChevronDown className="w-3.5 h-3.5" />}
                                            {activeSection === link.href.replace('#', '') && (
                                                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                                            )}
                                        </a>
                                    )}

                                    {/* Dropdown */}
                                    {link.children && activeDropdown === link.name && (
                                        <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-b border-t-2 border-primary py-2 animate-fade-in">
                                            {link.children.map((child) => (
                                                child.isRoute ? (
                                                    <Link
                                                        key={child.name}
                                                        to={child.href}
                                                        className="block px-5 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        key={child.name}
                                                        href={child.href}
                                                        className="block px-5 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                                    >
                                                        {child.name}
                                                    </a>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Link to="/login" className="ml-4 btn-primary">
                                ERP Login
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-gray-700 hover:text-primary focus:outline-none p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden bg-white border-t shadow-lg absolute w-full animate-fade-in">
                        <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                            {navLinks.map((link) => (
                                <div key={link.name}>
                                    {link.isRoute ? (
                                        <Link
                                            to={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-primary/5 rounded uppercase tracking-wide"
                                        >
                                            {link.name}
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-primary/5 rounded uppercase tracking-wide"
                                        >
                                            {link.name}
                                        </a>
                                    )}
                                    {link.children && (
                                        <div className="pl-6 space-y-1">
                                            {link.children.map((child) => (
                                                child.isRoute ? (
                                                    <Link
                                                        key={child.name}
                                                        to={child.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block px-4 py-2 text-sm text-gray-500 hover:text-primary"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        key={child.name}
                                                        href={child.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block px-4 py-2 text-sm text-gray-500 hover:text-primary"
                                                    >
                                                        {child.name}
                                                    </a>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 pb-2 px-4">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary block text-center w-full">
                                    ERP Login
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
