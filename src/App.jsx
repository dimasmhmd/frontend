// frontend/src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Forecast } from './pages/Forecast';
import { DataManagement } from './pages/DataManagement';
import { Login } from './pages/Login';
import { ManageUserModal } from './components/ManageUserModal';
import { ChatAssistantModal } from './components/ChatAssistantModal';

function App() {
  const token = sessionStorage.getItem('sales_app_token');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [isManageUserModalOpen, setIsManageUserModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ products: [], customers: [], sales: [], fiscalYears: [] });
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedRegion, setSelectedRegion] = useState('Semua Region');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');

  // Mengembalikan fitur auto-login session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('sales_app_user');
    const savedToken = sessionStorage.getItem('sales_app_token');
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Hanya fetch jika sudah ter-autentikasi
    if (!isAuthenticated) return; 
    setLoading(true); 
    
    // Secara default, akan selalu mencoba fetch ke Backend Node.js Anda dengan membawa Token
    fetch(import.meta.env.VITE_API_URL + `/api/dashboard?year=All`, {
      headers: {
        'Authorization': `Bearer ${token}`, // <-- PENTING: Token JWT disisipkan di sini
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        // Handle jika token kadaluarsa atau tidak valid
        if (res.status === 401 || res.status === 403) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          sessionStorage.removeItem('sales_app_user');
          sessionStorage.removeItem('sales_app_token');
          throw new Error('Sesi kedaluwarsa, silakan login ulang.');
        }
        return res.json();
      })
      .then(dbData => { 
        setData(dbData); 
        setLoading(false); 
      })
      .catch(err => {
        // FALLBACK DEMO: Karena di preview Canvas ini tidak ada server Node.js,
        // kita menggunakan mock data agar preview tetap berfungsi. 
        // Di aplikasi VS Code Anda, peringatan ini akan muncul jika backend mati.
        console.warn("Backend tidak terhubung atau sesi berakhir. Menampilkan fallback jika ada.", err);
        setLoading(false);
      });
  }, [isAuthenticated, token]); 

  const filterOptions = useMemo(() => {
    if (!data.sales) return { regions: [], categories: [] };
    return { 
      regions: [...new Set(data.sales.map(s => s.region))].sort(), 
      categories: [...new Set(data.sales.map(s => s.category))].sort() 
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data.sales) return data;
    let filteredSales = data.sales;
    if (selectedYear !== 'All') filteredSales = filteredSales.filter(s => new Date(s.salesDate).getFullYear().toString() === selectedYear);
    if (selectedRegion !== 'Semua Region') filteredSales = filteredSales.filter(s => s.region === selectedRegion);
    if (selectedCategory !== 'Semua Kategori') filteredSales = filteredSales.filter(s => s.category === selectedCategory);
    return { ...data, sales: filteredSales };
  }, [data, selectedYear, selectedRegion, selectedCategory]);

  const prevYearData = useMemo(() => {
    if (selectedYear === 'All' || !data.sales) return null;
    const pYear = (parseInt(selectedYear) - 1).toString();
    let pSales = data.sales.filter(s => new Date(s.salesDate).getFullYear().toString() === pYear);
    if (selectedRegion !== 'Semua Region') pSales = pSales.filter(s => s.region === selectedRegion);
    if (selectedCategory !== 'Semua Kategori') pSales = pSales.filter(s => s.category === selectedCategory);
    return { revenue: pSales.reduce((sum, i) => sum + i.totalAmount, 0), tx: pSales.length, year: pYear };
  }, [data, selectedYear, selectedRegion, selectedCategory]);

  // LOGIN PAGE GATE
  if (!isAuthenticated) {
    return <Login onLoginSuccess={(u) => { setCurrentUser(u); setIsAuthenticated(true); sessionStorage.setItem('sales_app_user', JSON.stringify(u)); }} />;
  }

  // TAMPILAN LOADING DATA DARI DB
  if (loading && data.sales.length === 0) { 
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
         <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
         <p className="text-slate-500 font-medium">Mempersiapkan Workspace dari Database...</p>
      </div>
    );
  }

  return (
    <>
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onDownloadReport={() => {}} 
      user={currentUser} 
      onLogout={() => { 
        setCurrentUser(null); 
        setIsAuthenticated(false); 
        sessionStorage.removeItem('sales_app_user'); 
        sessionStorage.removeItem('sales_app_token'); // Hapus token saat logout
        window.location.href = 'https://dimasmhmd.qzz.io/';
      }}
      onOpenManageUser={() => setIsManageUserModalOpen(true)} 
      onOpenChat={() => setIsChatOpen(true)}
    >
      
    {activeTab !== 'forecast' && (
      <div className="shrink-0 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-6 mb-4 w-full">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-6 flex-wrap">

          {/* Title */}
          <div className="flex items-center gap-2 text-slate-700">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-sm">Global Filter</span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200"></div>

          {/* Filters */}
          <div className="flex items-center gap-6 flex-wrap">

            {/* Fiscal Year */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Fiscal Year
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none min-w-[120px]"
              >
                <option value="All">Semua Tahun</option>
                {data.fiscalYears?.map((year, i) => (
                  <option key={i} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Region
              </span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
              >
                <option value="Semua Region">Semua Region</option>
                {filterOptions.regions.map((region, i) => (
                  <option key={i} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Kategori
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {filterOptions.categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* RIGHT SECTION */}
        <button
          onClick={() => {
            setSelectedYear(currentYear);
            setSelectedRegion('Semua Region');
            setSelectedCategory('Semua Kategori');
          }}
          className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          Reset
        </button>

      </div>
    )}

      {/* DYNAMIC ROUTING */}
      <div className="flex-1 w-full min-h-0 flex flex-col relative z-0">
        {activeTab === 'dashboard' && <Dashboard data={filteredData} loading={loading} selectedYear={selectedYear} prevYearData={prevYearData} />}
        {activeTab === 'analytics' && <Analytics data={filteredData} loading={loading} />}
        {activeTab === 'forecast' && <Forecast data={filteredData} loading={loading} />}
        {activeTab === 'data' && <DataManagement data={filteredData} loading={loading} />}
      </div>
    </Layout>

    {/* RENDER MODAL DI LUAR LAYOUT */}
    <ManageUserModal 
      isOpen={isManageUserModalOpen} 
      onClose={() => setIsManageUserModalOpen(false)} 
    />
      
    <ChatAssistantModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

export default App;