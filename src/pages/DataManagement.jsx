// frontend/src/pages/DataManagement.jsx
import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { formatRp } from '../utils/formatters';

export const DataManagement = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // LOGIC: Memfilter data berdasarkan input pencarian text
  const filteredSales = useMemo(() => {
    if (!data || !data.sales) return [];
    
    // Sort dari yang terbaru
    const sortedSales = [...data.sales].sort((a, b) => new Date(b.salesDate) - new Date(a.salesDate));
    
    if (!searchTerm) return sortedSales;

    const lowerCaseTerm = searchTerm.toLowerCase();
    return sortedSales.filter(sale => 
      sale.productName.toLowerCase().includes(lowerCaseTerm) ||
      sale.customerName.toLowerCase().includes(lowerCaseTerm) ||
      sale.category.toLowerCase().includes(lowerCaseTerm) ||
      sale.region.toLowerCase().includes(lowerCaseTerm) ||
      sale.salesId.toString().includes(lowerCaseTerm)
    );
  }, [data.sales, searchTerm]);

  // LOGIC: Paginasi (membagi data menjadi halaman-halaman)
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset ke halaman 1 jika user melakukan pencarian baru
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      
      {/* HEADER & PENCARIAN TEXT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white py-4 px-6 rounded-xl border border-gray-100 shadow-sm shrink-0 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Database Transaksi Penjualan</h3>
          <p className="text-xs text-gray-500 mt-1">Kelola dan tinjau seluruh data transaksi historis dari filter yang dipilih.</p>
        </div>
        
        <div className="w-full md:w-72 relative">
          <input 
            type="text" 
            placeholder="Cari produk, pelanggan..." 
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow disabled:bg-gray-100"
          />
          {/* Ikon Kaca Pembesar (SVG) */}
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden flex flex-col w-full flex-1">
        
        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-6">ID Transaksi</th>
                <th className="py-3 px-6">Tanggal</th>
                <th className="py-3 px-6">Produk</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6">Pelanggan</th>
                <th className="py-3 px-6 text-center">Qty</th>
                <th className="py-3 px-6 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 relative">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                      Memuat data dari server...
                    </div>
                  </td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    Tidak ada data transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.salesId} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs text-gray-500">#{sale.salesId}</td>
                    <td className="py-3 px-6">{new Date(sale.salesDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 px-6 font-medium text-gray-900">{sale.productName}</td>
                    <td className="py-3 px-6">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                        {sale.category}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{sale.customerName}</span>
                        <span className="text-[10px] text-gray-500">{sale.region}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">{sale.quantity}</td>
                    <td className="py-3 px-6 text-right font-medium text-green-600">{formatRp(sale.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {!loading && filteredSales.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500 mb-4 sm:mb-0">
              Menampilkan <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> dari <span className="font-bold text-gray-900">{filteredSales.length}</span> entri
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white border border-blue-600' 
                          : 'text-gray-600 hover:bg-gray-200 border border-transparent'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && <span className="text-gray-400 px-1">...</span>}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
      
    </div>
  );
};
