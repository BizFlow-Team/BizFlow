'use client';

import React from 'react';
import { Search, Filter, Printer, Plus, MoreVertical } from 'lucide-react';
import { PRODUCTS } from '@/lib/constants';
import { formatCurrency, getStatusColor } from '@/lib/utils';

export const InventoryManager = () => {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý kho hàng</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm">
                        <Printer size={18} /> Xuất kho
                    </button>
                    <button className="flex-1 md:flex-none flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200">
                        <Plus size={18} /> Nhập hàng
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Tìm sản phẩm..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><Filter size={18} className="text-slate-600" /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Mã SP</th>
                                <th className="p-4">Tên sản phẩm</th>
                                <th className="p-4 text-center">Đơn vị</th>
                                <th className="p-4 text-right">Giá bán</th>
                                <th className="p-4 text-center">Tồn kho</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {PRODUCTS.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-500 font-mono">SP{p.id.toString().padStart(3, '0')}</td>
                                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                                    <td className="p-4 text-center text-slate-500">{p.unit}</td>
                                    <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(p.price)}</td>
                                    <td className="p-4 text-center font-bold">{p.stock}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(p.stock)}`}>
                                            {p.stock === 0 ? 'Hết hàng' : p.stock < 10 ? 'Sắp hết' : 'Còn hàng'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><MoreVertical size={16} /></button>
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