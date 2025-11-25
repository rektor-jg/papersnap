
import React, { useState, useMemo } from 'react';
import { DocumentRecord } from '../types';

interface SettingsProps {
  categories: string[];
  setCategories: (categories: string[]) => void;
  documents: DocumentRecord[];
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => void;
  defaultTaxRate: number;
  setDefaultTaxRate: (rate: number) => void;
  ocrLanguage: string;
  setOcrLanguage: (lang: string) => void;
  enablePreprocessing: boolean;
  setEnablePreprocessing: (enable: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  categories, 
  setCategories,
  documents,
  defaultCurrency,
  setDefaultCurrency,
  defaultTaxRate,
  setDefaultTaxRate,
  ocrLanguage,
  setOcrLanguage,
  enablePreprocessing,
  setEnablePreprocessing
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Calculate approximate storage (mock: 1MB = 1%, max 100MB for free)
  const storagePercentage = useMemo(() => {
    const totalBytes = documents.reduce((acc, doc) => acc + (doc.fileData?.length || 0), 0);
    // Let's assume 100MB is the limit for the free tier for this visual
    const usedMB = totalBytes / (1024 * 1024);
    const maxMB = 100;
    const pct = Math.min((usedMB / maxMB) * 100, 100);
    return Math.round(pct);
  }, [documents]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      showSaveFeedback();
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Are you sure you want to remove "${cat}" from the default list?`)) {
      setCategories(categories.filter(c => c !== cat));
      showSaveFeedback();
    }
  };

  const showSaveFeedback = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultCurrency(e.target.value);
    showSaveFeedback();
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultTaxRate(Number(e.target.value));
    showSaveFeedback();
  };

  const handleOcrLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOcrLanguage(e.target.value);
    showSaveFeedback();
  };

  const togglePreprocessing = () => {
    setEnablePreprocessing(!enablePreprocessing);
    showSaveFeedback();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h2>
           <p className="text-gray-500 mt-1">Manage your preferences and application configuration.</p>
        </div>
        {isSaved && (
          <div className="flex items-center text-green-700 bg-green-50 px-3 py-1.5 rounded border border-green-200 animate-fade-in-up">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-bold">Changes Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="col-span-1 md:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-3xl font-bold mb-4 border-2 border-slate-100">
                GU
              </div>
              <h3 className="text-xl font-bold text-gray-900">Guest User</h3>
              <p className="text-sm text-gray-500 font-medium">guest@papersnap.local</p>
              <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wide">
                Free Plan
              </div>
              
              <div className="mt-8 w-full pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm mb-2">
                   <span className="text-gray-500">Storage Used</span>
                   <span className="font-bold text-gray-900">{storagePercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${storagePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings & Categories */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Preferences */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
               <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
               General Preferences
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Currency</label>
                  <select 
                    value={defaultCurrency}
                    onChange={handleCurrencyChange}
                    className="block w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PLN">PLN (zł)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Tax Rate (%)</label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="number"
                      value={defaultTaxRate}
                      onChange={handleTaxChange}
                      className="block w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          {/* OCR & Scanning Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
               <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
               OCR & Scanning
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">OCR Language</label>
                  <select 
                    value={ocrLanguage}
                    onChange={handleOcrLanguageChange}
                    className="block w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="pl">Polish</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Preferred language for text extraction.</p>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image Preprocessing</label>
                  <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Enhanced Mode</span>
                    <button 
                      onClick={togglePreprocessing}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enablePreprocessing ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enablePreprocessing ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Auto-enhance image contrast and clarity.</p>
               </div>
             </div>
          </div>

          {/* Categories Manager */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Expense Categories
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">Customize the categories used for document classification.</p>
                </div>
             </div>

             <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category..."
                  className="flex-1 rounded-lg border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button 
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
             </div>

             <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
               {categories.map((cat) => (
                 <span key={cat} className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 group hover:border-blue-200 hover:bg-blue-50 transition-colors">
                   {cat}
                   <button 
                    onClick={() => handleDeleteCategory(cat)}
                    className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                   >
                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </span>
               ))}
             </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 p-6 rounded-lg border border-red-100">
             <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
             <p className="text-sm text-red-600 mb-4">Once you delete your account data, there is no going back. Please be certain.</p>
             <button 
               onClick={() => {
                 if(confirm("This will clear your local database (LocalStorage). Are you sure?")) {
                    localStorage.clear();
                    window.location.reload();
                 }
               }}
               className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
             >
               Delete All Data
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
