
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DocumentRecord, DocType } from '../types';

interface DashboardProps {
  documents: DocumentRecord[];
  onScanClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ documents, onScanClick }) => {
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    // Assume all 'completed' docs are ready to export
    const readyToExport = documents.filter(d => d.status === 'completed').length;
    
    // Calculate approximate storage (base64 length represents bytes roughly)
    const totalBytes = documents.reduce((acc, doc) => acc + (doc.fileData?.length || 0), 0);
    const storageUsedMb = (totalBytes / (1024 * 1024)).toFixed(2);

    // Group by Type for Pie Chart
    const typeDataMap = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(typeDataMap).map(([name, value]) => ({
      name,
      value
    }));

    // Recent 5 documents
    const recentDocs = [...documents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return { totalDocs, readyToExport, storageUsedMb, pieData, recentDocs };
  }, [documents]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']; // Blue shades

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-gray-500 mt-1">Here is what's happening with your documents today.</p>
        </div>
        <button 
          onClick={onScanClick}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Scan New Document
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Documents</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDocs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg mr-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ready to Export</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.readyToExport}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg mr-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Storage Used</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.storageUsedMb} <span className="text-lg font-medium text-gray-400">MB</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Recent Uploads</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stats.recentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-gray-400 text-sm">No recent documents</td>
                  </tr>
                ) : (
                  stats.recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">{doc.date}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{doc.vendor}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{doc.currency} {doc.amount.toFixed(2)}</td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          doc.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {doc.status === 'completed' ? 'Ready' : 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simplified Chart */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Composition</h3>
          <div className="flex-1 min-h-[250px] w-full relative">
            {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    cornerRadius={0}
                    stroke="none"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '8px 12px', backgroundColor: '#0f172a', color: 'white' }}
                    itemStyle={{ color: 'white', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
          <div className="text-center mt-4 text-xs font-medium text-gray-400">
            Breakdown by Document Type
          </div>
        </div>
      </div>
    </div>
  );
};
