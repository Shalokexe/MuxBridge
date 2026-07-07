import React from 'react';
import Link from 'next/link';

export default function KYSOnboarding() {
  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-[#1a1d27] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="p-10 relative z-10">
          <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Know Your Student (KYS)
          </h1>
          <p className="text-gray-400 mb-8">
            Complete your profile to unlock highly personalized job recommendations and AI-driven assessments.
          </p>

          <form className="space-y-8">
            {/* Academic Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-300 border-b border-gray-700 pb-2">Academic Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <input type="text" className="w-full bg-[#0f111a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">College/University</label>
                  <input type="text" className="w-full bg-[#0f111a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="MuxBridge Tech" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Degree & Specialization</label>
                  <input type="text" className="w-full bg-[#0f111a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="B.Tech Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current CGPA / GPA</label>
                  <input type="text" className="w-full bg-[#0f111a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="8.5" />
                </div>
              </div>
            </div>

            {/* Skills & Preferences */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-emerald-300 border-b border-gray-700 pb-2">Skills & Preferences</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Technical Skills (Comma separated)</label>
                  <input type="text" className="w-full bg-[#0f111a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition" placeholder="React, Node.js, Python, SQL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Domains</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {['AI/ML', 'Web Development', 'Data Analytics', 'Cybersecurity', 'Cloud/DevOps'].map((domain) => (
                      <label key={domain} className="flex items-center space-x-2 bg-[#0f111a] border border-gray-700 px-4 py-2 rounded-full cursor-pointer hover:border-emerald-500 transition">
                        <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-gray-800 border-gray-600" />
                        <span className="text-sm">{domain}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6">
              <Link href="/student" className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:-translate-y-1 transition duration-300">
                Save & Go to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
