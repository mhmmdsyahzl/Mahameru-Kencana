import React, { useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Plus, Trash2, Compass, Sparkles, Edit3, Check, Navigation } from 'lucide-react';

export default function TripTimelineMap({ trip, currentUser }) {
  const [selectedDate, setSelectedDate] = useState(trip?.startDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Belum');
  const [loading, setLoading] = useState(false);

  // State untuk Fitur Edit Inline & Filter Tab Hari aktif
  const [editingAgendaId, setEditingAgendaId] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState('ALL');

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const itineraries = trip?.itineraries || [];

  // Ambil daftar tanggal unik yang ada dari itinerary atau rentang tanggal trip
  const getAvailableDates = () => {
    const datesSet = new Set();
    if (trip?.startDate && trip?.endDate) {
      let curr = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      while (curr <= end) {
        datesSet.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    }
    itineraries.forEach(item => {
      if (item.date) datesSet.add(item.date);
    });
    if (datesSet.size === 0 && trip?.startDate) {
      datesSet.add(trip.startDate);
    }
    return Array.from(datesSet).sort();
  };

  const availableDates = getAvailableDates();

  const handleSelectHour = (h) => {
    const parts = time.split(':');
    const currentMin = parts[1] || '00';
    setTime(`${h}:${currentMin}`);
  };

  const handleSelectMinute = (m) => {
    const parts = time.split(':');
    const currentHour = parts[0] || '08';
    setTime(`${currentHour}:${m}`);
  };

  const currentHourPart = time.split(':')[0] || '08';
  const currentMinutePart = time.split(':')[1] || '00';

  const handleSaveAgenda = async (e) => {
    e.preventDefault();
    if (!activity.trim()) return;

    setLoading(true);
    try {
      const tripRef = doc(db, 'trips', trip.id);

      if (editingAgendaId) {
        const oldAgenda = itineraries.find(item => item.id === editingAgendaId);
        if (oldAgenda) {
          await updateDoc(tripRef, {
            itineraries: arrayRemove(oldAgenda)
          });
        }
      }

      const newAgenda = {
        id: editingAgendaId || Date.now().toString(),
        date: selectedDate,
        time,
        activity,
        location,
        status,
        createdAt: new Date().toISOString()
      };

      await updateDoc(tripRef, {
        itineraries: arrayUnion(newAgenda)
      });

      setActivity('');
      setLocation('');
      setStatus('Belum');
      setEditingAgendaId(null);
    } catch (err) {
      console.error("Gagal menyimpan rundown:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingAgendaId(item.id);
    setSelectedDate(item.date || selectedDate);
    setTime(item.time || '08:00');
    setActivity(item.activity || '');
    setLocation(item.location || '');
    setStatus(item.status || 'Belum');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAgendaId(null);
    setActivity('');
    setLocation('');
    setStatus('Belum');
  };

  const handleToggleStatus = async (item) => {
    try {
      const tripRef = doc(db, 'trips', trip.id);
      
      let nextStatus = 'OTW';
      if (item.status === 'Belum') nextStatus = 'OTW';
      else if (item.status === 'OTW') nextStatus = 'Selesai';
      else nextStatus = 'Belum';

      const updatedAgenda = { ...item, status: nextStatus };

      await updateDoc(tripRef, {
        itineraries: arrayRemove(item)
      });
      await updateDoc(tripRef, {
        itineraries: arrayUnion(updatedAgenda)
      });
    } catch (err) {
      console.error("Gagal mengubah status:", err);
    }
  };

  const handleDeleteAgenda = async (agenda) => {
    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, {
        itineraries: arrayRemove(agenda)
      });
      if (editingAgendaId === agenda.id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error("Gagal hapus rundown:", err);
    }
  };

  const openGoogleMaps = (loc) => {
    if (!loc) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank');
  };

  const renderStatusButton = (st) => {
    switch (st) {
      case 'OTW':
        return (
          <button 
            type="button" 
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm shrink-0"
            title="Ketuk untuk ubah status"
          >
            <Navigation size={12} /> OTW / Meluncur
          </button>
        );
      case 'Selesai':
        return (
          <button 
            type="button" 
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/25 transition-all cursor-pointer shadow-sm shrink-0"
            title="Ketuk untuk ubah status"
          >
            <Check size={12} /> Selesai
          </button>
        );
      default:
        return (
          <button 
            type="button" 
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
            title="Ketuk untuk ubah status"
          >
            <Clock size={12} /> Belum
          </button>
        );
    }
  };

  // Filter itineraries berdasarkan tab hari/tanggal yang aktif
  const filteredItineraries = itineraries
    .filter(item => activeDayTab === 'ALL' || item.date === activeDayTab)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="space-y-4 text-left pb-4">
      
      {/* --- HEADER TITLE --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Compass size={17} className="text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
            Timeline & Rundown Ekspedisi
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Atur jadwal, rute, dan status progress kegiatan per hari.</p>
        </div>
        <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          {itineraries.length} Total Agenda
        </span>
      </div>

      {/* --- FORM INPUT / EDIT INLINE --- */}
      <form onSubmit={handleSaveAgenda} className={`bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border shadow-xl space-y-4 transition-all ${editingAgendaId ? 'border-cyan-500/80 ring-2 ring-cyan-500/20' : 'border-slate-800/90'}`}>
        <div className="flex items-center justify-between px-0.5">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>{editingAgendaId ? 'Edit Agenda (Mode Aktif)' : 'Buat Agenda Baru'}</span>
          </div>
          {editingAgendaId && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="text-[10px] text-rose-400 hover:underline cursor-pointer font-medium"
            >
              Batalkan Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 px-1">Tanggal Kegiatan</label>
                <div className="relative flex items-center bg-slate-950/90 rounded-2xl border border-slate-800/90 hover:border-cyan-500/40 transition-all p-1.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent py-2 px-3 text-xs font-medium text-white focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 px-1">Aktivitas / Kegiatan</label>
                <input 
                  type="text"
                  placeholder="Contoh: Briefing & Berangkat"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 px-1">Lokasi (Opsional)</label>
                  <input 
                    type="text"
                    placeholder="Basecamp / Pos 1"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-2.5 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 px-1">Status Awal</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Belum">Belum</option>
                    <option value="OTW">OTW / Meluncur</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="hidden lg:block pt-1">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-white text-xs font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50 ${editingAgendaId ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-950/50' : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-950/50'}`}
              >
                {editingAgendaId ? <Check size={16} /> : <Plus size={16} />}
                <span>{loading ? 'Menyimpan...' : (editingAgendaId ? 'Perbarui Agenda' : 'Simpan ke Rundown')}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" />
                  <span>Jam Kegiatan</span>
                </span>
                
                <input 
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="08:00"
                  className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-amber-400 font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-semibold px-1">Pilih Cepat Jam</span>
                <div className="grid grid-cols-6 gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentHourPart === h ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase font-semibold px-1">Pilih Cepat Menit</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentMinutePart === m ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="block lg:hidden pt-3">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-white text-xs font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50 ${editingAgendaId ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-950/50' : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-950/50'}`}
              >
                {editingAgendaId ? <Check size={16} /> : <Plus size={16} />}
                <span>{loading ? 'Menyimpan...' : (editingAgendaId ? 'Perbarui Agenda' : 'Simpan ke Rundown')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* --- TAB FILTER PILIH HARI / TANGGAL --- */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pilih Hari / Tanggal Agenda</h4>
          <span className="text-[10px] text-slate-500">Klik hari untuk melihat jadwal spesifik</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveDayTab('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-2 ${
              activeDayTab === 'ALL'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Semua Hari</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeDayTab === 'ALL' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {itineraries.length}
            </span>
          </button>

          {availableDates.map((dateStr, index) => {
            const count = itineraries.filter(i => i.date === dateStr).length;
            const dayName = new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' });

            return (
              <button
                key={dateStr}
                onClick={() => setActiveDayTab(dateStr)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-2 ${
                  activeDayTab === dateStr
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-600/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>Day {index + 1}</span>
                <span className="text-[10px] opacity-75 font-mono font-normal">({dayName}, {dateStr})</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeDayTab === dateStr ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- LIST TIMELINE MEMANJANG (TERFILTER PER HARI) --- */}
      <div className="space-y-3 pt-1">
        {filteredItineraries.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-slate-500 text-xs px-4">
            Belum ada agenda untuk tanggal/hari ini. Yuk buat jadwalnya di atas!
          </div>
        ) : (
          <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-amber-500 before:to-slate-800">
            {filteredItineraries.map((item, index) => (
              <div 
                key={index}
                className={`group relative flex flex-col xl:flex-row xl:items-center justify-between p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border transition-all shadow-xl gap-4 ml-2 ${editingAgendaId === item.id ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-800/90 hover:border-cyan-500/40'}`}
              >
                {/* Titik Node Timeline di Kiri Card */}
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_8px_#22d3ee]" />

                {/* 1. SISI KIRI: Nama Kegiatan & Lokasi */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="text-sm font-bold text-white tracking-wide">
                    {item.activity}
                  </div>
                  
                  {item.location && (
                    <button 
                      type="button"
                      onClick={() => openGoogleMaps(item.location)}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-xl border border-cyan-500/20 transition-all cursor-pointer truncate max-w-full font-medium"
                      title="Buka di Google Maps"
                    >
                      <MapPin size={12} className="shrink-0 text-cyan-400" />
                      <span className="truncate">{item.location}</span>
                    </button>
                  )}
                </div>

                {/* 2. SISI KANAN: HARI, TANGGAL/JAM, STATUS, EDIT/HAPUS */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-800/80 justify-between xl:justify-end">
                  
                  {/* Kotak Tanggal, Hari & Jam */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/90 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 font-mono">
                      <Calendar size={13} className="text-cyan-400" />
                      <span>
                        {item.date ? `${new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long' })}, ${item.date}` : item.date}
                      </span>
                    </div>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                      <Clock size={13} />
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* Tombol Status Interaktif */}
                  <div onClick={() => handleToggleStatus(item)} className="shrink-0">
                    {renderStatusButton(item.status)}
                  </div>

                  {/* Tombol Edit & Hapus */}
                  <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button 
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer"
                      title="Edit Cepat di Form Atas"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleDeleteAgenda(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}