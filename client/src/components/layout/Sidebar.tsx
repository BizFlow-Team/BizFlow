'use client';

import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils'; 

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, isMobile, isOpen, setIsOpen, isCollapsed, toggleCollapse }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'pos', label: 'Bán hàng', icon: ShoppingCart },
    { id: 'products', label: 'Kho hàng', icon: Package },
    { id: 'customers', label: 'Sổ nợ & Khách', icon: Users },
    { id: 'reports', label: 'Báo cáo TT88', icon: FileText },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    if (isMobile) setIsOpen(false);
  };

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="p-4 flex items-center justify-between border-b border-slate-700">
             <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">B</div>
                <span className="text-xl font-bold">BizFlow</span>
             </div>
             <button onClick={() => setIsOpen(false)}><X size={24} /></button>
          </div>
          <div className="py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-6 py-4 transition-colors",
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={cn(
        "bg-slate-900 text-white flex-shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-700",
        isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className={cn("p-4 flex items-center border-b border-slate-700 h-16", isCollapsed ? 'justify-center' : 'justify-between')}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold">B</div>
            <span className="text-xl font-bold">BizFlow</span>
          </div>
        )}
        {isCollapsed && <div className="w-8 h-8 bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold">B</div>}
        <button onClick={toggleCollapse} className={cn("text-slate-400 hover:text-white", isCollapsed ? 'hidden' : 'block')}>
            <ChevronLeft size={20} />
        </button>
      </div>

      <div className="py-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            title={item.label}
            className={cn(
                "w-full flex items-center py-3 mb-1 transition-all",
                isCollapsed ? 'justify-center px-2' : 'space-x-3 px-6',
                activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <item.icon size={22} />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-700">
         {!isCollapsed ? (
             <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cửa hàng</div>
                <div className="font-semibold text-sm truncate">VLXD Bình An</div>
             </div>
         ) : (
             <button onClick={toggleCollapse} className="w-full flex justify-center text-slate-400 hover:text-white">
                 <ChevronRight size={20} />
             </button>
         )}
      </div>
    </div>
  );
};