import React, { useState, useEffect } from 'react';
import { Compass, Mountain } from 'lucide-react';
import Auth from './components/Auth';
import TripManager from './components/TripManager';

const backgroundList = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundList.length);
    }, 120000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col justify-between relative overflow-x-hidden text-slate-100 selection:bg-emerald-500 selection:text-white transition-all duration-1000 adventure-bg"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 12, 16, 0.8), rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.99)), url('${backgroundList[bgIndex]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm backdrop-blur-md">
            <Compass size={20} className="animate-spin" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight !m-0 text-white">Mahameru Kencana</h1>
            <p className="text-[11px] text-emerald-400/95 font-medium">Antara mencintai alam atau ada luka yang terlalu dalam</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full flex items-center justify-center z-10">
        {!currentUser ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-4 pr-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-max">
                <Mountain size={14} /> Expedition Ready
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Plan Your Mountain Trip with Precision.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Workspace terpadu manajemen logistik pendakian, kalkulasi grade gunung, touring dan monitoring profil medis darurats.
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">🛡️ Safety First</div>
                <div className="flex items-center gap-2">🏍️ Touring</div>
                <div className="flex items-center gap-2">🏔️ Grade I - V</div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-6 w-full">
              <Auth currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 w-full">
              <Auth currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </div>
            <div className="lg:col-span-8 w-full">
              <TripManager currentUser={currentUser} />
            </div>
          </div>
        )}
      </main>

      <footer className="w-full text-center py-6 text-xs text-slate-500 z-10">
        © 2026 Mahameru Kencana
      </footer>
    </div>
  );
}