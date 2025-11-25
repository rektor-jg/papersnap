
import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  darkMode,
  toggleTheme
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { id: 'documents', label: 'Documents', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
    { id: 'folders', label: 'Folders', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
    )},
    { id: 'chat', label: 'AI Assistant', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
    { id: 'trash', label: 'Trash', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    )},
    { id: 'pricing', label: 'PRICING (dev)', icon: (
      <svg className="w-5 h-5 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
  ];

  const handleNav = (view: ViewState) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  const baseClasses = "fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col";
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
        <div className="flex items-center h-24 px-8 border-b border-transparent dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-500/20 shadow-lg">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">PaperSnap</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          {/* Main Actions */}
          <div className="mb-8">
            <button
              onClick={() => handleNav('upload')}
              className="group flex items-center justify-center w-full px-4 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all duration-200 ease-out shadow-blue-600/20 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Snap Document
            </button>
          </div>

          <p className="px-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Main Menu</p>
          
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as ViewState)}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <span className={`transition-colors duration-200 ${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              {item.label}
              {currentView === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => handleNav('settings')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentView === 'settings'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <span className={`transition-colors duration-200 ${currentView === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Settings
              {currentView === 'settings' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          </div>
        </nav>

        {/* Footer Actions & Profile */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 space-y-4">
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Theme</span>
            <button 
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200 dark:bg-slate-700"
            >
              <span className="sr-only">Use setting</span>
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}
              >
                <span
                  className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${darkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'}`}
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <span
                  className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${darkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'}`}
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </span>
              </span>
            </button>
          </div>

          <button 
             onClick={() => handleNav('settings')}
             className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-600">
              GU
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Guest User</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Free Plan</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </aside>
    </>
  );
};
