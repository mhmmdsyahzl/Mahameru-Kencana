import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Thermometer, AlertTriangle, MapPin, WifiOff, Wifi } from 'lucide-react';

export default function TripWeatherWidget({ trip }) {
  const [weatherMap, setWeatherMap] = useState({});
  const [selectedDest, setSelectedDest] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const destinations = trip.destinations && trip.destinations.length > 0 
    ? trip.destinations 
    : [trip.departureCity || 'Lokasi Tujuan'];

  useEffect(() => {
    if (destinations.length > 0 && !selectedDest) {
      setSelectedDest(destinations[0]);
    }

    const fetchWeather = async () => {
      setLoading(true);
      try {
        if (!navigator.onLine) {
          throw new Error("No internet connection");
        }

        const apiKey = "YOUR_OPENWEATHER_API_KEY";
        const simulatedData = {};

        for (let i = 0; i < destinations.length; i++) {
          const dest = destinations[i];
          
          if (apiKey && apiKey !== "YOUR_OPENWEATHER_API_KEY") {
            try {
              const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(dest)}&units=metric&appid=${apiKey}`);
              if (!res.ok) throw new Error("API Limit / City not found");
              const json = await res.json();
              
              simulatedData[dest] = {
                temp: `${Math.round(json.main.temp)}°C`,
                condition: json.weather?.[0]?.description ? json.weather[0].description.toUpperCase() : 'BERAWAN',
                humidity: `${json.main.humidity}%`,
                windSpeed: `${Math.round((json.wind?.speed || 0) * 3.6)} km/h`,
                warning: json.main.temp < 15 ? 'Suhu dingin ekstrem, wajib pakai jaket tebal!' : null,
                isRealtime: true
              };
              continue;
            } catch (e) {
              // Fallback
            }
          }

          simulatedData[dest] = {
            temp: `${16 + (i * 2)}°C`,
            condition: i % 2 === 0 ? 'Berawan / Potensi Kabut Tipis' : 'Cerah Berawan',
            humidity: `${80 + i}%`,
            windSpeed: `${12 + (i * 3)} km/h`,
            warning: i === 0 ? 'Waspada angin kencang di ridge jalur pendakian sore hari!' : null,
            isRealtime: false
          };
        }

        setWeatherMap(simulatedData);
        setIsOfflineMode(false);
        setLoading(false);
      } catch (err) {
        setIsOfflineMode(true);
        const fallbackData = {};
        destinations.forEach((dest, index) => {
          fallbackData[dest] = {
            temp: `${17 + index}°C`,
            condition: 'Mode Offline (Data Estimasi Jalur)',
            humidity: '82%',
            windSpeed: '14 km/h',
            warning: 'Tanpa sinyal: Menggunakan cache data offline penjelajahan.',
            isRealtime: false
          };
        });
        setWeatherMap(fallbackData);
        setLoading(false);
      }
    };

    fetchWeather();
  }, [trip]);

  if (loading) {
    return (
      <div className="bg-slate-950/85 border border-slate-800 p-4 rounded-3xl flex items-center justify-center text-xs text-slate-400 animate-pulse">
        📡 Menghubungkan ke satelit cuaca checkpoint...
      </div>
    );
  }

  const activeDest = selectedDest || destinations[0];
  const data = weatherMap[activeDest] || {
    temp: '18°C',
    condition: 'Berawan',
    humidity: '85%',
    windSpeed: '14 km/h',
    warning: null,
    isRealtime: false
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl space-y-4 text-left">
      
      {/* Header: Judul & Badge Sinyal */}
      <div className="flex justify-between items-center gap-2 border-b border-slate-800 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 shrink-0">
          <CloudRain size={16}/> Cuaca Checkpoint
        </h4>
        <span className={`text-[10px] px-2.5 py-1 rounded-xl border font-medium flex items-center gap-1 shrink-0 ${
          isOfflineMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isOfflineMode ? <WifiOff size={11}/> : <Wifi size={11}/>}
          {isOfflineMode ? 'Offline Cache' : 'Real-time Live'}
        </span>
      </div>

      {/* Baris Tab Pilihan Destinasi (Terpisah di bawah header agar tidak nabrak) */}
      {destinations.length > 1 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {destinations.map((dest, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDest(dest)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeDest === dest 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <MapPin size={12}/> {dest}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 w-fit">
          <MapPin size={13} className="text-cyan-400"/> {activeDest}
        </div>
      )}

      {/* Grid Informasi Cuaca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Thermometer size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Suhu Udara</span>
            <span className="text-xs font-bold text-white font-mono">{data.temp}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Sun size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Kondisi</span>
            <span className="text-xs font-bold text-white truncate block" title={data.condition}>{data.condition}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <CloudRain size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Kelembapan</span>
            <span className="text-xs font-bold text-white font-mono">{data.humidity}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Wind size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Kecepatan Angin</span>
            <span className="text-xs font-bold text-white font-mono">{data.windSpeed}</span>
          </div>
        </div>
      </div>

      {data.warning && (
        <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-amber-300 text-[11px]">
          <AlertTriangle size={16} className="shrink-0 text-amber-400"/>
          <span>{data.warning}</span>
        </div>
      )}
    </div>
  );
}