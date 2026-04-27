// frontend/src/components/ChatAssistantModal.jsx
import React, { useState, useRef, useEffect } from 'react';

export const ChatAssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Halo! Saya AI Assistant Anda. Saya telah terhubung ke database. Apa yang ingin Anda ketahui tentang performa penjualan kita?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // STATE BARU: Untuk mengontrol ukuran panel (Expand/Collapse)
  const [isExpanded, setIsExpanded] = useState(false); 
  
  const messagesEndRef = useRef(null);

  // Auto-scroll ke pesan terbawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const token = sessionStorage.getItem('sales_app_token'); 

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply || 'Maaf, terjadi kesalahan.' }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${data.error || 'Terjadi kesalahan saat menghubungi AI.'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Koneksi ke server AI terputus.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Fungsi sederhana untuk mem-parsing format Bold Markdown dari AI
  const formatText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-900">$1</strong>');
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Panel Chat: Lebar dinamis menggunakan ternary operator pada max-w */}
      <div className={`h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transition-all ease-in-out ${isExpanded ? 'w-full max-w-7xl' : 'w-full max-w-md'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-indigo-600 text-white flex justify-between items-center shrink-0 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner">🤖</div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Data & AI Assistant</h3>
              <p className="text-[10px] text-indigo-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span> Terhubung ke Database
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Tombol Expand/Collapse */}
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-indigo-500 rounded-lg transition-colors" title={isExpanded ? "Perkecil" : "Perlebar"}>
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14h5v5M21 10h-5V5M16 10l5-5M8 14l-5 5"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              )}
            </button>

            {/* Tombol Close */}
            <button onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-lg transition-colors" title="Tutup">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Area Pesan */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* PENAMBAHAN whitespace-pre-wrap AGAR \n MENJADI BARIS BARU & leading-relaxed UNTUK SPASI BARIS */}
              <div className={`max-w-[90%] ${isExpanded ? 'lg:max-w-[75%]' : 'md:max-w-[85%]'} rounded-2xl px-5 py-3.5 text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm shadow-md' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
              }`}>
                <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}></span>
              </div>
              
            </div>
          ))}
          
          {/* Animasi Mengetik */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanya soal performa penjualan..." 
              className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
            />
            <button 
              type="submit" 
              disabled={isTyping || !inputValue.trim()}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};