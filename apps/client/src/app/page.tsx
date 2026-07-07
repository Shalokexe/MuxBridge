import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center space-y-8">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome to MuxBridge
        </h1>
        <p className="text-xl text-gray-300">
          The intelligent platform connecting students, companies, and evaluators.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link href="/student" className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition border border-gray-700 hover:border-blue-500">
            <h2 className="text-2xl font-semibold mb-2">Student Portal</h2>
            <p className="text-gray-400">Take assessments and find your perfect job match.</p>
          </Link>
          
          <Link href="/company" className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition border border-gray-700 hover:border-purple-500">
            <h2 className="text-2xl font-semibold mb-2">Company Portal</h2>
            <p className="text-gray-400">Post jobs and view ranked candidate leaderboards.</p>
          </Link>
          
          <Link href="/admin" className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition border border-gray-700 hover:border-green-500">
            <h2 className="text-2xl font-semibold mb-2">Admin Portal</h2>
            <p className="text-gray-400">Manage the system, users, and evaluation rules.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
