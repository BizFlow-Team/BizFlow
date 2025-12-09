'use client';

import React from 'react';
import { Users, Plus, History, Printer } from 'lucide-react';
import { CUSTOMERS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export const CustomerManager = () => {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">Tổng nợ phải thu</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(18000000)}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">Nợ đến hạn (Tháng này)</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">{formatCurrency(5000000)}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                     <div>
                        <p className="text-slate-500 text-sm">Khách hàng mới</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
                     </div>
                     <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Users size={24} /></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Danh sách khách hàng</h3>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        <Plus size={16} /> Thêm khách
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4">Địa chỉ/SĐT</th>
                                <th className="p-4 text-right">Tổng nợ</th>
                                <th className="p-4">Lần mua cuối</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {CUSTOMERS.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{c.name}</div>
                                        <div className="text-xs text-slate-400">Mã: KH{c.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-700">{c.address}</div>
                                        <div className="text-xs text-slate-500">{c.phone}</div>
                                    </td>
                                    <td className={`p-4 text-right font-bold ${c.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(c.debt)}
                                    </td>
                                    <td className="p-4 text-slate-600">{c.lastPurchase}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Chi tiết lịch sử">
                                                <History size={16} />
                                            </button>
                                            <button className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Thu nợ">
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};