import React from 'react';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1a1d27]/80 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            MuxBridge
          </h1>
          <p className="text-gray-400 text-sm">Welcome back. Log in to continue.</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#0f111a] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-400">Password</label>
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition">Forgot password?</a>
            </div>
            <input 
              type="password" 
              className="w-full bg-[#0f111a] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              placeholder="••••••••" 
            />
          </div>

          <div className="pt-2">
            <Link 
              href="/student" 
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition duration-300"
            >
              Sign In
            </Link>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition">Sign up</a>
          </p>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/student" className="text-xs py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition border border-gray-700">
              Demo as Student
            </Link>
            <Link href="/company" className="text-xs py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition border border-gray-700">
              Demo as Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
