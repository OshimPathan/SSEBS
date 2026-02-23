import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, Edit2, Image, Upload, Star, StarOff, Loader2, AlertCircle, CheckCircle, Search, ImageOff, GripVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getGalleryPhotos, uploadGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } from '../../api';

const CATEGORIES = [
    { value: 'general', label: 'General' },
    { value: 'campus', label: 'Campus' },
    { value: 'events', label: 'Events' },
    { value: 'activities', label: 'Activities' },
    { value: 'sports', label: 'Sports' },
    { value: 'celebration', label: 'Celebrations' },
    { value: 'academic', label: 'Academic' },
];

const AdminGallery = () => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const [form, setForm] = useState({
        title: '', description: '', category: 'general', is_featured: false, file: null
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchPhotos = async () => {
        try {
            const data = await getGalleryPhotos();
            setPhotos(data);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPhotos(); }, []);

    const resetForm = () => {
        setForm({ title: '', description: '', category: 'general', is_featured: false, file: null });
        setPreviewFile(null);
        setEditingPhoto(null);
    };

    const openUpload = () => { resetForm(); setShowUploadModal(true); };

    const openEdit = (photo) => {
        setEditingPhoto(photo);
        setForm({
            title: photo.title || '',
            description: photo.description || '',
            category: photo.category || 'general',
            is_featured: photo.is_featured || false,
            file: null,
        });
        setPreviewFile(null);
        setShowUploadModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setForm({ ...form, file, title: form.title || file.name.replace(/\.[^.]+$/, '') });
        setPreviewFile(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            if (editingPhoto) {
                await updateGalleryPhoto(editingPhoto.id, {
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    is_featured: form.is_featured,
                });
                showToast('Photo updated');
            } else {
                if (!form.file) { showToast('Please select an image', 'error'); setUploading(false); return; }
                await uploadGalleryPhoto(form.file, {
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    is_featured: form.is_featured,
                    uploaded_by: user?.id,
                });
                showToast('Photo uploaded successfully');
            }
            setShowUploadModal(false);
            resetForm();
            await fetchPhotos();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (photo) => {
        if (!confirm(`Delete "${photo.title || 'this photo'}" permanently?`)) return;
        try {
            await deleteGalleryPhoto(photo.id);
            showToast('Photo deleted');
            await fetchPhotos();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const toggleFeatured = async (photo) => {
        try {
            await updateGalleryPhoto(photo.id, { is_featured: !photo.is_featured });
            await fetchPhotos();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const filtered = photos.filter(p => {
        if (filterCategory && p.category !== filterCategory) return false;
        if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

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
                    <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
                    <p className="text-sm text-gray-500 mt-1">{photos.length} photos • Upload and manage gallery images shown on homepage</p>
                </div>
                <button onClick={openUpload} className="btn-primary flex items-center gap-2 self-start">
                    <Upload className="w-4 h-4" /> Upload Photo
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search photos..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((photo) => (
                    <div key={photo.id} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-square relative overflow-hidden bg-gray-100">
                            <img
                                src={photo.image_url}
                                alt={photo.title || 'Gallery'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.target.src = '/banner.jpg'; }}
                            />
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={() => openEdit(photo)} className="p-2 bg-white/90 rounded-lg hover:bg-white text-gray-700 transition-colors" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(photo)} className="p-2 bg-white/90 rounded-lg hover:bg-white text-red-600 transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {/* Featured badge */}
                            {photo.is_featured && (
                                <div className="absolute top-2 left-2 bg-accent text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                    <Star className="w-3 h-3" /> Featured
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{photo.title || 'Untitled'}</p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium capitalize">{photo.category}</span>
                                </div>
                                <button onClick={() => toggleFeatured(photo)} className={`p-1 rounded transition-colors ${photo.is_featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'}`} title="Toggle featured">
                                    {photo.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                        <ImageOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No photos found</p>
                        <p className="text-sm mt-1">Upload photos to display on the homepage gallery</p>
                    </div>
                )}
            </div>

            {/* Upload/Edit Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowUploadModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editingPhoto ? 'Edit Photo' : 'Upload New Photo'}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{editingPhoto ? 'Update photo details' : 'Upload an image to the gallery'}</p>
                            </div>
                            <button onClick={() => { setShowUploadModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                            {/* File Upload */}
                            {!editingPhoto && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                                    <div
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewFile ? (
                                            <img src={previewFile} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Click to select an image</p>
                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                                            </>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </div>
                                </div>
                            )}
                            {editingPhoto && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <img src={editingPhoto.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                    <p className="text-sm text-gray-600">Editing photo details (image cannot be replaced)</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Photo title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Optional description" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                                        <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                        <span className="text-sm text-gray-700 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Featured photo</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowUploadModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={uploading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingPhoto ? 'Update' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
