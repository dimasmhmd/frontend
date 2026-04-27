// frontend/src/pages/Login.jsx
import React, { useState } from 'react';

export const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Menggunakan API Backend Asli (Tanpa Mock Data)
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (err) {
      setErrorMsg('Tidak dapat terhubung ke server database backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* BAGIAN KIRI: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-blue-600 text-white p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            {/* <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">DM</div> */}
            <img className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl" src="/icon-data-ai.png" alt="Logo" />
            <h1 className="text-2xl font-bold tracking-tight">Data & AI <span className="text-blue-300">Solution</span></h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4 mt-20">Sistem Prediksi Penjualan <br/> Cerdas & Akurat.</h2>
          <p className="text-blue-100 text-lg max-w-md">Kelola data transaksi, analisis performa secara real-time, dan gunakan kekuatan Machine Learning untuk memproyeksikan target masa depan Anda.</p>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="text-sm text-blue-200 relative z-10">© {new Date().getFullYear()} Data & AI Solution Enterprise.</div>
      </div>

      {/* BAGIAN KANAN: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-10 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">D</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data & AI <span className="text-blue-600">Solution</span></h1>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Selamat Datang</h2>
            <p className="text-slate-500">Silakan masukkan kredensial Anda untuk masuk ke dalam sistem.</p>
          </div>
          
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-bold text-slate-700">Password</label>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-4">
              {loading ? 'Memverifikasi...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
