'use client';
import React from 'react';
import Link from 'next/link';

export default function JobDetails() {
  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans p-8 flex justify-center">
      <div className="max-w-4xl w-full">
        
        {/* Back Link */}
        <Link href="/student" className="text-gray-400 hover:text-white mb-6 inline-flex items-center transition">
          ← Back to Dashboard
        </Link>

        {/* Job Header Card */}
        <div className="bg-[#1a1d27] p-8 rounded-2xl border border-gray-800 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Frontend Engineer</h1>
              <p className="text-lg text-blue-400 font-medium mb-4">TechNova • Remote</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#0f111a] border border-gray-700 text-sm rounded-full">React</span>
                <span className="px-3 py-1 bg-[#0f111a] border border-gray-700 text-sm rounded-full">TypeScript</span>
                <span className="px-3 py-1 bg-[#0f111a] border border-gray-700 text-sm rounded-full">Tailwind CSS</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-lg mb-4">
                <p className="text-emerald-400 font-bold">95% Match Score</p>
              </div>
              <br/>
              <Link href="/student/exam" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition">
                Apply & Start Assessment
              </Link>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">About the Role</h2>
            <p className="text-gray-400 leading-relaxed">
              We are looking for a passionate Frontend Engineer to join our core product team. You will be responsible for architecting and building out responsive, highly aesthetic user interfaces using React and Next.js. You will work closely with our designers to implement glassmorphism and modern design systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Why you are a match (AI Explanation)</h2>
            <ul className="list-disc list-inside text-emerald-400 space-y-2 bg-emerald-900/10 p-6 rounded-xl border border-emerald-500/20">
              <li><span className="text-gray-300">Your skills exactly match the required stack (React, TypeScript, Tailwind).</span></li>
              <li><span className="text-gray-300">Your academic GPA (8.5) is above the cutoff (7.0).</span></li>
              <li><span className="text-gray-300">You previously scored an 88 in Web Development assessments.</span></li>
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
}
