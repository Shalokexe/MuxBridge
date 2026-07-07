'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/exams/start-demo', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          router.push(`/student/exam?attemptId=${data.id}`);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to contact demo API, redirecting to fallback exam URL:", e);
    }
    router.push('/student/exam?attemptId=demo-attempt-id');
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Welcome back, Student!
            </h1>
            <p className="text-gray-400">Here's your MuxBridge intelligence overview.</p>
          </div>
          <Link href="/student/kys" className="text-sm px-4 py-2 border border-gray-700 rounded-full hover:bg-gray-800 transition">
            Edit KYS Profile
          </Link>
        </header>

        {/* Top Grid - Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Profile</h2>
            <p className="text-xl font-semibold mb-1">Computer Science Major</p>
            <p className="text-gray-500 text-sm">Graduating 2025</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">React</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Node.js</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Python</span>
            </div>
          </div>

          {/* Academics Card */}
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl" />
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Academics</h2>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold text-emerald-400">8.5</span>
              <span className="text-gray-500 pb-1">/ 10 CGPA</span>
            </div>
            <p className="text-emerald-500 text-sm mt-2">↑ Top 15% of your batch</p>
          </div>

          {/* Assessment Card */}
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl" />
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Assessments</h2>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold text-purple-400">88</span>
              <span className="text-gray-500 pb-1">Avg Score</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">2 exams completed</p>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recommended Jobs */}
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-xl font-bold mb-6 text-white">Recommended Jobs</h2>
            <div className="space-y-4">
              
              {/* Job Item */}
              <div className="p-4 bg-[#0f111a] rounded-xl border border-gray-800 hover:border-blue-500 transition group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-100 group-hover:text-blue-400 transition">Frontend Engineer</h3>
                    <p className="text-gray-500 text-sm">TechNova • Remote</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-medium">95% Match</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  <span className="text-emerald-400">★ Explainability:</span> Recommended because you scored high in Web Dev basics, and possess React and Node.js skills.
                </p>
                <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition w-full md:w-auto">
                  Apply & Take Evaluation
                </button>
              </div>

              {/* Job Item */}
              <div className="p-4 bg-[#0f111a] rounded-xl border border-gray-800 hover:border-blue-500 transition group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-100 group-hover:text-blue-400 transition">Data Analyst Intern</h3>
                    <p className="text-gray-500 text-sm">DataSys • On-site</p>
                  </div>
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded font-medium">78% Match</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  <span className="text-yellow-400">★ Explainability:</span> Strong academic match, but missing advanced SQL assessments.
                </p>
                <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition w-full md:w-auto">
                  Apply & Take Evaluation
                </button>
              </div>

            </div>
          </div>

          {/* Active Applications & Exams */}
          <div className="space-y-8">
            <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Upcoming Evaluations</h2>
              <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-red-300 font-semibold">AI/ML Engineer Assessment</h3>
                    <p className="text-sm text-gray-400">Duration: 60 mins • AI Proctoring Enabled</p>
                  </div>
                  <button 
                    onClick={handleStartExam}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-400 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm px-4 py-2 rounded-lg transition shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    {loading ? "Initializing..." : "Start Now"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Application Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#0f111a] rounded-lg border border-gray-800">
                  <span className="text-gray-300">Software Developer @ InnovateInc</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Under AI Evaluation</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0f111a] rounded-lg border border-gray-800">
                  <span className="text-gray-300">Cloud Ops @ SecureNet</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Shortlisted</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
