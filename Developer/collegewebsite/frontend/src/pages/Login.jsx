import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, GraduationCap, Users, UserCheck, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotices } from '../api';

const ROLES = [
    {
        id: 'STUDENT',
        label: 'Student',
        color: 'border-blue-400',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hoverBg: 'hover:bg-blue-100',
        btnBg: 'bg-blue-500 hover:bg-blue-600',
        icon: GraduationCap,
        emoji: '🎓',
        demoEmail: 'aarav.sharma@sevenstar.edu.np',
        demoPass: 'password123',
    },
    {
        id: 'TEACHER',
        label: 'Teacher',
        color: 'border-green-400',
        bg: 'bg-green-50',
        text: 'text-green-600',
        hoverBg: 'hover:bg-green-100',
        btnBg: 'bg-green-500 hover:bg-green-600',
        icon: Users,
        emoji: '👨‍🏫',
        demoEmail: 'suman.adhikari@sevenstar.edu.np',
        demoPass: 'password123',
    },
    {
        id: 'PARENT',
        label: 'Parent',
        color: 'border-orange-400',
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hoverBg: 'hover:bg-orange-100',
        btnBg: 'bg-orange-500 hover:bg-orange-600',
        icon: UserCheck,
        emoji: '👪',
        demoEmail: 'hari.sharma@gmail.com',
        demoPass: 'password123',
    },
    {
        id: 'ADMIN',
        label: 'Admin',
        color: 'border-red-400',
        bg: 'bg-red-50',
        text: 'text-red-600',
        hoverBg: 'hover:bg-red-100',
        btnBg: 'bg-red-500 hover:bg-red-600',
        icon: Shield,
        emoji: '🛡️',
        demoEmail: 'admin@sevenstar.edu.np',
        demoPass: 'admin123',
    },
];

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [selectedRole, setSelectedRole] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [spotlightItems, setSpotlightItems] = useState([]);

    useEffect(() => {
        getNotices().then(res => {
            const notices = (res.notices || []).slice(0, 4).map(n => n.title);
            setSpotlightItems(notices.length > 0 ? notices : [
                'Welcome to Seven Star English Boarding School',
                'Login to access your dashboard',
            ]);
        }).catch(() => {
            setSpotlightItems(['Welcome to Seven Star English Boarding School']);
        });
    }, []);

    if (user) return <Navigate to="/dashboard" replace />;

    const role = ROLES.find(r => r.id === selectedRole);

    const handleSelectRole = (r) => {
        setSelectedRole(r.id);
        setEmail('');
        setPassword('');
        setError('');
    };

    const handleBack = () => {
        setSelectedRole(null);
        setEmail('');
        setPassword('');
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Invalid email or password');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Navbar */}
            <header className="bg-primary shadow-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-white/30 group-hover:border-white/60 transition-all" />
                        <div className="flex flex-col leading-tight">
                            <span className="font-bold text-lg text-white font-serif">Seven Star</span>
                            <span className="text-[11px] text-white/60 font-medium tracking-wide">English Boarding School</span>
                        </div>
                    </Link>
                    <Link to="/" className="text-white/70 hover:text-white text-sm font-medium transition-colors hidden sm:block">
                        ← Back to Website
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {!selectedRole ? (
                    /* ==================== STEP 1: Role Selection ==================== */
                    <div className="w-full max-w-3xl animate-fade-in-up">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">School Management Portal</h1>
                            <p className="text-gray-500 max-w-lg mx-auto">A digital initiative by Seven Star English Boarding School to access and manage Academics, Administration, and Student services at one common platform.</p>
                        </div>

                        {/* Role Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {ROLES.map((r) => {
                                const Icon = r.icon;
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => handleSelectRole(r)}
                                        className={`group bg-white rounded-2xl border-2 ${r.color} p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
                                    >
                                        <div className="text-4xl mb-1">{r.emoji}</div>
                                        <span className={`text-lg font-bold ${r.text}`}>{r.label}</span>
                                        <div className={`w-10 h-10 rounded-full ${r.bg} ${r.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <LogIn className="w-5 h-5" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Spotlight / Info */}
                        <div className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                                <span className="text-sm font-bold text-primary">Spotlight</span>
                                <Link to="/#notices" className="text-xs text-primary font-medium hover:underline">More ...</Link>
                            </div>
                            <div className="divide-y divide-gray-100 px-5">
                                {spotlightItems.map((item, i) => (
                                    <div key={i} className="py-3 flex items-start gap-2.5">
                                        <span className="text-amber-500 mt-0.5 text-sm">⚡</span>
                                        <span className="text-sm text-gray-700 font-medium leading-snug">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ==================== STEP 2: Login Form ==================== */
                    <div className="w-full max-w-md animate-fade-in-up">
                        {/* Back Button */}
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 font-medium text-sm transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Back to role selection
                        </button>

                        <div className={`bg-white rounded-3xl shadow-xl border-2 ${role.color} overflow-hidden`}>
                            {/* Role Header */}
                            <div className={`${role.bg} px-8 py-6 flex items-center gap-4 border-b ${role.color}`}>
                                <div className="text-5xl">{role.emoji}</div>
                                <div>
                                    <h2 className={`text-2xl font-bold ${role.text}`}>{role.label} Login</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Sign in to access your {role.label.toLowerCase()} dashboard</p>
                                </div>
                            </div>

                            {/* Login Form */}
                            <div className="p-8">
                                <form className="space-y-5" onSubmit={handleLogin}>
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-gray-50 focus:bg-white transition-all"
                                            placeholder="your.email@sevenstar.edu.np"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-gray-50 focus:bg-white transition-all"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full ${role.btnBg} text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-4 h-4" />
                                                Sign In as {role.label}
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Quick Demo */}
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <button
                                        onClick={() => { setEmail(role.demoEmail); setPassword(role.demoPass); }}
                                        className={`w-full py-2.5 rounded-xl text-xs font-semibold ${role.bg} ${role.text} ${role.hoverBg} transition-colors border border-transparent hover:border-current`}
                                    >
                                        ⚡ Use Demo {role.label} Credentials
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-center py-4">
                <p className="text-xs text-gray-400">Copyright © {new Date().getFullYear()} Seven Star English Boarding School, Nepalgunj.</p>
            </footer>
        </div>
    );
};

export default Login;
