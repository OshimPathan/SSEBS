import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Globe, Phone, Mail, MapPin, User, Calendar, Building } from 'lucide-react';
import { getSiteSettings, updateSiteSettingsBulk } from '../../api';

const SETTING_GROUPS = [
    {
        title: 'School Information',
        icon: Building,
        fields: [
            { key: 'school_name', label: 'School Name', type: 'text', placeholder: 'Seven Star English Boarding School' },
            { key: 'tagline', label: 'Tagline / Slogan', type: 'text', placeholder: 'Nurturing Stars, Building Futures' },
            { key: 'established_year', label: 'Established Year', type: 'text', placeholder: '2006' },
            { key: 'current_session', label: 'Current Academic Session', type: 'text', placeholder: '2081/2082' },
            { key: 'principal_name', label: 'Principal Name', type: 'text', placeholder: 'Mr. Full Name' },
            { key: 'pan_number', label: 'PAN / Registration No.', type: 'text', placeholder: '' },
        ],
    },
    {
        title: 'Contact Details',
        icon: Phone,
        fields: [
            { key: 'phone', label: 'Primary Phone', type: 'tel', placeholder: '9857078448' },
            { key: 'phone_secondary', label: 'Secondary Phone', type: 'tel', placeholder: '9851206206' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'school@email.com' },
            { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '9779857078448' },
        ],
    },
    {
        title: 'Address',
        icon: MapPin,
        fields: [
            { key: 'address', label: 'Full Address', type: 'text', placeholder: 'Butwal-6, Rupandehi, Nepal' },
            { key: 'city', label: 'City', type: 'text', placeholder: 'Butwal' },
            { key: 'district', label: 'District', type: 'text', placeholder: 'Rupandehi' },
            { key: 'province', label: 'Province', type: 'text', placeholder: 'Lumbini Province' },
        ],
    },
    {
        title: 'Social Media & Links',
        icon: Globe,
        fields: [
            { key: 'facebook_url', label: 'Facebook Page URL', type: 'url', placeholder: 'https://facebook.com/...' },
            { key: 'youtube_url', label: 'YouTube Channel URL', type: 'url', placeholder: 'https://youtube.com/...' },
            { key: 'website_url', label: 'Official Website', type: 'url', placeholder: 'https://...' },
            { key: 'google_maps_url', label: 'Google Maps Embed URL', type: 'url', placeholder: 'https://maps.google.com/...' },
        ],
    },
    {
        title: 'Admission Settings',
        icon: User,
        fields: [
            { key: 'admission_open', label: 'Admissions Open?', type: 'select', options: ['true', 'false'] },
            { key: 'admission_deadline', label: 'Admission Deadline', type: 'date', placeholder: '' },
            { key: 'admission_notice', label: 'Admission Banner Text', type: 'text', placeholder: 'Admissions open for 2082!' },
        ],
    },
];

const AdminSettings = () => {
    const [settings, setSettings] = useState({});
    const [original, setOriginal] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSiteSettings();
            setSettings(data);
            setOriginal(data);
        } catch (e) { /* ignore */ }
        setLoading(false);
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Only save the changed settings
            const changed = {};
            Object.entries(settings).forEach(([k, v]) => {
                if (v !== original[k]) changed[k] = v;
            });
            // Also include new keys not in original
            SETTING_GROUPS.forEach(group => group.fields.forEach(field => {
                if (settings[field.key] && !original[field.key]) changed[field.key] = settings[field.key];
            }));
            if (Object.keys(changed).length > 0) {
                await updateSiteSettingsBulk(changed);
                setOriginal({ ...settings });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure school information, contact details and website settings</p>
                </div>
                <button onClick={handleSave} disabled={!hasChanges && !saving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all self-start ${saved ? 'bg-emerald-500' : hasChanges ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed'}`}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</>}
                </button>
            </div>

            {/* Settings Groups */}
            {SETTING_GROUPS.map((group, gi) => (
                <div key={gi} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <group.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">{group.title}</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {group.fields.map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select value={settings[field.key] || ''}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                                        {field.options.map(opt => <option key={opt} value={opt}>{opt === 'true' ? 'Yes' : opt === 'false' ? 'No' : opt}</option>)}
                                    </select>
                                ) : (
                                    <input type={field.type} value={settings[field.key] || ''}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Floating Save Bar when changed */}
            {hasChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-4 animate-fade-in-up">
                    <span className="text-sm font-medium">You have unsaved changes</span>
                    <button onClick={handleSave} className="px-4 py-1.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
                        {saving ? 'Saving...' : 'Save Now'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
