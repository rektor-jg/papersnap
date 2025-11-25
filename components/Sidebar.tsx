import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { id: 'documents', label: 'Documents', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
    { id: 'chat', label: 'AI Assistant', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
    { id: 'trash', label: 'Trash', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    )},
  ];

  const handleNav = (view: ViewState) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  const baseClasses = "fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col";
  const mobileClasses = isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`${baseClasses} ${mobileClasses}`}>
        {/* Logo Section */}
        <div className="flex items-center h-24 px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-indigo-500/30 shadow-lg">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">PaperSnap</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          {/* Main Actions */}
          <div className="mb-8">
            <button
              onClick={() => handleNav('upload')}
              className="group flex items-center justify-center w-full px-4 py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-indigo-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Snap Document
            </button>
          </div>

          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Main Menu</p>
          
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as ViewState)}
              className={`group flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-50/80 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`transition-colors duration-200 ${currentView === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              {item.label}
              {currentView === item.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => handleNav('settings')}
              className={`group flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                currentView === 'settings'
                  ? 'bg-indigo-50/80 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`transition-colors duration-200 ${currentView === 'settings' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Settings
              {currentView === 'settings' && (
                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              )}
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-100">
          <button 
             onClick={() => handleNav('settings')}
             className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
              JD
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500 font-medium">Free Plan</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </aside>
    </>
  );
};