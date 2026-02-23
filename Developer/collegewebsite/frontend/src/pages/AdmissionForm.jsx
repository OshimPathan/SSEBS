import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap, User, Users, MapPin, BookOpen, Upload, Camera, CheckCircle, ArrowRight, ArrowLeft,
    Phone, Mail, Send, Loader2, AlertCircle, School, Heart, FileText, Star, ChevronRight, Home
} from 'lucide-react';
import { submitAdmissionApplication } from '../api';

const STEPS = [
    { id: 1, label: 'Personal Info', icon: User, short: 'Personal' },
    { id: 2, label: 'Parent / Guardian', icon: Users, short: 'Parents' },
    { id: 3, label: 'Address Details', icon: MapPin, short: 'Address' },
    { id: 4, label: 'Academic Background', icon: BookOpen, short: 'Academic' },
    { id: 5, label: 'Photo & Documents', icon: Camera, short: 'Photo' },
    { id: 6, label: 'Review & Submit', icon: CheckCircle, short: 'Review' },
];

const initialForm = {
    // Personal
    student_name: '', date_of_birth: '', gender: '', blood_group: '',
    nationality: 'Nepali', religion: '', mother_tongue: '',
    // Parent
    father_name: '', father_occupation: '', father_phone: '',
    mother_name: '', mother_occupation: '', mother_phone: '',
    parent_name: '', parent_phone: '', parent_email: '',
    guardian_relation: '', emergency_contact: '',
    // Address
    address: '', permanent_address: '',
    // Academic
    applied_for_class: '', previous_school: '', previous_class: '',
    previous_marks: '', previous_gpa: '', previous_year: '', tc_number: '',
    // Extra
    has_disability: '', remarks: '',
    // File
    photo: null,
};

const classOptions = [
    'Nursery', 'LKG', 'UKG',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    '+2 Science', '+2 Management', '+2 Hotel Management',
];

