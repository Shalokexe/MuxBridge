import React from 'react';

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
              System Admin & Mediator
            </h1>
            <p className="text-gray-400">Monitor platform health, moderate companies, and audit evaluations.</p>
          </div>
          <div className="flex space-x-3">
            <button className="text-sm px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg transition">
              Export Audit Logs
            </button>
            <button className="text-sm px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg transition shadow-lg">
              Seed Demo Data
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Students</h2>
            <p className="text-3xl font-bold text-white">2,845</p>
          </div>
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Active Companies</h2>
            <p className="text-3xl font-bold text-white">42</p>
          </div>
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Exams Conducted</h2>
            <p className="text-3xl font-bold text-white">1,204</p>
          </div>
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg border-l-4 border-l-red-500">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Proctoring Flags</h2>
            <p className="text-3xl font-bold text-red-400">18</p>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Moderation Queue */}
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Pending Company Approvals</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#0f111a] rounded-xl border border-gray-800">
                <div>
                  <h3 className="font-semibold text-emerald-100">Quantum Corp</h3>
                  <p className="text-sm text-gray-500">Requested to post: Cloud Architect</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-sm transition">Approve</button>
                  <button className="px-3 py-1 bg-gray-800 text-gray-400 hover:text-gray-300 rounded text-sm transition">Deny</button>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs (Anti-cheating) */}
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Proctoring Audit Ledger</h2>
            
            <div className="space-y-4">
              
              <div className="p-4 bg-[#0f111a] border-l-4 border-red-500 rounded-r-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-bold text-sm">Exam ID: ML-Engineer-01</span>
                  <span className="px-2 py-1 bg-red-900/40 text-red-300 text-xs rounded font-mono">Final Trust Score: 0%</span>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs bg-[#1a1d27] p-2 rounded">
                    <span className="text-red-400 font-semibold">MULTIPLE FACES DETECTED</span>
                    <span className="text-gray-500">Penalty: -30%</span>
                  </div>
                  <div className="flex justify-between text-xs bg-[#1a1d27] p-2 rounded">
                    <span className="text-orange-400 font-semibold">TAB SWITCH</span>
                    <span className="text-gray-500">Penalty: -15%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 font-semibold text-red-500">STATUS: AUTO-TERMINATED</p>
              </div>

              <div className="p-4 bg-[#0f111a] border-l-4 border-yellow-500 rounded-r-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-400 font-bold text-sm">Exam ID: Frontend-Dev-42</span>
                  <span className="px-2 py-1 bg-yellow-900/40 text-yellow-300 text-xs rounded font-mono">Final Trust Score: 65%</span>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs bg-[#1a1d27] p-2 rounded">
                    <span className="text-yellow-400 font-semibold">COPY_PASTE_ATTEMPT</span>
                    <span className="text-gray-500">Penalty: -10%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 font-semibold text-yellow-500">STATUS: FLAGGED FOR REVIEW</p>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
