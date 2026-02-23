import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Trash2, Eye, Edit2, GraduationCap, CheckCircle, AlertCircle, Loader2, Upload, Camera, FileText, User } from 'lucide-react';
import { getStudents, getClasses, createStudent, updateStudent, deleteStudent, uploadStudentPhoto, uploadStudentCertificate } from '../../api';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [certificateFile, setCertificateFile] = useState(null);
    const [certificatePreview, setCertificatePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const emptyForm = {
        name: '', email: '', password: '', class_id: '', roll_number: '',
        date_of_birth: '', blood_group: '', address: '', gender: '', nationality: 'Nepali', religion: '',
        parent_name: '', parent_phone: '', parent_email: '', mother_name: '', mother_phone: '', emergency_contact: '',
        create_parent_account: true,
        previous_school: '', previous_class: '', previous_marks: '', transfer_certificate: '',
        photo_url: '', certificate_url: '',
    };

    const [form, setForm] = useState(emptyForm);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchStudents = useCallback(async () => {
        try {
            const data = await getStudents({ search, classId: filterClass });
            setStudents(data.students || []);
        } catch (err) {
            showToast(err.message || 'Failed to fetch students', 'error');
        }
    }, [search, filterClass]);

    const fetchClasses = async () => {
        try {
            const data = await getClasses();
            setClasses(data.classes || []);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchStudents(), fetchClasses()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (!loading) fetchStudents();
    }, [search, filterClass]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingStudent(null);
        setCredentials(null);
        setPhotoFile(null);
        setPhotoPreview(null);
        setCertificateFile(null);
        setCertificatePreview(null);
        setActiveTab('personal');
    };

    const openAddModal = () => { resetForm(); setShowModal(true); };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setForm({
            name: student.name || '', email: student.email || '', password: '',
            class_id: student.class_id || '', roll_number: student.roll_number || '',
            date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
            blood_group: student.blood_group || '', address: student.address || '',
            gender: student.gender || '', nationality: student.nationality || 'Nepali', religion: student.religion || '',
            parent_name: student.parent_name || '', parent_phone: student.parent_phone || '',
            parent_email: student.parent_email || '', mother_name: student.mother_name || '',
            mother_phone: student.mother_phone || '', emergency_contact: student.emergency_contact || '',
            create_parent_account: false,
            previous_school: student.previous_school || '', previous_class: student.previous_class || '',
            previous_marks: student.previous_marks || '', transfer_certificate: student.transfer_certificate || '',
            photo_url: student.photo_url || '', certificate_url: student.certificate_url || '',
        });
        setPhotoPreview(student.photo_url || null);
        setCertificatePreview(student.certificate_url || null);
        setCredentials(null);
        setActiveTab('personal');
        setShowModal(true);
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Photo must be under 2MB', 'error'); return; }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleCertificateSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('Certificate must be under 5MB', 'error'); return; }
        setCertificateFile(file);
        setCertificatePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let photoUrl = form.photo_url;
            let certificateUrl = form.certificate_url;

            if (photoFile) {
                setUploading(true);
                const uploadData = await uploadStudentPhoto(photoFile);
                photoUrl = uploadData.url;
            }
            if (certificateFile) {
                setUploading(true);
                const uploadData = await uploadStudentCertificate(certificateFile);
                certificateUrl = uploadData.url;
            }
            setUploading(false);

            const submitForm = { ...form, photo_url: photoUrl, certificate_url: certificateUrl };

            if (editingStudent) {
                await updateStudent(editingStudent.id, submitForm);
                showToast('Student updated successfully');
                setShowModal(false); resetForm();
            } else {
                const data = await createStudent(submitForm);
                showToast('Student created successfully');
                if (data.credentials) {
                    setCredentials(data.credentials);
                } else {
                    setShowModal(false); resetForm();
                }
            }
            await fetchStudents();
        } catch (err) {
            showToast(err.error || err.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete ${name}? This removes their user account too.`)) return;
        try {
            await deleteStudent(id);
            showToast('Student deleted');
            await fetchStudents();
        } catch (err) {
            showToast(err.message || 'Failed to delete', 'error');
        }
    };

    const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    const formTabs = [
        { id: 'personal', label: 'Personal Info', icon: <User className="w-3.5 h-3.5" /> },
        { id: 'guardian', label: 'Guardian', icon: <GraduationCap className="w-3.5 h-3.5" /> },
        { id: 'academic', label: 'Academic History', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'documents', label: 'Documents', icon: <Upload className="w-3.5 h-3.5" /> },
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-sm text-gray-500 mt-1">{students.length} students enrolled</p>
                </div>
                <button onClick={openAddModal} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-4 h-4" /> New Admission
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, admission no, or email..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="">All Classes</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-3.5 px-5">Student</th>
                                <th className="py-3.5 px-5">Adm. No</th>
                                <th className="py-3.5 px-5">Class</th>
                                <th className="py-3.5 px-5 hidden lg:table-cell">Parent</th>
                                <th className="py-3.5 px-5 hidden md:table-cell">Contact</th>
                                <th className="py-3.5 px-5 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-3">
                                            {s.photo_url ? (
                                                <img src={s.photo_url} alt={s.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 text-sm font-mono text-gray-600">{s.admission_number}</td>
                                    <td className="py-3.5 px-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                                            {s.class_name} {s.section ? `(${s.section})` : ''}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 text-sm text-gray-600 hidden lg:table-cell">{s.parent_name}</td>
                                    <td className="py-3.5 px-5 text-sm text-gray-500 hidden md:table-cell">{s.parent_phone}</td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => setSelectedStudent(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEditModal(s)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan="6" className="py-12 text-center text-gray-400">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No students found</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Student Details</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-5 mb-2">
                                {selectedStudent.photo_url ? (
                                    <img src={selectedStudent.photo_url} alt={selectedStudent.name}
                                        className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                                        {selectedStudent.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 mt-1">
                                        {selectedStudent.class_name || 'N/A'} {selectedStudent.section ? `(${selectedStudent.section})` : ''}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    {[
                                        ['Admission No', selectedStudent.admission_number],
                                        ['Roll Number', selectedStudent.roll_number || 'N/A'],
                                        ['Gender', selectedStudent.gender || 'N/A'],
                                        ['Date of Birth', selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'],
                                        ['Blood Group', selectedStudent.blood_group || 'N/A'],
                                        ['Nationality', selectedStudent.nationality || 'N/A'],
                                        ['Religion', selectedStudent.religion || 'N/A'],
                                    ].map(([label, value], i) => (
                                        <div key={i}>
                                            <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">{label}</p>
                                            <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>
                                {selectedStudent.address && (
                                    <div className="mt-3">
                                        <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">Address</p>
                                        <p className="text-gray-800 font-semibold mt-0.5 text-sm">{selectedStudent.address}</p>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Guardian Information</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    {[
                                        ['Father/Guardian', selectedStudent.parent_name || 'N/A'],
                                        ['Father Phone', selectedStudent.parent_phone || 'N/A'],
                                        ['Father Email', selectedStudent.parent_email || 'N/A'],
                                        ['Mother Name', selectedStudent.mother_name || 'N/A'],
                                        ['Mother Phone', selectedStudent.mother_phone || 'N/A'],
                                        ['Emergency Contact', selectedStudent.emergency_contact || 'N/A'],
                                    ].map(([label, value], i) => (
                                        <div key={i}>
                                            <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">{label}</p>
                                            <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {(selectedStudent.previous_school || selectedStudent.previous_class || selectedStudent.previous_marks || selectedStudent.transfer_certificate) && (
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Previous Academic History</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {[
                                            ['Previous School', selectedStudent.previous_school],
                                            ['Previous Class', selectedStudent.previous_class],
                                            ['Previous Marks/GPA', selectedStudent.previous_marks],
                                            ['Transfer Certificate', selectedStudent.transfer_certificate],
                                        ].filter(([, v]) => v).map(([label, value], i) => (
                                            <div key={i}>
                                                <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">{label}</p>
                                                <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(selectedStudent.photo_url || selectedStudent.certificate_url) && (
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Uploaded Documents</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedStudent.photo_url && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1.5">Passport Photo</p>
                                                <img src={selectedStudent.photo_url} alt="Photo" className="w-24 h-28 rounded-xl object-cover border border-gray-200 shadow-sm" />
                                            </div>
                                        )}
                                        {selectedStudent.certificate_url && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1.5">Record Certificate</p>
                                                {selectedStudent.certificate_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                                                    <img src={selectedStudent.certificate_url} alt="Certificate"
                                                        className="w-40 h-28 rounded-xl object-cover border border-gray-200 shadow-sm cursor-pointer"
                                                        onClick={() => window.open(selectedStudent.certificate_url, '_blank')} />
                                                ) : (
                                                    <a href={selectedStudent.certificate_url} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-primary hover:bg-gray-100 transition-colors">
                                                        <FileText className="w-5 h-5" /> View Certificate
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {selectedStudent.parent_user_id && (
                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Parent has a login account linked
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editingStudent ? 'Edit Student' : 'New Student Admission'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{editingStudent ? 'Update student information' : 'Fill in all details to admit a new student'}</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>

                        {credentials && (
                            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Student Admitted Successfully!</h4>
                                <p className="text-sm text-green-700 mb-3">Login credentials have been created:</p>
                                <div className="space-y-2 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-green-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Student Login</p>
                                        <p>Email: <span className="font-mono font-bold">{credentials.student?.email}</span></p>
                                        <p>Password: <span className="font-mono font-bold">{credentials.student?.password}</span></p>
                                    </div>
                                    {credentials.parent && (
                                        <div className="bg-white p-3 rounded-lg border border-green-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase">Parent Login</p>
                                            <p>Email: <span className="font-mono font-bold">{credentials.parent?.email}</span></p>
                                            <p>Password: <span className="font-mono font-bold">{credentials.parent?.password}</span></p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="mt-3 w-full btn-primary py-2">Done</button>
                            </div>
                        )}

                        {!credentials && (
                            <form onSubmit={handleSubmit}>
                                {/* Tabs */}
                                <div className="flex border-b border-gray-100 px-6 pt-3 gap-1 overflow-x-auto">
                                    {formTabs.map(tab => (
                                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                                                activeTab === tab.id
                                                    ? 'border-primary text-primary bg-primary/5'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}>
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Tab: Personal Info */}
                                    {activeTab === 'personal' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>Full Name *</label>
                                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                    className={inputClass} placeholder="Student's full name as per records" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Email *</label>
                                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                                    className={inputClass} placeholder="student@sevenstar.edu.np" />
                                            </div>
                                            {!editingStudent && (
                                                <div>
                                                    <label className={labelClass}>Password</label>
                                                    <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                                        className={inputClass} placeholder="Default: student123" />
                                                </div>
                                            )}
                                            <div>
                                                <label className={labelClass}>Class *</label>
                                                <select required value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}
                                                    className={`${inputClass} bg-white`}>
                                                    <option value="">Select class</option>
                                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Roll Number</label>
                                                <input type="number" value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })}
                                                    className={inputClass} placeholder="1" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Gender *</label>
                                                <select required value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                                                    className={`${inputClass} bg-white`}>
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Date of Birth *</label>
                                                <input type="date" required value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                                                    className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Blood Group</label>
                                                <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}
                                                    className={`${inputClass} bg-white`}>
                                                    <option value="">Select</option>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Nationality</label>
                                                <input type="text" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })}
                                                    className={inputClass} placeholder="Nepali" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Religion</label>
                                                <select value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })}
                                                    className={`${inputClass} bg-white`}>
                                                    <option value="">Select</option>
                                                    {['Hindu', 'Buddhist', 'Muslim', 'Christian', 'Kirant', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>Address *</label>
                                                <input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                                    className={inputClass} placeholder="Full address (Ward, Municipality, District)" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: Guardian */}
                                    {activeTab === 'guardian' && (
                                        <div className="space-y-5">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Father / Guardian</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelClass}>Father/Guardian Name *</label>
                                                        <input type="text" required value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })}
                                                            className={inputClass} placeholder="Father or guardian's full name" />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Phone *</label>
                                                        <input type="tel" required value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })}
                                                            className={inputClass} placeholder="98XXXXXXXX" />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Email</label>
                                                        <input type="email" value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })}
                                                            className={inputClass} placeholder="father@email.com" />
                                                    </div>
                                                    {!editingStudent && (
                                                        <div className="flex items-end">
                                                            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                                                                <input type="checkbox" checked={form.create_parent_account} onChange={e => setForm({ ...form, create_parent_account: e.target.checked })}
                                                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                                                <span className="text-sm text-gray-700">Create parent login account</span>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-100 pt-5">
                                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Mother</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelClass}>Mother's Name</label>
                                                        <input type="text" value={form.mother_name} onChange={e => setForm({ ...form, mother_name: e.target.value })}
                                                            className={inputClass} placeholder="Mother's full name" />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Mother's Phone</label>
                                                        <input type="tel" value={form.mother_phone} onChange={e => setForm({ ...form, mother_phone: e.target.value })}
                                                            className={inputClass} placeholder="98XXXXXXXX" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-100 pt-5">
                                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Emergency</h4>
                                                <div>
                                                    <label className={labelClass}>Emergency Contact Number</label>
                                                    <input type="tel" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })}
                                                        className={inputClass} placeholder="Emergency phone number" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: Academic History */}
                                    {activeTab === 'academic' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-500 mb-2">Enter details about the student's previous school and academic record.</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>Previous School Name</label>
                                                    <input type="text" value={form.previous_school} onChange={e => setForm({ ...form, previous_school: e.target.value })}
                                                        className={inputClass} placeholder="Name of the previous school attended" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Previous Class / Grade</label>
                                                    <input type="text" value={form.previous_class} onChange={e => setForm({ ...form, previous_class: e.target.value })}
                                                        className={inputClass} placeholder="e.g. Class 8 / Grade 8" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Marks / GPA Obtained</label>
                                                    <input type="text" value={form.previous_marks} onChange={e => setForm({ ...form, previous_marks: e.target.value })}
                                                        className={inputClass} placeholder="e.g. 3.6 GPA or 85%" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>Transfer Certificate (TC) Number</label>
                                                    <input type="text" value={form.transfer_certificate} onChange={e => setForm({ ...form, transfer_certificate: e.target.value })}
                                                        className={inputClass} placeholder="TC number from previous school" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: Documents */}
                                    {activeTab === 'documents' && (
                                        <div className="space-y-6">
                                            <p className="text-sm text-gray-500 -mt-1">Upload the student's passport-size photograph and record/transfer certificate.</p>
                                            <div>
                                                <label className={labelClass}>Passport Size Photo</label>
                                                <p className="text-xs text-gray-400 mb-2">JPG/PNG, max 2MB</p>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-28 h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden shrink-0">
                                                        {photoPreview ? (
                                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                        ) : (
                                                            <>
                                                                <Camera className="w-8 h-8 text-gray-300 mb-1" />
                                                                <span className="text-xs text-gray-400">No photo</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/20 transition-colors">
                                                            <Upload className="w-4 h-4" />
                                                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                                                        </label>
                                                        {photoFile && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {photoFile.name}</p>}
                                                        {!photoFile && form.photo_url && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Photo already uploaded</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Record / Transfer Certificate</label>
                                                <p className="text-xs text-gray-400 mb-2">JPG/PNG/PDF, max 5MB</p>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-28 h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden shrink-0">
                                                        {certificatePreview && typeof certificatePreview === 'string' && (certificatePreview.startsWith('http') || certificatePreview.startsWith('blob:')) ? (
                                                            certificatePreview.match(/\.(jpg|jpeg|png|gif|webp)/i) || certificatePreview.startsWith('blob:') ? (
                                                                <img src={certificatePreview} alt="Certificate" className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <div className="text-center p-2"><FileText className="w-8 h-8 text-primary mx-auto mb-1" /><span className="text-xs text-gray-500">PDF</span></div>
                                                            )
                                                        ) : certificatePreview ? (
                                                            <div className="text-center p-2"><FileText className="w-8 h-8 text-primary mx-auto mb-1" /><span className="text-xs text-gray-500 truncate block max-w-[96px]">{certificatePreview}</span></div>
                                                        ) : (
                                                            <><FileText className="w-8 h-8 text-gray-300 mb-1" /><span className="text-xs text-gray-400">No file</span></>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                                                            <Upload className="w-4 h-4" />
                                                            {form.certificate_url || certificateFile ? 'Change Certificate' : 'Upload Certificate'}
                                                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCertificateSelect} />
                                                        </label>
                                                        {certificateFile && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {certificateFile.name}</p>}
                                                        {!certificateFile && form.certificate_url && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Certificate already uploaded</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                                        <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                        <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {uploading ? 'Uploading files...' : editingStudent ? 'Update Student' : 'Admit Student'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
