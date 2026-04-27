// frontend/src/components/ManageUserModal.jsx
import React, { useState, useEffect } from 'react';

export const ManageUserModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('list'); // 'list' atau 'form'
  const [formData, setFormData] = useState({ id: null, name: '', username: '', password: '', role: 'Admin' });
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil data dari Backend saat Modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setView('list'); // Pastikan kembali ke view list saat dibuka ulang
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Gagal fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({ id: null, name: '', username: '', password: '', role: 'Admin' });
    setView('form');
  };

  const handleEditClick = (user) => {
    setFormData({ ...user, password: '' });
    setView('form');
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          const data = await response.json();
          alert(data.error || 'Gagal menghapus user');
        }
      } catch (error) {
        alert('Terjadi kesalahan jaringan.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const url = formData.id ? `http://localhost:5000/api/users/${formData.id}` : 'http://localhost:5000/api/users';
      const method = formData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchUsers(); // Refresh tabel data dari backend
        setView('list');
      } else {
        const data = await response.json();
        alert(data.error || 'Gagal menyimpan data user.');
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Manajemen User</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {view === 'list' ? (
            // --- VIEW: LIST USERS ---
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">{isLoading ? 'Memuat data...' : `Total: ${users.length} pengguna`}</span>
                <button onClick={handleAddClick} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Tambah User
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden relative">
                {/* Overlay transparan jika sedang loading */}
                {isLoading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}
                
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5">Nama Lengkap</th>
                      <th className="py-3 px-5">Username</th>
                      <th className="py-3 px-5">Role</th>
                      <th className="py-3 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-800">{u.name}</td>
                        <td className="py-3 px-5 font-mono text-slate-500">{u.username}</td>
                        <td className="py-3 px-5">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right flex justify-end gap-3">
                          <button onClick={() => handleEditClick(u)} className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Edit</button>
                          <button onClick={() => handleDeleteClick(u.id)} className="text-red-600 hover:text-red-800 font-bold transition-colors">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !isLoading && (
                      <tr><td colSpan="4" className="py-8 text-center text-slate-400">Tidak ada data pengguna</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // --- VIEW: FORM ADD/EDIT ---
            <div className="animate-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600 border border-slate-200 p-1.5 rounded-md hover:bg-slate-50">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h3 className="font-bold text-slate-700">{formData.id ? 'Edit Data User' : 'Tambah User Baru'}</h3>
              </div>

              <form onSubmit={handleSave} className="space-y-5 max-w-xl mx-auto pb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input type="text" required disabled={isLoading} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" placeholder="Contoh: Budi Santoso" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                  <input type="text" required disabled={isLoading} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" placeholder="Contoh: budi_sales" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password {formData.id && <span className="text-slate-400 font-normal normal-case tracking-normal">(Kosongkan jika tidak ingin diubah)</span>}</label>
                  <input type="password" required={!formData.id} disabled={isLoading} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hak Akses (Role)</label>
                  <select value={formData.role} disabled={isLoading} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50">
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" disabled={isLoading} onClick={() => setView('list')} className="px-5 py-2.5 rounded-lg font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">Batal</button>
                  <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50">
                    {isLoading ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};