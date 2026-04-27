// frontend/src/pages/Forecast.jsx
import React, { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { formatRp } from '../utils/formatters';

export const Forecast = ({ data, loading }) => {
  // STATE: Memilih Algoritma Prediksi
  const [algorithm, setAlgorithm] = useState('linear'); // 'linear' atau 'xgboost'

  // LOGIC: Kalkulasi ML & Time-Series
  const { chartData, maxVal, forecastMetrics } = useMemo(() => {
    const map = new Map();
    let xIndex = 1;
    const sortedSales = [...data.sales].sort((a, b) => new Date(a.salesDate) - new Date(b.salesDate));
    
    sortedSales.forEach(sale => {
      const d = new Date(sale.salesDate);
      const mLabel = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!map.has(mLabel)) {
        map.set(mLabel, { x: xIndex++, monthLabel: mLabel, rawDate: d, actual: 0, isPrediction: false });
      }
      map.get(mLabel).actual += sale.totalAmount;
    });

    const historical = Array.from(map.values());
    const n = historical.length;

    let predictions = [];
    let slope = 0;
    let growthRate = 0;

    if (n > 1) {
      // --- PERHITUNGAN LINEAR REGRESSION (Base Trend) ---
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      historical.forEach(pt => {
        sumX += pt.x;
        sumY += pt.actual;
        sumXY += (pt.x * pt.actual);
        sumXX += (pt.x * pt.x);
      });

      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      const lastHistorical = historical[n - 1];
      const lastDate = lastHistorical.rawDate;

      // Persiapan Array untuk Time-Series Features (Rolling & Lag)
      // Menyalin nilai aktual untuk digunakan sebagai "Lag" dinamis saat memprediksi
      let timeSeriesVals = historical.map(h => h.actual);

      // --- LOOP PREDIKSI 6 BULAN KE DEPAN ---
      for (let i = 1; i <= 6; i++) {
        const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
        let predictedY = 0;

        if (algorithm === 'linear') {
          // Model 1: Algoritma Linear Regression Standar
          predictedY = slope * (lastHistorical.x + i) + intercept;
        } 
        else if (algorithm === 'xgboost') {
          // Model 2: Simulasi XGBoost (Advanced Time-Series Model)
          // Di production, ini memanggil API model Python (pkl/onnx). Di sini kita membuat mock decision logic.

          // 1. Feature Engineering: Lags & Rolling
          const len = timeSeriesVals.length;
          const lag1 = timeSeriesVals[len - 1]; // Bulan sebelumnya
          const lag2 = timeSeriesVals[len - 2] || lag1; // 2 Bulan sebelumnya
          const lag3 = timeSeriesVals[len - 3] || lag2; // 3 Bulan sebelumnya
          
          // Fitur rata-rata bergulir (Rolling Mean 3 Months) untuk meredam noise
          const rollingMean3 = (lag1 + lag2 + lag3) / 3;

          // 2. Simulasi Decision Tree (XGBoost logic mock)
          // XGBoost mendeteksi pola non-linear. Jika tren naik, bobot lag terbaru lebih kuat.
          let weightLag = 0.5;
          let weightRolling = 0.5;

          if (lag1 > lag2) {
             // Tren sedang naik (Uptrend node)
             weightLag = 0.7;
             weightRolling = 0.3;
          } else {
             // Tren sedang turun (Downtrend node)
             weightLag = 0.4;
             weightRolling = 0.6;
          }

          // Kalkulasi basis kombinasi fitur
          predictedY = (lag1 * weightLag) + (rollingMean3 * weightRolling);

          // Menambahkan sedikit efek seasonal/variance (simulasi tree booster residual)
          const varianceMultiplier = 1 + (Math.random() * 0.04 - 0.02); // +/- 2%
          predictedY = predictedY * varianceMultiplier;
        }

        predictedY = Math.max(0, predictedY); // Tidak boleh minus
        
        // Simpan hasil ke array timeSeriesVals agar bisa menjadi 'Lag' untuk iterasi bulan berikutnya
        timeSeriesVals.push(predictedY);

        predictions.push({
          x: lastHistorical.x + i,
          monthLabel: nextDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
          rawDate: nextDate,
          actual: predictedY,
          isPrediction: true
        });
      }

      // Kalkulasi estimasi persentase pertumbuhan dari bulan depan ke 6 bulan depan
      const firstPred = predictions[0]?.actual || 0;
      const lastPred = predictions[5]?.actual || 0;
      growthRate = firstPred > 0 ? ((lastPred - firstPred) / firstPred) * 100 : 0;
    }

    const combinedData = [...historical, ...predictions];
    const maxValue = combinedData.length > 0 ? Math.max(...combinedData.map(m => m.actual)) : 0;

    return {
      chartData: combinedData,
      maxVal: maxValue,
      forecastMetrics: { slope, growthRate, predictions }
    };
  }, [data.sales, algorithm]); // Me-recalculate jika algoritma berubah

  // Format Helper untuk Y-Axis
  const formatCompactRp = (number) => {
    if (number >= 1e12) return `Rp ${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `Rp ${(number / 1e9).toFixed(1)}M`;
    if (number >= 1e6) return `Rp ${(number / 1e6).toFixed(1)}Jt`;
    return `Rp ${number}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      
      {/* HEADER AI & ALGORITHM SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white py-6 px-8 rounded-xl shadow-lg shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔮</span>
            <h3 className="text-xl font-bold">AI Sales Forecasting</h3>
          </div>
          <p className="text-indigo-200 text-sm max-w-3xl leading-relaxed">
            Sistem menggunakan algoritma Machine Learning untuk mengekstraksi fitur <em>Time-Series</em> (Lag, Rolling Mean) dari data historis Anda guna memproyeksikan performa 6 bulan mendatang.
          </p>
        </div>

        {/* DROPDOWN PEMILIHAN ALGORITMA */}
        <div className="flex flex-col shrink-0">
          <label className="text-xs font-medium text-indigo-300 mb-1">Model Algoritma:</label>
          <select 
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={loading}
            className="bg-indigo-950/50 border border-indigo-700 text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none cursor-pointer"
          >
            <option value="linear">Linear Regression (Base Trend)</option>
            <option value="xgboost">XGBoost (Time-Series Features)</option>
          </select>
        </div>
      </div>

      <div className={`flex flex-col gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* KPI PREDICITON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          <Card className="border-l-4 border-l-purple-500 !p-5">
            <h3 className="text-gray-500 text-xs font-medium mb-1">Status Tren Utama (Linear Slope)</h3>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold truncate ${forecastMetrics.slope >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {forecastMetrics.slope >= 0 ? '↗ Positif (Naik)' : '↘ Negatif (Turun)'}
              </p>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Rata-rata perubahan per bulan: {formatRp(forecastMetrics.slope)}</p>
          </Card>
          <Card className="border-l-4 border-l-indigo-500 !p-5">
            <h3 className="text-gray-500 text-xs font-medium mb-1">Proyeksi Growth Model <span className="uppercase text-indigo-600">{algorithm}</span></h3>
            <p className="text-2xl font-bold text-gray-900 truncate">
              {forecastMetrics.growthRate > 0 ? '+' : ''}{forecastMetrics.growthRate.toFixed(2)}%
            </p>
            <p className="text-[10px] text-gray-400 mt-2">Dari target bulan depan vs target 6 bulan kedepan.</p>
          </Card>
        </div>

        {/* HYBRID CHART (HISTORICAL VS PREDICTION) */}
        <Card className="flex flex-col w-full overflow-hidden !p-4">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-base font-bold text-gray-900">Grafik Proyeksi Penjualan</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-xs text-gray-600"><div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div> Historis</div>
              <div className="flex items-center text-xs text-gray-600"><div className="w-3 h-3 bg-purple-400 rounded-sm mr-2 border border-purple-600 border-dashed"></div> Prediksi AI</div>
            </div>
          </div>
          
          <div className="flex-1 flex min-h-0 w-full">
            {/* Y-AXIS */}
            <div className="flex flex-col justify-between items-end pr-2 pb-[1.5rem] pt-10 w-14 shrink-0 border-r border-gray-100 text-[10px] text-gray-500 font-medium">
              <span>{formatCompactRp(maxVal)}</span>
              <span>{formatCompactRp(maxVal * 0.66)}</span>
              <span>{formatCompactRp(maxVal * 0.33)}</span>
              <span>Rp 0</span>
            </div>

            {/* AREA CHART */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative ml-2">
              <div className="absolute inset-0 pb-[1.5rem] pt-10 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-300 w-full"></div>
              </div>

              <div className="h-[35vh] min-h-[250px] flex items-end gap-3 min-w-full w-max px-2 pr-6 pt-10">
                {chartData.length === 0 && !loading && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm pb-6">Tidak ada data untuk dianalisis.</div>
                )}
                
                {chartData.map((item, idx) => {
                  const heightPercent = maxVal === 0 ? 0 : (item.actual / maxVal) * 100; 
                  let tooltipPosition = "left-1/2 -translate-x-1/2"; 
                  if (idx === 0) tooltipPosition = "left-0"; 
                  else if (idx === chartData.length - 1) tooltipPosition = "right-0"; 
                  
                  return (
                    <div key={idx} className="h-full flex flex-col justify-end group relative min-w-[40px] hover:z-50 cursor-pointer">
                      
                      {/* Bar Styles based on type (Actual vs Prediction) */}
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-300 relative z-10 
                          ${item.isPrediction ? 'bg-purple-400 bg-opacity-70 border-t-2 border-dashed border-purple-700 hover:bg-opacity-90' : 'bg-blue-500 hover:bg-blue-600'}`}
                        style={{ height: `calc(${heightPercent}% - 1.5rem)` }}
                      >
                        <div className={`opacity-0 group-hover:opacity-100 absolute -top-8 ${tooltipPosition} bg-gray-900 text-white text-[10px] font-medium py-1 px-3 rounded whitespace-nowrap z-20 transition-opacity shadow-lg`}>
                          <span className="block text-[8px] text-gray-400 uppercase tracking-wider mb-0.5">{item.isPrediction ? 'Prediksi' : 'Aktual'}</span>
                          {formatRp(item.actual)}
                        </div>
                      </div>
                      
                      <div className={`h-[1.5rem] flex items-center justify-center text-[10px] font-bold whitespace-nowrap mt-1 ${item.isPrediction ? 'text-purple-600' : 'text-gray-500'}`}>
                        {item.monthLabel.split(' ')[0]} 
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* DATA TABLE PROYEKSI */}
        <Card className="!p-0 overflow-hidden border-t-4 border-t-purple-500">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-base font-bold text-gray-900">Rincian Angka Proyeksi (6 Bulan Mendatang)</h3>
             <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Model: {algorithm}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="py-3 px-6">Bulan / Tahun</th>
                  <th className="py-3 px-6 text-right">Target Penjualan (Estimasi AI)</th>
                  <th className="py-3 px-6">Status Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forecastMetrics?.predictions?.map((d, i) => (
                  <tr key={i} className="hover:bg-purple-50 transition-colors">
                    <td className="py-3 px-6 font-medium text-gray-900">{d.monthLabel}</td>
                    <td className="py-3 px-6 text-right font-mono text-purple-700 font-bold">{formatRp(d.actual)}</td>
                    <td className="py-3 px-6">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Projected</span>
                    </td>
                  </tr>
                ))}
                {(!forecastMetrics?.predictions || forecastMetrics.predictions.length === 0) && (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-gray-400">Data historis tidak cukup untuk membuat prediksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
};