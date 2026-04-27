// frontend/src/pages/Analytics.jsx
import React, { useMemo } from 'react';
import { Card } from '../components/Card';
import { formatRp } from '../utils/formatters';

export const Analytics = ({ data, loading }) => {
  // LOGIC: Mengolah raw data transaksi menjadi wawasan bisnis (Business Insights)
  const { regionSales, topProducts, topCustomers, maxRegionVal, totalRevenue } = useMemo(() => {
    const rSales = {};
    const pSales = {};
    const cSales = {};
    let total = 0;

    data.sales.forEach(sale => {
      // 1. Agregasi Region
      rSales[sale.region] = (rSales[sale.region] || 0) + sale.totalAmount;
      
      // 2. Agregasi Produk
      pSales[sale.productName] = (pSales[sale.productName] || 0) + sale.totalAmount;
      
      // 3. Agregasi Customer
      cSales[sale.customerName] = {
        amount: (cSales[sale.customerName]?.amount || 0) + sale.totalAmount,
        region: sale.region,
        txCount: (cSales[sale.customerName]?.txCount || 0) + 1
      };

      total += sale.totalAmount;
    });

    // Urutkan data dari yang terbesar ke terkecil
    const sortedRegions = Object.entries(rSales).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const sortedProducts = Object.entries(pSales).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5); // Ambil Top 5
    const sortedCustomers = Object.entries(cSales).map(([name, info]) => ({ 
      name, value: info.amount, region: info.region, txCount: info.txCount 
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Ambil Top 5

    return { 
      regionSales: sortedRegions, 
      topProducts: sortedProducts, 
      topCustomers: sortedCustomers, 
      maxRegionVal: sortedRegions.length > 0 ? sortedRegions[0].value : 0,
      totalRevenue: total
    };
  }, [data.sales]);

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      
      {/* HEADER */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white py-4 px-6 rounded-xl border border-gray-100 shadow-sm shrink-0 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Analisis Mendalam (Deep Dive)</h3>
          <p className="text-xs text-gray-500 mt-1">Breakdown pendapatan berdasarkan Geografis, Produk, dan Klien dari data yang difilter.</p>
        </div>
      </div> */}

      <div className={`flex flex-col lg:flex-row gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* KIRI: ANALISIS REGION (Horizontal Bar Chart) */}
        <Card className="flex-[1] flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-6">Penjualan per Region</h3>
          
          {regionSales.length === 0 && !loading ? (
             <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
          ) : (
            <div className="space-y-6">
              {regionSales.map((region, i) => {
                const percentOfMax = maxRegionVal === 0 ? 0 : (region.value / maxRegionVal) * 100;
                const percentOfTotal = totalRevenue === 0 ? 0 : (region.value / totalRevenue) * 100;
                
                return (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{region.name}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 text-sm">{formatRp(region.value)}</span>
                        <span className="text-xs text-gray-400 ml-2">({percentOfTotal.toFixed(1)}%)</span>
                      </div>
                    </div>
                    {/* Background Track */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      {/* Active Progress Bar */}
                      <div 
                        className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percentOfMax}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* KANAN: TOP PRODUK & TOP CUSTOMER */}
        <div className="flex-[1] flex flex-col gap-6">
          
          {/* Top 5 Produk */}
          <Card>
            <h3 className="text-base font-bold text-gray-900 mb-4">Top 5 Produk Terlaris</h3>
            {topProducts.length === 0 && !loading ? (
               <div className="py-4 text-center text-gray-400 text-sm">Tidak ada data</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {topProducts.map((prod, i) => (
                  <li key={i} className="py-3 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        #{i + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{prod.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatRp(prod.value)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Top 5 B2B Customers */}
          <Card>
            <h3 className="text-base font-bold text-gray-900 mb-4">Top 5 Customer B2B (Berdasarkan Nilai Transaksi)</h3>
            {topCustomers.length === 0 && !loading ? (
               <div className="py-4 text-center text-gray-400 text-sm">Tidak ada data</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {topCustomers.map((cust, i) => (
                  <li key={i} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {/* Avatar Inisial */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{cust.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">{cust.region} • {cust.txCount} Transaksi</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">{formatRp(cust.value)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};