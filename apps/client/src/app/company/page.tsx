import React from 'react';
import Link from 'next/link';

export default function CompanyDashboard() {
  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Recruiter Dashboard
            </h1>
            <p className="text-gray-400">Manage postings and view AI-ranked candidates.</p>
          </div>
          <button className="text-sm px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full transition shadow-lg">
            + Post New Job
          </button>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Active Jobs</h2>
            <p className="text-3xl font-bold text-white">4</p>
          </div>
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Applicants</h2>
            <p className="text-3xl font-bold text-white">142</p>
          </div>
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Evaluations Pending</h2>
            <p className="text-3xl font-bold text-yellow-400">18</p>
          </div>
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">AI Review Flags</h2>
            <p className="text-3xl font-bold text-red-400">3</p>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-[#1a1d27] rounded-2xl border border-gray-800 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="p-6 border-b border-gray-800 flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white">Candidate Leaderboard</h2>
              <p className="text-sm text-gray-400">Ranked by Composite Score (AI + Skills + Academics)</p>
            </div>
            <select className="bg-[#0f111a] border border-gray-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none">
              <option>Filter by Job: AI/ML Engineer</option>
              <option>Filter by Job: Frontend Engineer</option>
            </select>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-[#0f111a] text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Rank</th>
                  <th scope="col" className="px-6 py-4">Candidate</th>
                  <th scope="col" className="px-6 py-4">Composite Score</th>
                  <th scope="col" className="px-6 py-4">AI Fit Summary</th>
                  <th scope="col" className="px-6 py-4">Proctor Status</th>
                  <th scope="col" className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#1a1d27] border-b border-gray-800 hover:bg-[#222633] transition">
                  <td className="px-6 py-4 font-bold text-yellow-400">#1</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">Student Name 42</p>
                    <p className="text-xs text-gray-500">MuxBridge Tech • 9.2 CGPA</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full w-[95%]"></div>
                      </div>
                      <span className="text-emerald-400 font-bold">95</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs">Highly recommended. Exceptional performance in Python coding assessment and strong domain keywords used.</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">Clear</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-400 hover:text-purple-300 font-medium">Shortlist</button>
                  </td>
                </tr>
                
                <tr className="bg-[#1a1d27] border-b border-gray-800 hover:bg-[#222633] transition">
                  <td className="px-6 py-4 font-bold text-gray-300">#2</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">Student Name 17</p>
                    <p className="text-xs text-gray-500">Synthetic Univ • 8.8 CGPA</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full w-[89%]"></div>
                      </div>
                      <span className="text-emerald-400 font-bold">89</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs">Good match. Answers were somewhat brief but accurate. Lacks some advanced ML deployment terminology.</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">1 Warning</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-400 hover:text-purple-300 font-medium">Shortlist</button>
                  </td>
                </tr>

                <tr className="bg-[#1a1d27] border-b border-gray-800 hover:bg-[#222633] transition">
                  <td className="px-6 py-4 font-bold text-orange-400">#3</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">Student Name 88</p>
                    <p className="text-xs text-gray-500">Data Institute • 7.5 CGPA</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full w-[65%]"></div>
                      </div>
                      <span className="text-orange-400 font-bold">65</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-red-300">Requires Human Review. Subjective answers had low confidence score.</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">Clear</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-300 font-medium mr-3">Review</button>
                    <button className="text-red-400 hover:text-red-300 font-medium">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
