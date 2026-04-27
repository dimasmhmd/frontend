// frontend/src/components/Layout.jsx
import React, { useState, useEffect } from 'react';

export const Layout = ({ children, activeTab, setActiveTab, onDownloadReport, user, onLogout, onOpenManageUser, onOpenChat }) => {
  // STATE: Real-time Date Time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update setiap 1 menit
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  }).replace(/\./g, ':');

  const menuItems = [
    { id: 'dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
    ), label: 'Dashboard', desc: 'Pantau performa penjualan dan dapatkan insight berbasis data.' },
    { id: 'analytics', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
    ), label: 'Sales Analytics', desc: 'Breakdown penjualan berdasarkan Region, Produk, dan Customer' },
    { id: 'forecast', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
    ), label: 'AI Forecasting', desc: 'Prediksi penjualan masa depan dengan teknologi AI' },
    { id: 'data', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
    ), label: 'Data Management', desc: 'Kelola dan analisis data penjualan' }
  ];

  const currentTab = menuItems.find(item => item.id === activeTab);

  return (
    // FIX: h-screen dan overflow-hidden mengunci layar agar layout utamanya tetap stabil
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <img className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" src="/icon-data-ai.png" alt="Logo" />
          {/* <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">D</div> */}
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">Data & AI <span className="text-blue-600">Solution</span></h1>
            <p className="text-[9px] text-slate-500 mt-1">Sistem Prediksi Penjualan</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* AI Assistant Banner */}
        <div className="p-4 mx-4 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mx-auto shadow-sm mb-2">🤖</div>
          <p className="text-xs font-bold text-indigo-900 mb-1">Butuh Bantuan?</p>
          <p className="text-[10px] text-indigo-700/80 mb-3 leading-tight">Tanya AI Assistant untuk mendapatkan insight penjualan.</p>
          <button 
            onClick={onOpenChat} 
            className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors"
            >CHAT AI ASSISTANT
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400">
          © {new Date().getFullYear()} Data & AI Solution v1.0.0
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        
        {/* HEADER TOPBAR */}
        <header className="h-20 shrink-0 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-50">
          <div>
            {/* <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2> */}
            {/* <p className="text-xs text-slate-500 mt-1">Pantau performa penjualan dan dapatkan insight berbasis data.</p> */}
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{currentTab?.label||activeTab.replace('-', ' ')}</h2>
            <p className="text-xs text-slate-500 mt-1">{currentTab?.desc||activeTab.replace('-', ' ')}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Last updated: {formattedDate}
            </span>
            <button onClick={onDownloadReport} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Report
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            
            {/* HOVER USER PROFILE */}
            <div className="flex items-center gap-3 cursor-pointer group relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm z-10">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-xs pr-2">
                <p className="font-bold text-slate-900 leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-slate-500">{user?.role || 'Admin'}</p>
              </div>

              {/* Dropdown Hover untuk Manage User & Logout */}
              <div className="absolute top-full right-0 mt-3 w-44 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-1.5 flex flex-col gap-1">
                  {/* TOMBOL MANAGE USER (Tepat di atas Logout) */}
                  <button onClick={onOpenManageUser} className="w-full text-left px-3 py-2.5 text-xs text-slate-700 font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Manage User
                  </button>
                  
                  {/* Pembatas Garis Tipis */}
                  <div className="h-px bg-slate-100 my-0.5"></div>

                  {/* TOMBOL LOGOUT */}
                  <button onClick={onLogout} className="w-full text-left px-3 py-2.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Logout
                   </button>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT WRAPPER */}
        {/* FIX: Dashboard terkunci min-h-0 (fit to screen), menu lainnya overflow-y-auto (bisa scroll vertikal) */}
        <main className={`w-full p-6 flex flex-col bg-slate-50/50 ${activeTab === 'dashboard' ? 'flex-1 min-h-0 overflow-hidden' : 'flex-1 overflow-y-auto'}`}>
          {children}
        </main>

      </div>
    </div>
  );
};