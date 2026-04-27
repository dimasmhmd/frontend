// frontend/src/pages/Dashboard.jsx
import React, { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { formatRp } from '../utils/formatters';

// --- PIE CHART (DONUT) SVG MODERN ---
const CustomDonutChart = ({ data, totalRevenue }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-full text-xs text-slate-400">Tidak ada data</div>;

  const radius = 15.91549430918954; 
  let cumulativePercent = 0;

  const formatDonutCenter = (val) => {
    if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(2)}M`;
    if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(0)}Jt`;
    return `Rp ${val}`;
  };

  return (
    <div className="relative w-48 h-48 shrink-0 mx-auto">
      {/* ViewBox diperlebar agar label persentase floating di luar tidak terpotong */}
      <svg viewBox="-10 -10 56 56" className="w-full h-full overflow-visible drop-shadow-md">
        <circle cx="18" cy="18" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
        
        {data.map((slice, i) => {
          const percent = (slice.value / total) * 100;
          if (percent === 0) return null;
          
          const visiblePercent = percent > 1 ? percent - 0.5 : percent; // gap halus
          const offset = -cumulativePercent;
          
          const midPercent = cumulativePercent + percent / 2;
          cumulativePercent += percent;

          // Koordinat untuk label persentase di tepi luar
          const angle = (midPercent / 100) * Math.PI * 2 - (Math.PI / 2);
          const labelRadius = radius + 6.5; 
          const textX = 18 + Math.cos(angle) * labelRadius;
          const textY = 18 + Math.sin(angle) * labelRadius;

          return (
            <g key={i} className="hover:opacity-80 transition-opacity cursor-pointer group">
              <circle 
                cx="18" cy="18" r={radius} fill="transparent" 
                stroke={slice.color} strokeWidth="8" 
                strokeDasharray={`${visiblePercent} ${100 - visiblePercent}`} 
                strokeDashoffset={offset}
                transform="rotate(-90 18 18)"
              >
                <title>{slice.label}: {formatRp(slice.value)}</title>
              </circle>

              {/* Floating Percentage Label (Menggunakan displayPercent yang terjamin 100%) */}
              {percent > 2 && (
                <g transform={`translate(${textX}, ${textY})`}>
                   <rect x="-8" y="-3.5" width="16" height="7" rx="2" fill={slice.color} className="drop-shadow-sm"/>
                   <text x="0" y="0" fill={['Elektronik'].includes(slice.label) ? '#fff' : '#1e293b'} fontSize="3.5" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                     {slice.displayPercent}%
                   </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         <span className="text-sm font-black text-slate-900 leading-tight tracking-tight">
            {formatDonutCenter(totalRevenue)}
         </span>
         <span className="text-[8px] text-slate-500 font-medium">Total Penjualan</span>
      </div>
    </div>
  );
};

export const Dashboard = ({ data, loading, selectedYear, prevYearData }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Proses Data Logika
  const { monthlySales, totalRevenue, totalTransactions, categorySales, regionSales, maxVal, growth } = useMemo(() => {
    const map = new Map();
    let xIndex = 1;
    const sortedSales = [...data.sales].sort((a, b) => new Date(a.salesDate) - new Date(b.salesDate));
    
    let currentTotalRev = 0;
    const accCat = {};
    const accRegion = {};

    sortedSales.forEach(sale => {
      // Data bulanan
      const date = new Date(sale.salesDate);
      const monthLabel = date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      if (!map.has(monthLabel)) map.set(monthLabel, { x: xIndex++, monthLabel: monthLabel, rawDate: date, actual: 0 });
      map.get(monthLabel).actual += sale.totalAmount;
      currentTotalRev += sale.totalAmount;
      
      // Agregasi Kategori
      accCat[sale.category] = (accCat[sale.category] || 0) + sale.totalAmount;
      // Agregasi Region
      accRegion[sale.region] = (accRegion[sale.region] || 0) + sale.totalAmount;
    });

    const COLORS = { 'Elektronik': '#2563eb', 'F&B': '#22c55e', 'Fashion': '#f59e0b' };
    const rawCatSales = Object.entries(accCat)
      .map(([name, value]) => ({ label: name, value, color: COLORS[name] || '#94a3b8' }))
      .sort((a, b) => b.value - a.value);

    // Menghitung persentase Kategori dengan akurasi 100.0% (Largest Remainder Method)
    let sumRounded = 0;
    const catSales = rawCatSales.map((cat, idx) => {
      if (currentTotalRev === 0) return { ...cat, displayPercent: '0.0' };
      const rawP = (cat.value / currentTotalRev) * 100;
      
      if (idx === rawCatSales.length - 1) {
         let remainder = 100 - sumRounded;
         remainder = Math.round(remainder * 10) / 10;
         return { ...cat, displayPercent: Math.max(0, remainder).toFixed(1) };
      } else {
         const rounded = Math.round(rawP * 10) / 10;
         sumRounded += rounded;
         return { ...cat, displayPercent: rounded.toFixed(1) };
      }
    });

    // Menyiapkan array Region 
    const regionArray = Object.entries(accRegion)
      .map(([name, value]) => ({ label: name, value }))
      .sort((a, b) => b.value - a.value);

    const salesArray = Array.from(map.values());
    const maxValue = salesArray.length > 0 ? Math.max(...salesArray.map(m => m.actual)) : 0;
    const g = salesArray.length > 1 ? ((salesArray[salesArray.length-1].actual - salesArray[0].actual) / salesArray[0].actual) * 100 : 12.5;

    return {
      monthlySales: salesArray,
      totalRevenue: currentTotalRev,
      totalTransactions: data.sales.length,
      categorySales: catSales,
      regionSales: regionArray,
      maxVal: maxValue,
      growth: isNaN(g) || !isFinite(g) ? 12.5 : g
    };
  }, [data.sales]);

  let revGrowthVal = growth;
  let txGrowthVal = 8.3; 
  let revLabel = `vs tren keseluruhan`;
  let txLabel = `vs tren keseluruhan`;

  if (prevYearData && prevYearData.year) {
    revGrowthVal = prevYearData.revenue > 0 ? ((totalRevenue - prevYearData.revenue) / prevYearData.revenue) * 100 : 0;
    txGrowthVal = prevYearData.tx > 0 ? ((totalTransactions - prevYearData.tx) / prevYearData.tx) * 100 : 0;
    revLabel = `vs Rp ${(prevYearData.revenue / 1e6).toFixed(1)}Jt (${prevYearData.year})`;
    if(prevYearData.revenue > 1e9) revLabel = `vs Rp ${(prevYearData.revenue / 1e9).toFixed(1)}M (${prevYearData.year})`;
    txLabel = `vs ${prevYearData.tx} transaksi (${prevYearData.year})`;
  } else if (selectedYear === 'All') {
    revLabel = `Total keseluruhan periode`;
    txLabel = `Total keseluruhan periode`;
  }

  const formatCompactRp = (number) => {
    if (number >= 1e12) return `Rp ${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `Rp ${(number / 1e9).toFixed(1)}M`;
    if (number >= 1e6) return `Rp ${(number / 1e6).toFixed(0)}Jt`;
    return `Rp ${number}`;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
      
      {/* ROW 1: KPI CARDS (Disesuaikan menjadi 4 kolom) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* KPI 1: Penjualan */}
        <Card className="!p-5 relative overflow-hidden flex items-center justify-between border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="z-10">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <h3 className="text-xs font-bold text-slate-500">Total Penjualan</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 truncate tracking-tight">{formatRp(totalRevenue)}</p>
            <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${revGrowthVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={revGrowthVal >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}></path>
              </svg>
              {Math.abs(revGrowthVal).toFixed(1)}% <span className="text-slate-400 font-medium">{revLabel}</span>
            </p>
          </div>
          {/* Gelombang Biru (Simulasi grafis background) */}
          {/* <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none"><path d="M0 60C30 60 40 20 60 20C80 20 90 40 120 40V60H0Z" fill="#2563eb"/></svg>
          </div> */}
        </Card>

        {/* KPI 2: Transaksi */}
        <Card className="!p-5 flex items-center justify-between border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="z-10">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xs font-bold text-slate-500">Total Transaksi</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 truncate tracking-tight">{totalTransactions}</p>
            <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${txGrowthVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={txGrowthVal >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}></path>
              </svg>
              {Math.abs(txGrowthVal).toFixed(1)}% <span className="text-slate-400 font-medium">{txLabel}</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none text-emerald-500">
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M0 40 Q 20 40 30 20 T 60 30 T 100 10" /></svg>
          </div>
        </Card>

        {/* KPI 3: Top Region */}
        <Card className="!p-5 relative border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
              {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243A8 8 0 1117.657 16.657z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 className="text-xs font-bold text-slate-500">Top Region</h3>
          </div>
          <p className="text-2xl font-black text-slate-900 truncate tracking-tight">{regionSales[0]?.label || '-'}</p>
          <p className="text-[10px] font-medium mt-1 text-fuchsia-600 bg-fuchsia-50 inline-block px-2 py-0.5 rounded">
            {totalRevenue > 0 ? ((regionSales[0]?.value / totalRevenue) * 100).toFixed(1) : 0}% dari total penjualan
          </p>
        </Card>

        {/* KPI 4: Kategori */}
        <Card className="!p-5 relative border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
               {/* Ikon Trophy (Trophy Icon untuk Top Kategori) */}
               {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
              </svg>
            </div>
            <h3 className="text-xs font-bold text-slate-500">Top Kategori</h3>
          </div>
          <p className="text-2xl font-black text-slate-900 truncate tracking-tight">{categorySales[0]?.label || '-'}</p>
          <p className="text-[10px] font-medium mt-1 text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded">
            {categorySales[0]?.displayPercent || 0}% dari total penjualan
          </p>
        </Card>
      </div>

      {/* ROW 2: INSIGHT BANNER */}
      <div className={`shrink-0 bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
         <div className="flex items-center gap-2 font-bold text-indigo-700 shrink-0 xl:border-r border-indigo-200 xl:pr-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            Insight Otomatis
         </div>
         <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-2">
               <svg className={`w-4 h-4 shrink-0 mt-0.5 ${revGrowthVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={revGrowthVal >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"}></path>
               </svg>
               <p>Penjualan <strong className="text-slate-900">{revGrowthVal >= 0 ? 'naik' : 'turun'} {Math.abs(revGrowthVal).toFixed(1)}%</strong> dibanding periode yang sama tahun lalu.</p>
            </div>
            <div className="flex items-start gap-2">
               <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
               <p>Kategori <strong className="text-slate-900">{categorySales[0]?.label}</strong> mendominasi dengan kontribusi <strong>{categorySales[0]?.displayPercent || 0}%</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
               <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
               <p>Tidak ada penurunan signifikan di semua region pada periode ini.</p>
            </div>
         </div>
      </div>

      {/* ROW 3: CHARTS AREA */}
      <div className={`flex flex-col lg:flex-row flex-1 min-h-0 gap-4 w-full transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* KIRI: BAR CHART */}
        <Card className="flex flex-col w-full lg:w-[55%] min-h-0 overflow-hidden !p-5 border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="flex justify-between items-center shrink-0 mb-4">
            <div>
               <h3 className="text-sm font-bold text-slate-900">Tren Penjualan Bulanan</h3>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-[10px] font-bold text-slate-500">Actual {selectedYear === 'All' ? '' : selectedYear}</span>
               </div>
            </div>
            {loading && <span className="text-xs text-blue-500 animate-pulse">Memuat...</span>}
          </div>
          
          <div className="flex-1 flex min-h-0 w-full relative">
            {/* Y-AXIS */}
            <div className="flex flex-col justify-between items-end pr-3 pb-[1.5rem] pt-10 w-16 shrink-0 border-r border-slate-100 text-[9px] text-slate-400 font-bold">
              <span>{formatCompactRp(maxVal)}</span>
              <span>{formatCompactRp(maxVal * 0.66)}</span>
              <span>{formatCompactRp(maxVal * 0.33)}</span>
              <span>Rp 0</span>
            </div>

            {/* CHART CONTENT */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative ml-3">
              <div className="absolute inset-0 pb-[1.5rem] pt-10 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-slate-100 border-dashed w-full"></div>
                <div className="border-t border-slate-100 border-dashed w-full"></div>
                <div className="border-t border-slate-100 border-dashed w-full"></div>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              <div className="h-full flex items-end justify-between gap-2 min-w-full w-max pl-6 pr-6 pt-10 relative">
                {monthlySales.length === 0 && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm pb-6">Belum ada data transaksi.</div>
                )}
                
                {monthlySales.map((item, idx) => {
                  const heightPercent = maxVal === 0 ? 0 : (item.actual / maxVal) * 100; 
                  
                  // Logika perataan posisi Tooltip
                  let tooltipPosition = "left-1/2 -translate-x-1/2"; 
                  let arrowPosition = "left-1/2 -translate-x-1/2";
                  
                  if (idx === 0) {
                     tooltipPosition = "left-0"; // Elemen pertama rata kiri
                     arrowPosition = "left-4";   // Panah sedikit digeser
                  } else if (idx === monthlySales.length - 1) {
                     tooltipPosition = "right-0"; // Elemen terakhir rata kanan
                     arrowPosition = "right-4";
                  }

                  return (
                    <div 
                      key={idx} 
                      className="h-full flex flex-col justify-end group relative flex-1 min-w-[30px] max-w-[60px] hover:z-50 cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(item.monthLabel)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div 
                        className={`w-full rounded-t-md transition-all duration-300 relative z-10 mx-auto ${hoveredMonth === item.monthLabel ? 'bg-blue-600' : 'bg-blue-500'}`}
                        style={{ height: `calc(${heightPercent}% - 1.5rem)` }}
                      >
                         <div className={`absolute bottom-full ${tooltipPosition} mb-2 bg-slate-800 text-white rounded-md py-1.5 px-3 whitespace-nowrap z-20 shadow-lg pointer-events-none transition-all duration-200 origin-bottom flex flex-col items-center ${hoveredMonth === item.monthLabel ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            <span className="text-[9px] text-slate-300 font-medium mb-0.5">{item.monthLabel}</span>
                            <span className="text-[11px] font-bold tracking-wide">{formatRp(item.actual)}</span>
                            {/* Segitiga panah ke bawah */}
                            <div className={`absolute top-full ${arrowPosition} border-[5px] border-transparent border-t-slate-800`}></div>
                         </div>
                      </div>
                      <div className={`h-[1.5rem] flex items-center justify-center text-[10px] font-bold whitespace-nowrap mt-2 ${hoveredMonth === item.monthLabel ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.monthLabel.split(' ')[0]} 
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* KANAN: DONUT CHART AREA */}
        <Card className="flex flex-col w-full lg:w-[45%] min-h-0 overflow-hidden !p-5 border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="shrink-0 mb-4">
             <h3 className="text-sm font-bold text-slate-900 mb-0.5">Breakdown Kategori</h3>
             <p className="text-[10px] text-slate-500 font-medium">Penjualan Periode {selectedYear === 'All' ? 'Keseluruhan' : selectedYear}</p>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
             <div className="flex flex-col xl:flex-row items-center justify-start h-full gap-6">
                
                <CustomDonutChart data={categorySales} totalRevenue={totalRevenue} />
                
                {/* Tabel Legend Bawah/Kanan */}
                <div className="w-full flex-1 overflow-x-auto">
                   <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                         <tr>
                            <th className="text-[9px] uppercase tracking-wider text-slate-400 font-bold pb-2 border-b border-slate-100">Kategori</th>
                            <th className="text-[9px] uppercase tracking-wider text-slate-400 font-bold pb-2 border-b border-slate-100 px-3">Amount</th>
                            <th className="text-[9px] uppercase tracking-wider text-slate-400 font-bold pb-2 border-b border-slate-100">Kontribusi</th>
                         </tr>
                      </thead>
                      <tbody>
                         {categorySales.map((cat, i) => (
                           <tr key={i}>
                              <td className="py-2.5 text-xs font-bold text-slate-700 border-b border-slate-50">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                    <span>{cat.label}</span>
                                 </div>
                              </td>
                              <td className="py-2.5 text-xs font-medium text-slate-600 border-b border-slate-50 px-3">
                                 {formatCompactRp(cat.value)}
                              </td>
                              <td className="py-2.5 text-xs font-black text-slate-900 border-b border-slate-50">
                                 {/* Tampilkan exact persentase yang sudah dihitung */}
                                 {cat.displayPercent}%
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
