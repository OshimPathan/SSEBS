import React, { useState, useEffect } from 'react';
import { CreditCard, History, AlertCircle, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentFees } from '../../api';

const StudentFees = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (user?.student_id) {
            getStudentFees(user.student_id).then(res => {
                setPending(res.pending || []);
                setHistory(res.history || []);
            }).catch(() => {});
        }
    }, [user?.student_id]);

    const totalPending = pending.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = history.reduce((sum, fee) => sum + fee.amount, 0);
    const overdueCount = pending.filter(f => f.status === 'OVERDUE').length;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Fee Details</h1>
                <p className="text-sm text-gray-500 mt-1">View your pending dues and payment history</p>
            </div>

            {/* Total Dues Banner */}
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
                    <CreditCard className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                    <p className="font-medium text-red-100 uppercase tracking-wider text-xs mb-1">Total Outstanding Dues</p>
                    <h2 className="text-2xl sm:text-4xl font-black mb-3">रू {totalPending.toLocaleString()}</h2>
                    <div className="flex flex-wrap gap-2">
                        {overdueCount > 0 && (
                            <span className="text-xs bg-white/20 border border-white/30 px-3 py-1 rounded-full font-medium">{overdueCount} overdue payment{overdueCount > 1 ? 's' : ''}</span>
                        )}
                        <span className="text-xs bg-white/20 border border-white/30 px-3 py-1 rounded-full font-medium">{pending.length} pending item{pending.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Pending', value: `रू ${totalPending.toLocaleString()}`, icon: Clock, color: 'bg-red-50 text-red-600' },
                    { label: 'Paid This Year', value: `रू ${totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Overdue', value: overdueCount, icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}><stat.icon className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-lg font-bold text-gray-900 truncate">{stat.value}</p>
                            <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    {[
                        { id: 'pending', label: `Pending Fees (${pending.length})`, icon: AlertCircle },
                        { id: 'history', label: `Payment History (${history.length})`, icon: History },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'pending' && (
                    <div className="divide-y divide-gray-50">
                        {pending.map(fee => (
                            <div key={fee.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fee.status === 'OVERDUE' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                        <IndianRupee className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{fee.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">Due: {fee.dueDate}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${fee.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{fee.status}</span>
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{fee.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-gray-900">रू {fee.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="divide-y divide-gray-50">
                        {history.map(fee => (
                            <div key={fee.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{fee.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">Paid: {fee.datePaid}</span>
                                            <span className="text-xs font-mono text-gray-400">{fee.receiptNo}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-600">रू {fee.amount.toLocaleString()}</p>
                                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">PAID</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFees;