const InputField = ({ label, required, children, className = '' }) => (
    <div className={className}>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-colors';
const selectClass = inputClass;

const AdmissionForm = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [sameAddress, setSameAddress] = useState(false);
    const fileInputRef = useRef(null);

    const set = (field) => (e) => {
        const val = e.target ? e.target.value : e;
        setForm(prev => ({ ...prev, [field]: val }));
    };

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('Photo must be less than 5MB');
            return;
        }
        setForm(prev => ({ ...prev, photo: file }));
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
        setError('');
    };

    const handleSameAddress = (checked) => {
        setSameAddress(checked);
        if (checked) setForm(prev => ({ ...prev, permanent_address: prev.address }));
    };

    const canNext = () => {
        switch (step) {
            case 1: return form.student_name && form.date_of_birth && form.gender && form.applied_for_class;
            case 2: return form.parent_name && form.parent_phone;
            case 3: return form.address;
            case 4: return true; // optional
            case 5: return true; // photo optional
            default: return true;
        }
    };

    const next = () => { if (canNext() && step < 6) setStep(step + 1); };
    const prev = () => { if (step > 1) setStep(step - 1); };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            await submitAdmissionApplication(form);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Success Screen ───
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-10 text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif mb-3">Application Submitted Successfully!</h2>
                    <p className="text-sm text-gray-500 mb-2">Thank you for applying to <span className="font-semibold text-gray-700">Seven Star English Boarding School</span>.</p>
                    <p className="text-sm text-gray-500 mb-8">Our admission team will review your application and contact you within <strong>2-3 working days</strong>.</p>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-8">
                        <p className="text-xs text-gray-500 mb-1">What happens next?</p>
                        <ul className="text-sm text-gray-600 space-y-1.5 text-left">
                            <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> Application review by our admissions team</li>
                            <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> You'll receive a call/email for entrance assessment</li>
                            <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> Document verification at the campus</li>
                            <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span> Fee payment and admission confirmation</li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2 justify-center">
                            <Home className="w-4 h-4" /> Back to Home
                        </Link>
                        <button onClick={() => { setSuccess(false); setForm(initialForm); setPhotoPreview(null); setStep(1); }}
                            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5">
            {/* Top Bar */}
            <div className="bg-primary text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <School className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-wide">SEVEN STAR ENGLISH BOARDING SCHOOL</h1>
                            <p className="text-[10px] text-white/70">Devdaha, Rupandehi, Nepal</p>
                        </div>
                    </Link>
                    <Link to="/" className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" /> Home
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">Online Admission Form</h2>
                    <p className="text-sm text-gray-500 mt-2">Academic Session 2082 B.S. (2025/26)</p>
                </div>

                {/* Step Progress */}
                <div className="mb-10">
                    <div className="hidden sm:flex items-center justify-between max-w-3xl mx-auto mb-2">
                        {STEPS.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <button
                                    onClick={() => { if (s.id < step || canNext()) setStep(s.id); }}
                                    className={`flex flex-col items-center gap-1.5 group relative ${s.id <= step ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                        ${s.id < step ? 'bg-green-100 text-green-600' : s.id === step ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
                                        {s.id < step ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-[10px] font-semibold ${s.id === step ? 'text-primary' : s.id < step ? 'text-green-600' : 'text-gray-400'}`}>
                                        {s.short}
                                    </span>
                                </button>
                                {idx < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 rounded ${s.id < step ? 'bg-green-200' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    {/* Mobile step indicator */}
                    <div className="sm:hidden flex items-center justify-center gap-2 text-sm">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">Step {step} of 6</span>
                        <span className="text-gray-500 font-medium">{STEPS[step - 1].label}</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-3xl mx-auto">
                    {/* Step Header */}
                    <div className="bg-gray-50 border-b border-gray-100 px-6 sm:px-8 py-4 flex items-center gap-3">
                        {React.createElement(STEPS[step - 1].icon, { className: 'w-5 h-5 text-primary' })}
                        <div>
                            <h3 className="font-bold text-gray-900">{STEPS[step - 1].label}</h3>
                            <p className="text-xs text-gray-400">
                                {step === 1 && 'Basic details about the student'}
                                {step === 2 && 'Parent/Guardian contact information'}
                                {step === 3 && 'Current and permanent address'}
                                {step === 4 && 'Previous school and academic records'}
                                {step === 5 && 'Upload passport-size photograph'}
                                {step === 6 && 'Review all information before submitting'}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                            </div>
                        )}

                        {/* ── STEP 1: Personal Info ── */}
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in-up">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Student's Full Name" required className="sm:col-span-2">
                                        <input value={form.student_name} onChange={set('student_name')} placeholder="e.g., Aarav Sharma"
                                            className={inputClass} required />
                                    </InputField>

                                    <InputField label="Date of Birth" required>
                                        <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')}
                                            className={inputClass} required max={new Date().toISOString().split('T')[0]} />
                                    </InputField>

                                    <InputField label="Gender" required>
                                        <select value={form.gender} onChange={set('gender')} className={selectClass} required>
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </InputField>

                                    <InputField label="Applying For Class" required>
                                        <select value={form.applied_for_class} onChange={set('applied_for_class')} className={selectClass} required>
                                            <option value="">Select class</option>
                                            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </InputField>

                                    <InputField label="Blood Group">
                                        <select value={form.blood_group} onChange={set('blood_group')} className={selectClass}>
                                            <option value="">Select</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg =>
                                                <option key={bg} value={bg}>{bg}</option>
                                            )}
                                        </select>
                                    </InputField>

                                    <InputField label="Nationality">
                                        <input value={form.nationality} onChange={set('nationality')} placeholder="Nepali"
                                            className={inputClass} />
                                    </InputField>

                                    <InputField label="Religion">
                                        <select value={form.religion} onChange={set('religion')} className={selectClass}>
                                            <option value="">Select</option>
                                            {['Hindu', 'Buddhist', 'Islam', 'Christian', 'Kirat', 'Other'].map(r =>
                                                <option key={r} value={r}>{r}</option>
                                            )}
                                        </select>
                                    </InputField>

                                    <InputField label="Mother Tongue">
                                        <input value={form.mother_tongue} onChange={set('mother_tongue')} placeholder="e.g., Nepali, Maithili"
                                            className={inputClass} />
                                    </InputField>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Parent / Guardian ── */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Father */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">F</div>
                                        Father's Details
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <InputField label="Father's Name">
                                            <input value={form.father_name} onChange={set('father_name')} placeholder="Full name"
                                                className={inputClass} />
                                        </InputField>
                                        <InputField label="Occupation">
                                            <input value={form.father_occupation} onChange={set('father_occupation')} placeholder="e.g., Business, Teacher"
                                                className={inputClass} />
                                        </InputField>
                                        <InputField label="Phone Number">
                                            <input type="tel" value={form.father_phone} onChange={set('father_phone')} placeholder="98XXXXXXXX"
                                                className={inputClass} />
                                        </InputField>
                                    </div>
                                </div>

                                {/* Mother */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold">M</div>
                                        Mother's Details
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <InputField label="Mother's Name">
                                            <input value={form.mother_name} onChange={set('mother_name')} placeholder="Full name"
                                                className={inputClass} />
                                        </InputField>
                                        <InputField label="Occupation">
                                            <input value={form.mother_occupation} onChange={set('mother_occupation')} placeholder="e.g., Housewife, Nurse"
                                                className={inputClass} />
                                        </InputField>
                                        <InputField label="Phone Number">
                                            <input type="tel" value={form.mother_phone} onChange={set('mother_phone')} placeholder="98XXXXXXXX"
                                                className={inputClass} />
                                        </InputField>
                                    </div>
                                </div>

                                {/* Primary Contact */}
                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">✦</div>
                                        Primary Guardian / Contact Person <span className="text-red-500">*</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="Guardian Name" required>
                                            <input value={form.parent_name} onChange={set('parent_name')} placeholder="Name of primary contact"
                                                className={inputClass} required />
                                        </InputField>
                                        <InputField label="Relation to Student">
                                            <select value={form.guardian_relation} onChange={set('guardian_relation')} className={selectClass}>
                                                <option value="">Select relation</option>
                                                {['Father', 'Mother', 'Uncle', 'Aunt', 'Grandparent', 'Brother', 'Sister', 'Other'].map(r =>
                                                    <option key={r} value={r}>{r}</option>
                                                )}
                                            </select>
                                        </InputField>
                                        <InputField label="Contact Phone" required>
                                            <input type="tel" value={form.parent_phone} onChange={set('parent_phone')} placeholder="98XXXXXXXX"
                                                className={inputClass} required />
                                        </InputField>
                                        <InputField label="Email Address">
                                            <input type="email" value={form.parent_email} onChange={set('parent_email')} placeholder="email@example.com"
                                                className={inputClass} />
                                        </InputField>
                                        <InputField label="Emergency Contact Number">
                                            <input type="tel" value={form.emergency_contact} onChange={set('emergency_contact')} placeholder="Alternative phone number"
                                                className={inputClass} />
                                        </InputField>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Address ── */}
                        {step === 3 && (
                            <div className="space-y-5 animate-fade-in-up">
                                <InputField label="Current / Temporary Address" required>
                                    <textarea value={form.address} onChange={set('address')} rows={3}
                                        placeholder="e.g., Devdaha Municipality, Ward 5, Rupandehi, Lumbini Province"
                                        className={inputClass + ' resize-none'} required />
                                </InputField>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="sameAddr" checked={sameAddress}
                                        onChange={e => handleSameAddress(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                                    <label htmlFor="sameAddr" className="text-sm text-gray-600">
                                        Permanent address is same as current address
                                    </label>
                                </div>

                                <InputField label="Permanent Address">
                                    <textarea value={form.permanent_address} onChange={set('permanent_address')} rows={3}
                                        placeholder="If different from current address" disabled={sameAddress}
                                        className={inputClass + ' resize-none' + (sameAddress ? ' bg-gray-50 text-gray-400' : '')} />
                                </InputField>
                            </div>
                        )}

                        {/* ── STEP 4: Academic Background ── */}
                        {step === 4 && (
                            <div className="space-y-5 animate-fade-in-up">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-2">
                                    <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Fill in details of your previous school/class. This section is optional for Nursery/LKG/UKG applicants.</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Previous School Name" className="sm:col-span-2">
                                        <input value={form.previous_school} onChange={set('previous_school')}
                                            placeholder="Name of last school attended"
                                            className={inputClass} />
                                    </InputField>

                                    <InputField label="Last Class / Grade Completed">
                                        <input value={form.previous_class} onChange={set('previous_class')}
                                            placeholder="e.g., Class 8, SEE"
                                            className={inputClass} />
                                    </InputField>

                                    <InputField label="Year of Passing">
                                        <input value={form.previous_year} onChange={set('previous_year')}
                                            placeholder="e.g., 2081 B.S. / 2024"
                                            className={inputClass} />
                                    </InputField>

                                    <InputField label="GPA / Percentage Obtained">
                                        <input value={form.previous_gpa} onChange={set('previous_gpa')}
                                            placeholder="e.g., 3.60 GPA or 85%"
                                            className={inputClass} />
                                    </InputField>

                                    <InputField label="Transfer Certificate (TC) Number">
                                        <input value={form.tc_number} onChange={set('tc_number')}
                                            placeholder="TC/LC number if available"
                                            className={inputClass} />
                                    </InputField>
                                </div>

                                <InputField label="Previous Marks / Grade Details" className="mt-2">
                                    <textarea value={form.previous_marks} onChange={set('previous_marks')} rows={4}
                                        placeholder={"Subject-wise marks (optional):\nEnglish: 85\nMath: 90\nScience: 78\nSocial Studies: 82\n..."}
                                        className={inputClass + ' resize-none font-mono text-xs'} />
                                </InputField>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <InputField label="Any Disability / Special Needs">
                                        <input value={form.has_disability} onChange={set('has_disability')}
                                            placeholder="None / Describe if any"
                                            className={inputClass} />
                                    </InputField>

                                    <InputField label="Additional Remarks">
                                        <input value={form.remarks} onChange={set('remarks')}
                                            placeholder="Any additional information"
                                            className={inputClass} />
                                    </InputField>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 5: Photo Upload ── */}
                        {step === 5 && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-6">Upload a recent passport-size photograph of the student. File size should be less than 5MB.</p>

                                    <div className="flex flex-col items-center gap-6">
                                        {/* Photo Preview */}
                                        <div className={`w-40 h-48 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all
                                            ${photoPreview ? 'border-primary/30 bg-primary/5' : 'border-gray-300 bg-gray-50'}`}>
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-400">Passport Photo</p>
                                                    <p className="text-[10px] text-gray-300 mt-1">35mm × 45mm</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <div>
                                            <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp"
                                                onChange={handlePhoto} className="hidden" />
                                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                                                <Upload className="w-4 h-4" />
                                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                            </button>
                                            <p className="text-[10px] text-gray-400 mt-2">JPG, PNG or WebP — Max 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guidelines */}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-amber-800 mb-2">Photo Guidelines</h4>
                                    <ul className="text-xs text-amber-700 space-y-1.5">
                                        <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Recent passport-size photo with white background</li>
                                        <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Face should be clearly visible, front-facing</li>
                                        <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> No sunglasses, caps, or face coverings</li>
                                        <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Physical documents can be submitted at the school office</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 6: Review & Submit ── */}
                        {step === 6 && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Photo + Personal Summary */}
                                <div className="flex items-start gap-5">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Student" className="w-24 h-28 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0" />
                                    ) : (
                                        <div className="w-24 h-28 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                            <User className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{form.student_name || '—'}</h4>
                                        <p className="text-sm text-gray-500 mt-1">Applying for: <span className="font-semibold text-primary">{form.applied_for_class || '—'}</span></p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {form.gender && <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">{form.gender}</span>}
                                            {form.blood_group && <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">{form.blood_group}</span>}
                                            {form.nationality && <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">{form.nationality}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Review Sections */}
                                <ReviewSection title="Personal Information" icon={<User className="w-4 h-4" />} onEdit={() => setStep(1)}>
                                    <ReviewRow label="Full Name" value={form.student_name} />
                                    <ReviewRow label="Date of Birth" value={form.date_of_birth} />
                                    <ReviewRow label="Gender" value={form.gender} />
                                    <ReviewRow label="Blood Group" value={form.blood_group} />
                                    <ReviewRow label="Nationality" value={form.nationality} />
                                    <ReviewRow label="Religion" value={form.religion} />
                                    <ReviewRow label="Mother Tongue" value={form.mother_tongue} />
                                </ReviewSection>

                                <ReviewSection title="Parent / Guardian" icon={<Users className="w-4 h-4" />} onEdit={() => setStep(2)}>
                                    {form.father_name && <ReviewRow label="Father" value={`${form.father_name}${form.father_occupation ? ` (${form.father_occupation})` : ''}${form.father_phone ? ` — ${form.father_phone}` : ''}`} />}
                                    {form.mother_name && <ReviewRow label="Mother" value={`${form.mother_name}${form.mother_occupation ? ` (${form.mother_occupation})` : ''}${form.mother_phone ? ` — ${form.mother_phone}` : ''}`} />}
                                    <ReviewRow label="Primary Guardian" value={`${form.parent_name}${form.guardian_relation ? ` (${form.guardian_relation})` : ''}`} />
                                    <ReviewRow label="Phone" value={form.parent_phone} />
                                    <ReviewRow label="Email" value={form.parent_email} />
                                    {form.emergency_contact && <ReviewRow label="Emergency" value={form.emergency_contact} />}
                                </ReviewSection>

                                <ReviewSection title="Address" icon={<MapPin className="w-4 h-4" />} onEdit={() => setStep(3)}>
                                    <ReviewRow label="Current" value={form.address} />
                                    {form.permanent_address && form.permanent_address !== form.address && <ReviewRow label="Permanent" value={form.permanent_address} />}
                                </ReviewSection>

                                <ReviewSection title="Academic Background" icon={<BookOpen className="w-4 h-4" />} onEdit={() => setStep(4)}>
                                    <ReviewRow label="Applying For" value={form.applied_for_class} />
                                    <ReviewRow label="Previous School" value={form.previous_school} />
                                    <ReviewRow label="Last Class" value={form.previous_class} />
                                    <ReviewRow label="Year" value={form.previous_year} />
                                    <ReviewRow label="GPA / %" value={form.previous_gpa} />
                                    {form.previous_marks && <ReviewRow label="Marks Detail" value={form.previous_marks} pre />}
                                    {form.tc_number && <ReviewRow label="TC Number" value={form.tc_number} />}
                                    {form.has_disability && <ReviewRow label="Disability" value={form.has_disability} />}
                                    {form.remarks && <ReviewRow label="Remarks" value={form.remarks} />}
                                </ReviewSection>

                                {/* Declaration */}
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        By submitting this application, I declare that all the information provided above is true and correct to the best of my knowledge.
                                        I understand that any false information may lead to cancellation of admission. I agree to abide by the rules and regulations of
                                        Seven Star English Boarding School.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="border-t border-gray-100 px-6 sm:px-8 py-4 flex items-center justify-between bg-gray-50/50">
                        <button onClick={prev} disabled={step === 1}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
                                ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="text-xs text-gray-400">{step} of 6</div>

                        {step < 6 ? (
                            <button onClick={next} disabled={!canNext()}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                                    ${canNext() ? 'btn-primary shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={submitting}
                                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-50">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Note */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        Need help? Call <a href="tel:9779857078448" className="text-primary font-semibold hover:underline">9857078448</a> or
                        visit our campus at Devdaha, Rupandehi.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ── Review Components ──

const ReviewSection = ({ title, icon, onEdit, children }) => (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">{icon} {title}</h4>
            <button onClick={onEdit} className="text-xs text-primary font-semibold hover:underline">Edit</button>
        </div>
        <div className="px-5 py-3 divide-y divide-gray-50">{children}</div>
    </div>
);

const ReviewRow = ({ label, value, pre }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-1.5">
            <span className="text-xs text-gray-400 w-28 shrink-0 pt-0.5">{label}</span>
            {pre ? (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono flex-1">{value}</pre>
            ) : (
                <span className="text-sm text-gray-800 font-medium flex-1">{value}</span>
            )}
        </div>
    );
};

export default AdmissionForm;
