"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CortexDashboard() {

  // --- 1. STATE MANAGEMENT ---
  const [targetDate, setTargetDate] = useState("2022-01-01");
  const [aiSummary, setAiSummary] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [alarms, setAlarms] = useState<any[]>([]);
  
  // 🚀 FIXED: Replaced 'loading' with the variables your UI expects
  const [isScanning, setIsScanning] = useState(false); 
  const [isThinking, setIsThinking] = useState(false); 
  
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "procurement">("dashboard");

  const API_BASE = "http://127.0.0.1:8000";

  // --- 2. API FUNCTIONS ---
  const draftOrders = async () => {
    setIsScanning(true); // Matches your Scan button
    setAiSummary(""); 
    try {
      const res = await fetch(`${API_BASE}/api/generate_orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_date: targetDate }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setOrders(data.orders || []);
        setAlarms(data.alarms || []);
        if (data.alarms?.length > 0) setActiveTab("dashboard");
      } else {
        alert("Error generating orders: " + data.detail);
      }
    } catch (err) {
      alert("Failed to connect to backend engine.");
    }
    setIsScanning(false);
  };

  const askAgent = async () => {
    setIsThinking(true); // Matches your AI button
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_date: targetDate }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
      setActiveTab("procurement");
    } catch (err) {
      setAiSummary("⚠️ Live AI connection offline. Ensure backend is running.");
    }
    setIsThinking(false);
  };

  const syncToAWS = async () => {
    setSyncStatus("Syncing to DynamoDB...");
    try {
      const res = await fetch(`${API_BASE}/api/save_orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate, orders: orders }),
      });
      
      if (res.ok) {
        setSyncStatus("✅ Successfully synchronized to AWS Cloud.");
      } else {
        setSyncStatus("❌ Sync failed. Check AWS credentials.");
      }
    } catch (err) {
      setSyncStatus("❌ Network error during AWS sync.");
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  // --- 3. CSV EXPORT ---
  const downloadCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Store ID", "Product ID", "Current Stock", "Projected Demand", "Reorder Qty"];
    const csvRows = orders.map(order => 
      `${order.Store},${order.Product},${order.Inventory},${order.Demand},${order.Reorder_Qty}`
    );
    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Cortex_Manifest_${targetDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 4. AUTHENTICATION ---
  const handleLogout = () => {
    window.location.href = "http://localhost:3001";
  };

// --- 5. UI UPGRADE: SAFEGUARD FORMATTER ---
  const formatAiResponse = (text: any) => {
    if (Array.isArray(text)) text = text[0];
    if (text && typeof text === 'object') {
      text = text.text || text.content || JSON.stringify(text);
    }
    if (!text || typeof text !== 'string') return null;
    
    return text.split('\n').filter((line: string) => line.trim() !== '').map((line: string, idx: number) => {
      const cleanLine = line.replace(/[*#]/g, '').trim();
      if (cleanLine.length === 0) return null;

      // STYLE 1: Section Headers
      if (cleanLine.match(/^[0-9]\./) || cleanLine.includes("Predictive Action Plan")) {
        return (
          <h4 key={idx} className="font-bold text-blue-400 mt-5 mb-2 tracking-wide font-sans text-[15px] flex items-center gap-2">
            <span className="text-blue-500 mt-0.5">➤</span> {cleanLine}
          </h4>
        );
      }

      // STYLE 2: Bullet Points with the FontAwesome Circle-Dot!
      if (cleanLine.includes(":")) {
        const [boldPart, ...rest] = cleanLine.split(":");
        return (
          <p key={idx} className="mb-2 pl-4 text-slate-300 font-sans leading-relaxed flex items-start gap-3 text-sm transition-all hover:text-white">
            
            {/* Native FontAwesome Circle-Dot SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-3 h-3 mt-1 fill-emerald-500 shrink-0">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-352a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
            </svg>

            <span>
              <strong className="text-white font-semibold tracking-wide">{boldPart}:</strong> {rest.join(":")}
            </span>
          </p>
        );
      }

      // STYLE 3: Standard Paragraphs
      return (
        <p key={idx} className="mb-3 pl-8 text-slate-400 font-sans leading-relaxed text-sm">
          {cleanLine}
        </p>
      );
    });
  };

// --- 6. DYNAMIC CHART CALCULATIONS ---
  const totalDemand = orders.reduce((sum, order) => sum + order.Demand, 0);
  const avgDemand = orders.length > 0 ? (totalDemand / orders.length).toFixed(1) : "0";
  
  const sortedDemand = [...orders].map(o => o.Demand).sort((a, b) => a - b);
  const medianDemand = sortedDemand.length > 0 
    ? (sortedDemand.length % 2 !== 0 
        ? sortedDemand[Math.floor(sortedDemand.length / 2)] 
        : (sortedDemand[sortedDemand.length / 2 - 1] + sortedDemand[sortedDemand.length / 2]) / 2) 
    : 0;

  const maxVolume = orders.length > 0 ? Math.max(...orders.map(o => Math.max(o.Demand, o.Inventory))) : 100;
  
  const criticalCount = alarms.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alarms.filter(a => a.severity !== 'CRITICAL').length;
  // Add this new line:
  const totalThreats = alarms.length || 1;

  return (
    <div 
      className="min-h-screen text-slate-200 p-8 selection:bg-blue-500/30 bg-slate-950 cortex-font"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(2, 6, 23, 0.85), rgba(2, 6, 23, 0.95)), 
          url('https://media.licdn.com/dms/image/v2/D5612AQGfla95Z0mrpQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1721209681319?e=1783555200&v=beta&t=e-MJcR3sKf9s8EMFzvQ0oau_DFjlIc0bc4_uVgdHi64')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 relative z-10">
        
        {/* HEADER SECTION */}
        <header className="flex justify-between items-end border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Tata Steel <span className="text-blue-500">Cortex</span>
            </h1>
            <p className="text-sky-300/90 mt-2 text-[15px] font-semibold tracking-widest uppercase drop-shadow-md">
              Autonomous Supply Chain Intelligence
            </p>
          </div>
          <button onClick={handleLogout} className="text-sm font-semibold tracking-wide text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Terminate Session
          </button>
        </header>

        {/* MASTER CONTROLS BAR */}
        <div className="flex flex-wrap gap-4 items-center bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">System Date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="bg-slate-950/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm" />
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={draftOrders} disabled={isScanning || isThinking} className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(5,150,105,0.2)] border border-emerald-500/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              {isScanning ? "Scanning Data..." : "Scan & Draft Orders"}
            </button>
            
            <button 
              onClick={askAgent} 
              disabled={isScanning || isThinking || alarms.length === 0} 
              className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-blue-500/50"
              title={alarms.length === 0 ? "Run a scan first to detect threats" : ""}
            >
              {isThinking ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Predictive Action Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex space-x-2 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/60 w-fit">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === "dashboard" ? "bg-slate-800 text-white shadow-lg border border-slate-600/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Threat Intelligence
            {alarms.length > 0 && <span className="ml-1 bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] px-2 py-0.5 rounded-full">{alarms.length}</span>}
          </button>
          <button onClick={() => setActiveTab("procurement")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === "procurement" ? "bg-slate-800 text-white shadow-lg border border-slate-600/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Procurement Manifest
            {orders.length > 0 && <span className="ml-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-full">{orders.length}</span>}
          </button>
        </div>

        {/* VIEW 1: THREAT INTELLIGENCE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {alarms.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 border-dashed rounded-2xl text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="font-semibold text-slate-300 text-lg tracking-tight">System secure. No anomalies detected.</p>
                <p className="text-sm mt-1 font-medium">Initiate a system scan to monitor telemetry for {targetDate}.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]"></div>
                      Active Threat Telemetry
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-medium tracking-wide">Predictive algorithms have identified logistical bottlenecks.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {alarms.map((alarm, idx) => {
                    const isCritical = alarm.severity === 'CRITICAL';
                    return (
                      <div key={idx} className={`relative group overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${isCritical ? 'bg-slate-900/80 border-red-900/50 hover:border-red-500/50' : 'bg-slate-900/80 border-amber-900/50 hover:border-amber-500/50'}`}>
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                        <div className="p-6 relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold tracking-widest uppercase border ${isCritical ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{alarm.severity}</span>
                            <span className="text-slate-500 text-[11px] font-mono font-bold tracking-wider">#{idx + 1001}</span>
                          </div>
                          <p className="text-[15px] text-slate-200 leading-relaxed font-medium tracking-wide">{alarm.message}</p>
                        </div>
                        <div className={`h-1.5 w-full absolute bottom-0 left-0 ${isCritical ? 'bg-gradient-to-r from-red-600 to-red-900' : 'bg-gradient-to-r from-amber-500 to-amber-800'}`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PROCUREMENT & AI STRATEGY */}
        {activeTab === "procurement" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* AI ACTION PLAN SECTION */}
            {aiSummary ? (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                
                <div className="flex-1">
                  <h3 className="font-extrabold text-white mb-6 flex items-center gap-3 text-2xl tracking-tight">
                    Predictive Action Plan
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 font-mono tracking-widest uppercase">Generated By Cortex AI</span>
                  </h3>
                  <ul className="space-y-3">
                    {formatAiResponse(aiSummary)}
                  </ul>
                </div>

                <div className="w-full md:w-64 bg-slate-950/50 rounded-xl border border-slate-800 p-6 flex flex-col">
                  <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-5">Threat Distribution</h4>
                  <div className="flex-1 flex flex-col justify-center space-y-5">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-mono font-bold tracking-wider">
                        <span className="text-red-400">CRITICAL</span>
                        <span className="text-slate-200">{criticalCount}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${(criticalCount / totalThreats) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-mono font-bold tracking-wider">
                        <span className="text-amber-400">WARNING</span>
                        <span className="text-slate-200">{warningCount}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div className="bg-amber-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" style={{ width: `${(warningCount / totalThreats) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                     <span className="text-4xl font-extrabold text-white font-mono">{alarms.length}</span>
                     <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Total Anomalies</p>
                  </div>
                </div>
              </div>
            ) : (
               <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center text-slate-400 text-[15px] font-medium tracking-wide">
                 Click "Predictive Action Plan" to generate an automated executive summary.
               </div>
            )}

            {/* PROCUREMENT MANIFEST SECTION */}
            {orders.length > 0 && (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* DYNAMIC VOLUME OVERVIEW CHART WITH AXIS */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/60">
                   <div className="flex justify-between items-end mb-6">
                     <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Inventory vs Demand Volume (Top Items)</h4>
                     <div className="flex gap-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-400 rounded-[3px]"></div> Stock</span>
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-400 rounded-[3px]"></div> Demand</span>
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-400 rounded-[3px]"></div> Reorder</span>
                     </div>
                   </div>
                   
                   <div className="flex h-60 w-full mt-4">
                      {/* Y-Axis Labeling */}
                      <div className="flex flex-col justify-between text-[11px] text-slate-500 font-mono font-medium pb-7 pr-4 border-r border-slate-800/50 items-end w-14">
                          <span>{maxVolume}</span>
                          <span>{Math.round(maxVolume * 0.75)}</span>
                          <span>{Math.round(maxVolume * 0.5)}</span>
                          <span>{Math.round(maxVolume * 0.25)}</span>
                          <span>0</span>
                      </div>

                      {/* Chart Plot Area */}
                      <div className="flex-1 relative flex flex-col pl-4">
                         {/* Horizontal Grid Lines */}
                         <div className="absolute inset-0 pl-4 pb-7 flex flex-col justify-between pointer-events-none z-0">
                            <div className="w-full border-t border-slate-800/30"></div>
                            <div className="w-full border-t border-slate-800/30"></div>
                            <div className="w-full border-t border-slate-800/30"></div>
                            <div className="w-full border-t border-slate-800/30"></div>
                            <div className="w-full border-t border-slate-800/80"></div> 
                         </div>

                         {/* Dynamic Bars */}
                         <div className="flex-1 flex items-end gap-3 z-10 px-2">
                            {orders.map((order, idx) => {
                              const stockHeight = (order.Inventory / maxVolume) * 100;
                              const demandHeight = (order.Demand / maxVolume) * 100;
                              const reorderHeight = (order.Reorder_Qty / maxVolume) * 100;

                              return (
                                <div key={idx} className="flex-1 flex justify-center items-end gap-[2px] h-full relative group cursor-crosshair">
                                  <div className="w-1/3 bg-red-400/80 rounded-t-[3px] transition-all duration-300 group-hover:bg-red-400" style={{ height: `${stockHeight}%` }}></div>
                                  <div className="w-1/3 bg-blue-400/80 rounded-t-[3px] transition-all duration-300 group-hover:bg-blue-400" style={{ height: `${demandHeight}%` }}></div>
                                  <div className="w-1/3 bg-emerald-400/80 rounded-t-[3px] transition-all duration-300 group-hover:bg-emerald-400" style={{ height: `${reorderHeight}%` }}></div>

                                  {/* THE HOVER TOOLTIP OVERLAY */}
                                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl transition-opacity duration-200">
                                    <p className="font-extrabold border-b border-slate-700 pb-1 mb-1.5 text-xs tracking-wide">{order.Product}</p>
                                    <p className="font-mono text-[11px] text-slate-300 tracking-wider">
                                      <span className="text-red-400">S:{order.Inventory}</span> | <span className="text-blue-400">D:{order.Demand}</span> | <span className="text-emerald-400">R:{order.Reorder_Qty}</span>
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                         </div>

                         {/* X-Axis Labels */}
                         <div className="h-7 w-full flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium mt-2 z-10 px-2">
                            {orders.map((o, i) => <span key={i} className="flex-1 text-center truncate px-0.5">{o.Product.substring(0,5)}</span>)}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/40">
                  <h3 className="font-bold text-white text-lg tracking-tight">
                    Procurement Manifest
                  </h3>
                  <div className="flex items-center gap-4">
                    <button onClick={downloadCSV} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm px-4 py-2 rounded-lg font-bold tracking-wide transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Export CSV
                    </button>
                    
                    {syncStatus && (
                      <span className={`text-xs leading-snug font-bold px-3 text-right whitespace-pre-line tracking-wide ${syncStatus.includes('fail') || syncStatus.includes('error') ? 'text-red-400' : 'text-emerald-400'}`}>
                        {syncStatus}
                      </span>
                    )}

                    <button onClick={syncToAWS} className="flex items-center gap-2 bg-amber-600/90 hover:bg-amber-500 text-white text-sm px-5 py-2 rounded-lg font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] border border-amber-500/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                      Push to AWS Cloud
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-[15px] whitespace-nowrap">
                    <thead className="bg-slate-950/90 text-slate-400 sticky top-0 backdrop-blur-md z-20 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 font-bold tracking-widest uppercase text-[11px]">Store ID</th>
                        <th className="px-6 py-4 font-bold tracking-widest uppercase text-[11px]">Product ID</th>
                        <th className="px-6 py-4 font-bold tracking-widest uppercase text-[11px] text-right">Current Stock</th>
                        <th className="px-6 py-4 font-bold tracking-widest uppercase text-[11px] text-right">Demand</th>
                        <th className="px-6 py-4 font-bold tracking-widest uppercase text-[11px] text-right text-emerald-400">Reorder Qty</th>
                        <th className="px-6 py-4 font-bold tracking-widest uppercase text-[11px] w-64">Stock Health Projection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {orders.map((order, idx) => {
                        const totalProjected = order.Inventory + order.Reorder_Qty;
                        const invPercent = (order.Inventory / totalProjected) * 100;
                        const reorderPercent = (order.Reorder_Qty / totalProjected) * 100;

                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="px-6 py-4 font-mono font-medium text-slate-300 tracking-wide">{order.Store}</td>
                            <td className="px-6 py-4 font-mono font-medium text-slate-300 tracking-wide">{order.Product}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-red-400">{order.Inventory}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-200">{order.Demand}</td>
                            <td className="px-6 py-4 text-right font-mono font-extrabold text-emerald-400">+{order.Reorder_Qty}</td>
                            <td className="px-6 py-4">
                              <div className="w-full bg-slate-800 rounded-full h-2.5 flex overflow-hidden mb-2 shadow-inner">
                                <div className="bg-red-500 h-2.5 opacity-90 transition-all duration-1000" style={{ width: `${invPercent}%` }}></div>
                                <div className="bg-emerald-500 h-2.5 transition-all duration-1000" style={{ width: `${reorderPercent}%` }}></div>
                              </div>
                              <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">
                                <span>Deficit</span>
                                <span>Recovery</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* INJECTED GOOGLE FONTS & CUSTOM SCROLLBAR 
        'Plus Jakarta Sans' for ultra-modern UI elements.
        'JetBrains Mono' for precise, alignment-perfect data display.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .cortex-font {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace !important;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
      `}} />
    </div>
  );
}