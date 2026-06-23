"use client";
import { useState } from "react";

export default function CortexLoginPortal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("Authenticating... Please wait.");
    
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://master.d3eu8k50qzo0ky.amplifyapp.com";

    try {
      // 1. RELATIVE PATH: Hits your secure Next.js proxy, bypassing browser Mixed Content blocks!
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      // 2. Grab the JSON response to extract the token your backend sent
      const data = await res.json(); 

      // Inside your handleLogin function
if (res.ok) {
  const data = await res.json(); // Get the response data
  // Pass the token as a URL parameter
  window.location.href = `${dashboardUrl}?token=${data.token}`; 
}  else {
        setError(data.message || "Unrecognized Operator ID or Passcode.");
      }
    } catch (err) {
      setError("Network Crash: Unable to reach the secure bridge.");
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-sans text-slate-200 selection:bg-blue-500/30"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.95)), 
          url('https://www.tata.com/content/dam/tata/images/verticals/desktop/peopletatasteel_banner_desktop_1920x1080.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* Sleek Glassmorphism Login Card */}
      <div className="w-full max-w-[420px] bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 p-10 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Subtle decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        {/* Branding Header */}
        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">
            Tata Steel <span className="text-blue-500">Cortex</span>
          </h1>
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
            Secure Access Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {/* Dark Mode Input: Username */}
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Operator ID</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all shadow-inner" 
              placeholder="e.g. admin"
              required
            />
          </div>

          {/* Dark Mode Input: Password */}
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all shadow-inner" 
              required
            />
          </div>

          {/* Upgraded Login Button */}
          <button 
            type="submit" 
            className="w-full bg-blue-600/90 hover:bg-blue-500 text-white py-3.5 rounded-lg text-sm font-bold transition-all mt-4 flex justify-between items-center px-5 shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-blue-500/50 group"
          >
            <span>Log in</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}