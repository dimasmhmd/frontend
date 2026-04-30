// frontend/src/pages/Forecast.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card'; 

// Helper pemformatan uang
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,   
  }).format(value || 0);
};

export const Forecast = () => {
  const [chartData, setChartData] = useState([]); 
  const [forecastData, setForecastData] = useState([]); 
  const [insightText, setInsightText] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredMonth, setHoveredMonth] = useState(null); 

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = sessionStorage.getItem('sales_app_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const response = await fetch(`${apiUrl}/api/forecast`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          setForecastData(data.predictions);
          setInsightText(data.trendInsight); 
          
          const histData = data.historical || [];
          const last6MonthsHist = histData.slice(-6);
          
          setChartData([...last6MonthsHist, ...(data.predictions || [])]);
        } else {
          setError(data.error || 'Gagal mengambil data prediksi');
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan saat menghubungi server backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  const formatCompactRp = (number) => {
    if (!number) return 'Rp 0';
    if (number >= 1e12) return `Rp ${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `Rp ${(number / 1e9).toFixed(1)}M`;
    if (number >= 1e6) return `Rp ${(number / 1e6).toFixed(1)}Jt`;
    return `Rp ${number}`;
  };

  const maxVal = Math.max(...chartData.map(d => d.actual || d.predicted || 0)) * 1.25;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p>Menganalisis pola penjualan dengan model Hybrid XGBoost & Linear Regression...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Informasi AI Hybrid */}
      <Card className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white border-none shadow-md">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span>🔮</span> Hybrid AI: XGBoost + Linear Regression
            </h3>
            <p className="text-blue-100 text-sm max-w-4xl leading-relaxed">
              Sistem prediksi (*forecasting*) ini ditenagai oleh Python Microservice menggunakan metode <strong>Explainable AI</strong>. Kami menggunakan <span className="bg-blue-800 px-2 py-0.5 rounded text-white font-mono text-xs">XGBoost</span> untuk akurasi prediksi tertinggi, dan <span className="bg-blue-800 px-2 py-0.5 rounded text-white font-mono text-xs">Linear Regression</span> untuk menghasilkan insight tren yang mudah dipahami.
            </p>
          </div>
          
          {/* Box Insight dari Linear Regression */}
          {insightText && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl shrink-0 w-full lg:w-80">
               <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Trend Insight</span>
               </div>
               <p className="text-sm font-medium text-white">{insightText}</p>
            </div>
          )}
        </div>
      </Card>

      {/* --- GRAFIK PROYEKSI PENJUALAN --- */}
      <Card className="shadow-sm border-slate-200 !p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Grafik Proyeksi Penjualan (12 Bulan)</h3>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Historis (6 Bulan Terakhir)</div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#C4A4F9] rounded-sm"></div> Prediksi XGBoost</div>
          </div>
        </div>
        
        <div className="h-80 flex min-w-0 w-full relative">
          {/* Y-Axis Value Labels */}
          <div className="flex flex-col justify-between items-end pr-4 pb-[1.5rem] pt-14 w-20 shrink-0 border-r border-slate-100 text-[10px] text-slate-500 font-medium">
            <span>{formatCompactRp(maxVal)}</span>
            <span>{formatCompactRp(maxVal * 0.66)}</span>
            <span>{formatCompactRp(maxVal * 0.33)}</span>
            <span>Rp 0</span>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden relative ml-2 custom-scrollbar">
            {/* Grid Garis Horizontal */}
            <div className="absolute inset-0 pb-[1.5rem] pt-14 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-slate-100 w-full"></div>
              <div className="border-t border-slate-100 w-full"></div>
              <div className="border-t border-slate-100 w-full"></div>
              <div className="border-t border-slate-300 w-full"></div>
            </div>

            {/* Area Grafik Bar */}
            <div className="h-full flex items-end justify-between gap-3 min-w-full w-max pl-4 pr-32 pt-14 relative after:content-[''] after:min-w-[60px] after:block after:shrink-0">
              {chartData.map((item, idx) => {
                const val = item.actual || item.predicted;
                const heightPercent = maxVal === 0 ? 0 : (val / maxVal) * 100;
                const isPred = item.isPrediction;

                let tooltipPos = "left-1/2 -translate-x-1/2";
                let arrowPos = "left-1/2 -translate-x-1/2";
                
                if (idx === 0) { 
                  tooltipPos = "left-0"; 
                  arrowPos = "left-4"; 
                }
                else if (idx >= chartData.length - 1) { 
                  tooltipPos = "right-0"; 
                  arrowPos = "right-4"; 
                }

                return (
                  <div 
                    key={idx} 
                    // FIX: Dinamis mengganti z-index. Saat dihover z-50, saat normal z-0 agar tidak tertutup grafik di kanannya.
                    className={`h-full flex flex-col justify-end relative flex-1 min-w-[40px] max-w-[80px] group cursor-pointer ${hoveredMonth === item.monthLabel ? 'z-50' : 'z-0'}`}
                    onMouseEnter={() => setHoveredMonth(item.monthLabel)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <div 
                      className={`w-full relative z-10 mx-auto transition-all duration-300 ${isPred ? 'bg-[#C4A4F9] border-t-2 border-dashed border-[#A875F5]' : 'bg-blue-500 hover:bg-blue-600'} ${hoveredMonth === item.monthLabel && isPred ? 'opacity-80' : ''}`}
                      style={{ height: `calc(${heightPercent}% - 1.5rem)` }}
                    >
                      <div className={`absolute bottom-full ${tooltipPos} mb-2 bg-slate-900 text-white rounded-lg py-2 px-3 whitespace-nowrap z-20 shadow-xl pointer-events-none transition-all duration-200 flex flex-col items-center ${hoveredMonth === item.monthLabel ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{isPred ? 'XGBOOST PREDICT' : 'HISTORIS'}</span>
                        <span className="text-[11px] font-bold">{formatRp(val)}</span>
                        <div className={`absolute top-full ${arrowPos} border-[5px] border-transparent border-t-slate-900`}></div>
                      </div>
                    </div>
                    
                    <div className={`h-[1.5rem] flex items-center justify-center text-[10px] font-medium whitespace-nowrap mt-2 ${hoveredMonth === item.monthLabel ? (isPred ? 'text-[#A875F5]' : 'text-blue-600') : 'text-slate-500'}`}>
                      {item.monthLabel.split(' ')[0]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabel Hasil Prediksi & Penjelasan AI */}
      <Card className="shadow-sm border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Target Penjualan 6 Bulan Ke Depan (Bahan Presentasi)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-5">Bulan Proyeksi</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Estimasi Pendapatan</th>
                <th className="py-3 px-5">Analisis & Status Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecastData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">{d.monthLabel}</td>
                  <td className="py-4 px-5 text-right font-mono text-indigo-700 font-bold text-base whitespace-nowrap align-center">
                    {formatRp(d.predicted)}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-2">
                      {/* <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider w-max">
                        XGBoost Predicted
                      </span> */}
                      {d.details && (
                        <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200 mt-1 max-w-xl">
                          <span className="font-bold text-indigo-600">Dasar Prediksi AI: </span> 
                          {d.details.insight}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
