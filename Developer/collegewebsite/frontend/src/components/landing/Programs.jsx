import React, { useState, useEffect } from 'react';
import { Baby, Book, Calculator, MonitorPlay, Code, Briefcase, Coffee, Building2, GraduationCap, ArrowRight, ChevronDown, ChevronUp, BookOpen, X, IndianRupee, ClipboardList, FileText, Download, CheckCircle, Clock, Users, School, Star, FlaskConical } from 'lucide-react';
import { getProgramSubjects } from '../../api';

const Programs = () => {
    const [subjects, setSubjects] = useState([]);
    const [expandedProgram, setExpandedProgram] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [activeTab, setActiveTab] = useState('subjects');

    useEffect(() => {
        getProgramSubjects().then(data => setSubjects(data)).catch(() => {});
    }, []);

    // Detailed program data with subjects, fees, admission, syllabus
    const programDetails = {
        montessori: {
            title: "Montessori (Nursery / LKG / UKG)",
            tagline: "Building curiosity through play-based learning",
            age: "3 - 5 years",
            duration: "3 years",
            classes: "Nursery, LKG, UKG",
            defaultSubjects: ["English", "Nepali", "Mathematics", "Science (EVS)", "Drawing & Craft", "Rhymes & Songs", "General Knowledge", "Physical Education"],
            fee: { monthly: "2,500", admission: "5,000", annual: "3,000", exam: "1,500" },
            admissionReq: ["Age: 3+ for Nursery, 4+ LKG, 5+ UKG", "Birth certificate (original + copy)", "Immunization card", "4 passport photos", "Parent/Guardian citizenship copy"],
            syllabus: ["Play-based learning approach", "Letter & number recognition", "Basic reading & writing skills", "Creative arts & motor skills", "Environmental awareness", "Moral values & discipline"],
            color: "from-pink-500 to-rose-600",
            features: ["Small class sizes (max 25)", "Trained Montessori faculty", "Safe play area", "Nutritious snack included"]
        },
        primary: {
            title: "Primary Level (Class 1 - 5)",
            tagline: "Strong foundation in language, math and science",
            age: "6 - 10 years",
            duration: "5 years",
            classes: "Class 1, 2, 3, 4, 5",
            defaultSubjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Moral Education", "Computer Science", "Health & Physical Education", "Drawing & Art"],
            fee: { monthly: "3,000 - 3,500", admission: "6,000 - 7,000", annual: "3,500 - 4,000", exam: "2,000 - 2,500" },
            admissionReq: ["Age: 6+ for Class 1", "Previous school marksheet", "Transfer certificate (TC)", "Birth certificate copy", "4 passport photos", "Parent/Guardian ID copy"],
            syllabus: ["CDC Nepal curriculum framework", "English medium instruction", "Activity-based learning", "Regular assessments & parent meetings", "Reading & comprehension programs", "Basic computer literacy from Class 1"],
            color: "from-blue-500 to-blue-700",
            features: ["English medium from Class 1", "Computer lab access", "Library period weekly", "Annual educational tours"]
        },
        lower_secondary: {
            title: "Lower Secondary (Class 6 - 8)",
            tagline: "Analytical thinking and creative skill development",
            age: "11 - 13 years",
            duration: "3 years",
            classes: "Class 6, 7, 8",
            defaultSubjects: ["English", "Nepali", "Mathematics", "Science & Technology", "Social Studies", "Occupation, Business & Tech", "Health & Physical Education", "Computer Science", "Moral Education", "Optional (Sanskrit / Local Subject)"],
            fee: { monthly: "4,000", admission: "8,000", annual: "4,500", exam: "3,000" },
            admissionReq: ["Previous class marksheet", "Transfer certificate (TC)", "Birth certificate copy", "Character certificate", "4 passport photos", "Entrance test (English, Math, Science)"],
            syllabus: ["CDC Nepal curriculum (updated)", "Project-based learning", "Science practical sessions", "Computer programming basics", "Creative writing & debate", "Environmental science projects"],
            color: "from-emerald-500 to-emerald-700",
            features: ["Science lab practicals", "Debate & quiz competitions", "Sports & extracurricular clubs", "Career guidance sessions"]
        },
        secondary: {
            title: "Secondary Level (Class 9 - 10 / SEE)",
            tagline: "SEE preparation with 100% pass rate track record",
            age: "14 - 15 years",
            duration: "2 years",
            classes: "Class 9, 10",
            defaultSubjects: ["Compulsory English", "Compulsory Nepali", "Compulsory Mathematics", "Science & Technology", "Social Studies & Life Skills", "Health, Pop & Environment", "Optional I (Computer / Opt. Math)", "Optional II (Accounting / Econ)"],
            fee: { monthly: "5,000", admission: "10,000", annual: "5,000", exam: "3,500" },
            admissionReq: ["Grade 8 marksheet", "Transfer certificate (TC)", "Character certificate", "Birth certificate copy", "4 passport photos", "Entrance test (English, Math, Science, Social)"],
            syllabus: ["NEB SEE curriculum framework", "Intensive SEE preparation", "Model question practice", "Regular unit tests & terminal exams", "Science lab practicals (Physics, Chemistry, Bio)", "Computer programming (Python basics)"],
            color: "from-purple-500 to-purple-700",
            features: ["100% SEE pass rate", "Extra classes & revision", "Mock SEE exams", "Individual student tracking", "Science lab practicals", "Career counseling after SEE"]
        },
        management: {
            title: "+2 Management",
            tagline: "Accounting, Economics, Business Studies with specializations",
            age: "16+",
            duration: "2 years (Grade 11 & 12)",
            classes: "Grade 11, Grade 12",
            defaultSubjects: ["Compulsory English", "Compulsory Nepali", "Business Studies", "Accounting", "Economics", "Marketing / Finance (Elective)", "Computer Science (Optional)", "Mathematics (Optional)"],
            fee: { monthly: "5,500", admission: "15,000", annual: "5,000", exam: "4,000" },
            admissionReq: ["SEE marksheet (min GPA 2.0)", "Character certificate", "Migration certificate", "Transfer certificate", "4 passport photos", "Entrance test"],
            syllabus: ["NEB Grade 11-12 curriculum", "Business case studies", "Practical accounting (Tally/Excel)", "Economics data analysis", "Marketing project work", "Internal + Board examinations"],
            color: "from-amber-500 to-orange-600",
            features: ["NEB affiliated", "Industry exposure visits", "Guest lectures from professionals", "Internship opportunities"]
        },
        computer_science: {
            title: "+2 Computer Science",
            tagline: "Programming, Database Management, IT Applications",
            age: "16+",
            duration: "2 years (Grade 11 & 12)",
            classes: "Grade 11, Grade 12",
            defaultSubjects: ["Compulsory English", "Compulsory Nepali", "Physics", "Mathematics", "Computer Science", "Chemistry (Grade 11-12)", "Project Work"],
            fee: { monthly: "6,000", admission: "18,000", annual: "5,500", exam: "4,500" },
            admissionReq: ["SEE marksheet (min GPA 2.4+)", "Strong Math & Science scores", "Character & Migration certificate", "Transfer certificate", "4 passport photos", "Entrance test (Math, Science, English)"],
            syllabus: ["C Programming & OOP Concepts", "Web Development (HTML/CSS/JS)", "Database Management (SQL)", "Computer Networks & Security", "Physics & Chemistry practicals", "Software project development"],
            color: "from-indigo-500 to-blue-700",
            features: ["Dedicated computer lab", "Programming competitions", "Robotics & coding clubs", "IT industry visits"]
        },
        hotel_management: {
            title: "+2 Hotel Management",
            tagline: "Hospitality, Tourism, Customer Service, Event Planning",
            age: "16+",
            duration: "2 years (Grade 11 & 12)",
            classes: "Grade 11, Grade 12",
            defaultSubjects: ["Compulsory English", "Compulsory Nepali", "Hotel Management", "Travel & Tourism", "Food Production & Nutrition", "Front Office Management", "Housekeeping", "Communication Skills"],
            fee: { monthly: "6,500", admission: "20,000", annual: "6,000", exam: "4,500" },
            admissionReq: ["SEE marksheet (min GPA 2.0)", "Character certificate", "Migration certificate", "Transfer certificate", "4 passport photos", "Entrance test + interview"],
            syllabus: ["Hotel operations & administration", "Food & beverage service", "Tourism geography of Nepal", "Event management & planning", "Front desk & housekeeping practicals", "Internship at hospitality partners"],
            color: "from-rose-500 to-pink-700",
            features: ["Practical kitchen lab", "Hotel internship program", "Tourism field trips", "Certificate in hospitality"]
        },
        finance: {
            title: "+2 Finance",
            tagline: "Banking, Investment, Budgeting & Financial Systems",
            age: "16+",
            duration: "2 years (Grade 11 & 12)",
            classes: "Grade 11, Grade 12",
            defaultSubjects: ["Compulsory English", "Compulsory Nepali", "Finance", "Accounting", "Economics", "Business Mathematics", "Computer Applications", "Business Studies"],
            fee: { monthly: "5,500", admission: "15,000", annual: "5,000", exam: "4,000" },
            admissionReq: ["SEE marksheet (min GPA 2.0)", "Character certificate", "Migration certificate", "Transfer certificate", "4 passport photos", "Entrance test"],
            syllabus: ["Financial accounting & reporting", "Banking & insurance fundamentals", "Investment & portfolio concepts", "Financial statement analysis", "Budgeting & cost management", "Nepal taxation basics"],
            color: "from-teal-500 to-cyan-700",
            features: ["Finance workshops", "Bank visit programs", "Budget simulation exercises", "Career in banking guidance"]
        },
        education: {
            title: "+2 Education",
            tagline: "Pedagogy, Teaching Methods, Child Development",
            age: "16+",
            duration: "2 years (Grade 11 & 12)",
            classes: "Grade 11, Grade 12",
            defaultSubjects: ["Compulsory English", "Compulsory Nepali", "Education & Development", "Curriculum & Evaluation", "Educational Psychology", "Health & Physical Education", "Elective Subject", "Teaching Practice"],
            fee: { monthly: "5,000", admission: "12,000", annual: "4,500", exam: "3,500" },
            admissionReq: ["SEE marksheet (min GPA 1.6)", "Character certificate", "Migration certificate", "Transfer certificate", "4 passport photos", "Entrance test + interview"],
            syllabus: ["Foundations of education", "Child psychology & development", "Classroom management techniques", "Micro-teaching practice", "Community service projects", "Teaching practicum in schools"],
            color: "from-green-500 to-emerald-700",
            features: ["Teaching practice exposure", "Community teaching projects", "Government teaching license path", "Scholarship options available"]
        },
    };

    const schoolLevels = [
        { title: "Montessori", key: "montessori", icon: <Baby className="w-7 h-7" />, desc: "Early childhood development with play-based learning", color: "bg-pink-50 text-pink-600 border-pink-200", badge: "Ages 3-5" },
        { title: "Primary (1-5)", key: "primary", icon: <Book className="w-7 h-7" />, desc: "Strong foundation in language, math and science", color: "bg-blue-50 text-blue-600 border-blue-200", badge: "Ages 6-10" },
        { title: "Lower Secondary (6-8)", key: "lower_secondary", icon: <Calculator className="w-7 h-7" />, desc: "Analytical and creative skill development", color: "bg-green-50 text-green-600 border-green-200", badge: "Ages 11-13" },
        { title: "Secondary (9-10)", key: "secondary", icon: <MonitorPlay className="w-7 h-7" />, desc: "SEE preparation with 100% pass rate track record", color: "bg-purple-50 text-purple-600 border-purple-200", badge: "SEE" },
    ];

    const plusTwoStreams = [
        { title: "Management", key: "management", icon: <Briefcase className="w-10 h-10" />, desc: "Accounting, Economics, Business Studies with specializations", image: "/gallery1.jpg" },
        { title: "Computer Science", key: "computer_science", icon: <Code className="w-10 h-10" />, desc: "Programming, Database Management, IT Applications", image: "/gallery4.jpg" },
        { title: "Hotel Management", key: "hotel_management", icon: <Coffee className="w-10 h-10" />, desc: "Hospitality, Tourism, Customer Service, Event Planning", image: "/gallery2.jpg" },
        { title: "Finance", key: "finance", icon: <Building2 className="w-10 h-10" />, desc: "Banking, Investment, Budgeting & Financial Systems", image: "/gallery3.jpg" },
        { title: "Education", key: "education", icon: <GraduationCap className="w-10 h-10" />, desc: "Pedagogy, Teaching Methods, Child Development", image: "/gallery5.jpg" },
    ];

    const getSubjectsForProgram = (key) => subjects.filter(s => s.program === key);

    const openProgramDetail = (key) => {
        setSelectedProgram(key);
        setActiveTab('subjects');
    };

    const tabs = [
        { key: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
        { key: 'syllabus', label: 'Syllabus', icon: <FileText className="w-4 h-4" /> },
        { key: 'fees', label: 'Fee Structure', icon: <IndianRupee className="w-4 h-4" /> },
        { key: 'admission', label: 'Admission', icon: <ClipboardList className="w-4 h-4" /> },
    ];

    const renderProgramDetail = () => {
        if (!selectedProgram || !programDetails[selectedProgram]) return null;
        const pd = programDetails[selectedProgram];
        const dbSubjects = getSubjectsForProgram(selectedProgram);

        return (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedProgram(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className={`relative bg-gradient-to-r ${pd.color} px-6 py-6`}>
                        <button onClick={() => setSelectedProgram(null)} className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl md:text-2xl font-bold text-white font-serif pr-10">{pd.title}</h3>
                        <p className="text-white/80 text-sm mt-1">{pd.tagline}</p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {[
                                { label: "Age", value: pd.age },
                                { label: "Duration", value: pd.duration },
                                { label: "Classes", value: pd.classes },
                            ].map((info, i) => (
                                <div key={i} className="bg-white/15 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-white">
                                    <span className="font-medium text-white/70">{info.label}: </span>
                                    <span className="font-bold">{info.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 px-4 bg-gray-50">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 14rem)' }}>
                        {/* Subjects Tab */}
                        {activeTab === 'subjects' && (
                            <div className="animate-fade-in">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" /> Subjects Offered
                                </h4>

                                {/* Database subjects (admin-managed) */}
                                {dbSubjects.length > 0 && (
                                    <div className="mb-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {dbSubjects.map((s, i) => (
                                                <div key={s.id || i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                                    <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{s.subject_name}</p>
                                                        {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Default subjects if no DB subjects */}
                                {dbSubjects.length === 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {pd.defaultSubjects.map((subj, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                                <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm font-medium text-gray-800">{subj}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Features */}
                                {pd.features && (
                                    <div className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-4">
                                        <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 text-accent-dark" /> Program Highlights
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {pd.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Syllabus Tab */}
                        {activeTab === 'syllabus' && (
                            <div className="animate-fade-in">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> Curriculum & Syllabus Overview
                                </h4>
                                <div className="space-y-3 mb-6">
                                    {pd.syllabus.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                                            <p className="text-sm text-gray-700 pt-1.5">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Syllabus from DB subjects with descriptions */}
                                {dbSubjects.filter(s => s.description).length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Subject-wise Syllabus Details</h5>
                                        <div className="space-y-2.5">
                                            {dbSubjects.filter(s => s.description).map((s, i) => (
                                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                                                    <h6 className="text-sm font-bold text-gray-900 mb-1">{s.subject_name}</h6>
                                                    <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-800">Detailed Syllabus</p>
                                        <p className="text-xs text-blue-600 mt-0.5">For complete syllabus booklets, contact the admission office or call us at <strong>9857078448</strong>.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fees Tab */}
                        {activeTab === 'fees' && (
                            <div className="animate-fade-in">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4 text-primary" /> Fee Structure (NRs.)
                                </h4>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { label: "Monthly Tuition", value: pd.fee.monthly, highlight: true },
                                        { label: "Admission Fee", value: pd.fee.admission, sub: "One-time" },
                                        { label: "Annual Fee", value: pd.fee.annual, sub: "Yearly" },
                                        { label: "Exam Fee", value: pd.fee.exam, sub: "Per term" },
                                    ].map((item, i) => (
                                        <div key={i} className={`rounded-xl p-4 border ${item.highlight ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-100'}`}>
                                            <p className="text-xs text-gray-500 font-medium mb-1">{item.label}</p>
                                            <p className={`text-lg font-bold ${item.highlight ? 'text-primary' : 'text-gray-900'}`}>NRs. {item.value}</p>
                                            {item.sub && <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>}
                                        </div>
                                    ))}
                                </div>

                                {/* Additional fees note */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Additional Optional Fees</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            { name: "Hostel", amount: "NRs. 4,500/month" },
                                            { name: "Transportation", amount: "NRs. 2,000-3,500/month" },
                                            { name: "Computer Lab", amount: "NRs. 2,000/year" },
                                            { name: "Science Lab", amount: "NRs. 2,500/year" },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                                                <span className="text-gray-600">{f.name}</span>
                                                <span className="font-semibold text-gray-800">{f.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <a href="#fees" onClick={() => setSelectedProgram(null)} className="text-primary text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                                    View Complete Fee Structure <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        )}

                        {/* Admission Tab */}
                        {activeTab === 'admission' && (
                            <div className="animate-fade-in">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary" /> Admission Requirements
                                </h4>
                                <div className="space-y-2.5 mb-6">
                                    {pd.admissionReq.map((req, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700">{req}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
                                    <h5 className="text-sm font-bold text-gray-800 mb-3">Admission Process</h5>
                                    <div className="space-y-3">
                                        {[
                                            { step: 1, text: "Visit campus or call for inquiry" },
                                            { step: 2, text: "Fill admission form & submit documents" },
                                            { step: 3, text: "Appear for entrance assessment" },
                                            { step: 4, text: "Pay fees & collect uniform — Welcome!" },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                                                <p className="text-sm text-gray-700">{s.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                    <a href="#admissions" onClick={() => setSelectedProgram(null)} className="btn-primary text-center text-sm py-2.5 flex-1 flex items-center justify-center gap-1.5">
                                        <School className="w-4 h-4" /> Full Admission Details
                                    </a>
                                    <a href="https://wa.me/9779857078448?text=Hello!%20I%20want%20admission%20info%20for%20" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white py-2.5 text-sm font-semibold rounded text-center flex-1 flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wide">
                                        <Users className="w-4 h-4" /> WhatsApp
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="programs" className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="section-title">Academic Programs</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">NEB-affiliated comprehensive education from early childhood to Higher Secondary (+2) specialization. Click any program to explore subjects, syllabus, fees & admission.</p>
                </div>

                {/* School Levels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
                    {schoolLevels.map((level, idx) => {
                        const ps = getSubjectsForProgram(level.key);
                        const pd = programDetails[level.key];
                        const subjectCount = ps.length > 0 ? ps.length : (pd?.defaultSubjects?.length || 0);
                        return (
                            <div key={idx} onClick={() => openProgramDetail(level.key)}
                                className={`p-6 rounded-xl border ${level.color} text-center hover:shadow-xl transition-all hover:-translate-y-1 duration-300 cursor-pointer relative group`}>
                                {/* Badge */}
                                <div className="absolute top-3 right-3 text-[10px] font-bold bg-white/80 backdrop-blur px-2 py-0.5 rounded-full text-gray-600 border border-gray-200">
                                    {level.badge}
                                </div>
                                <div className="mx-auto mb-4">{level.icon}</div>
                                <h4 className="text-base font-bold text-gray-900 mb-2">{level.title}</h4>
                                <p className="text-xs text-gray-500 mb-3">{level.desc}</p>
                                <div className="flex items-center justify-center gap-3 text-[11px] font-semibold">
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <BookOpen className="w-3 h-3" /> {subjectCount} subjects
                                    </span>
                                    <span className="text-primary group-hover:gap-1.5 flex items-center gap-0.5 transition-all">
                                        Explore <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* +2 Programs */}
                <div className="bg-primary rounded-xl p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">Higher Secondary (+2)</h3>
                        <p className="text-white/70 text-sm">NEB Affiliated — Specialized career paths for bright futures. Click to view subjects, syllabus, fees & admission.</p>
                        <div className="w-16 h-1 bg-accent mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plusTwoStreams.map((stream, idx) => {
                            const ps = getSubjectsForProgram(stream.key);
                            const pd = programDetails[stream.key];
                            const subjectCount = ps.length > 0 ? ps.length : (pd?.defaultSubjects?.length || 0);
                            return (
                                <div key={idx} onClick={() => openProgramDetail(stream.key)}
                                    className="bg-white rounded-lg overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer">
                                    <div className="relative h-40 overflow-hidden">
                                        <img src={stream.image} alt={stream.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-4 text-white">{stream.icon}</div>
                                        <div className="absolute top-3 right-3 bg-accent text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                            NRs. {pd?.fee?.monthly}/mo
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h4 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-primary transition-colors">{stream.title}</h4>
                                        <p className="text-sm text-gray-500 mb-3">{stream.desc}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> {subjectCount} subjects
                                            </span>
                                            <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                                View Details <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Program Detail Modal */}
            {renderProgramDetail()}
        </section>
    );
};

export default Programs;
