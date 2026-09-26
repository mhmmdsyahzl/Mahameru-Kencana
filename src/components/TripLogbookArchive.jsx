import React, { useState } from 'react';
import { 
  Award, Archive, CheckCircle2, MapPin, Image as ImageIcon, Upload, X, 
  Trophy, Shield, BookOpen, Star, Mountain, Bike, Zap, Camera, Tent, Compass, Flag, Lock, Check, Crown, Flame, Info, Eye, Users, Calendar
} from 'lucide-react';

const calculateUserLevel = (totalExp) => {
  if (totalExp >= 6500) return { level: 5, tier: "Conqueror", title: "Legendary Overlord 👑" };
  if (totalExp >= 5000) return { level: 5, tier: "Ace", title: "Expedition Commander 🦅" };
  if (totalExp >= 3801) return { level: 4, tier: "Crown", title: "Master Pathfinder 🛡️" };
  if (totalExp >= 3000) return { level: 4, tier: "Platinum", title: "Elite Vanguard ⚡" };
  if (totalExp >= 1500) return { level: 3, tier: "Gold", title: "Seasoned Adventurer 🏔️" };
  if (totalExp >= 600) return { level: 2, tier: "Silver", title: "Rookie Explorer 🧭" };
  return { level: 1, tier: "Bronze", title: "Basecamp Wanderer 🥾" };
};

const pubgTiersInfo = [
  { tier: "Conqueror", exp: "6,500+ Total EXP", title: "Legendary Overlord 👑", desc: "Penguasa mutlak Leaderboard! Legenda hidup genk penjelajah." },
  { tier: "Ace", exp: "5,000 - 6,499 Total EXP", title: "Expedition Commander 🦅", desc: "Elit penjelajah top dengan mental baja di segala medan ekstrem." },
  { tier: "Crown", exp: "3,801 - 4,999 Total EXP", title: "Master Pathfinder 🛡️", desc: "Senior jalur andalan tim sebagai Navigator atau Leader." },
  { tier: "Platinum", exp: "3,000 - 3,800 Total EXP", title: "Elite Vanguard ⚡", desc: "Anggota konsisten dengan jam terbang ekspedisi yang solid." },
  { tier: "Gold", exp: "1,500 - 2,999 Total EXP", title: "Seasoned Adventurer 🏔️", desc: "Penjelajah tangguh penembus grade gunung menengah & touring." },
  { tier: "Silver", exp: "600 - 1,499 Total EXP", title: "Rookie Explorer 🧭", desc: "Mulai terbiasa dengan medan lumpur dan tenda basecamp." },
  { tier: "Bronze", exp: "0 - 599 Total EXP", title: "Basecamp Wanderer 🥾", desc: "Petualang pemula yang baru merintis ekspedisi pertamanya." }
];

// Helper untuk format tanggal dengan Nama Hari (Contoh: Kamis, 24 September 2026)
const formatReadableDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

export default function TripLogbookArchive({ trips, allUsers, currentUser, onToggleArchive, onUploadPhoto, onDeletePhoto, onPreviewImage, onSaveJournal }) {
  const [activeSubTab, setActiveSubTab] = useState('leaderboard'); // 'leaderboard' | 'archive' | 'logbook' | 'badges'
  const [editingJournalTripId, setEditingJournalTripId] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState(null);
  const [showTierInfoModal, setShowTierInfoModal] = useState(false);
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState(null);

  // 1. Kalkulasi HANYA dari Trip yang berstatus 'archived' (Mission Accomplished)
  const userConqueredTrips = trips.filter(t => t.status === 'archived' && t.members?.some(m => m.uid === currentUser?.uid));
  const totalUserExp = userConqueredTrips.reduce((sum, t) => sum + (Number(t.expReward) || 100), 0);
  const userInfoLevel = calculateUserLevel(totalUserExp);

  const climbingTripsCount = userConqueredTrips.filter(t => t.activityType === 'climbing' || t.activityType === 'both').length;
  const ridingTripsCount = userConqueredTrips.filter(t => t.activityType === 'riding').length;
  const bothTripsCount = userConqueredTrips.filter(t => t.activityType === 'both').length;
  const totalPhotosUploaded = userConqueredTrips.reduce((sum, t) => sum + (t.photos?.filter(p => p.uploadedBy === currentUser?.displayName)?.length || 0), 0);
  
  const isMedicOrLogistics = userConqueredTrips.some(t => {
    const mem = t.members?.find(m => m.uid === currentUser?.uid);
    const roles = Array.isArray(mem?.role) ? mem.role : [mem?.role];
    return roles.includes('Medical Officer') || roles.includes('Logistics Officer');
  });

  const isNavigatorRole = userConqueredTrips.some(t => {
    const mem = t.members?.find(m => m.uid === currentUser?.uid);
    const roles = Array.isArray(mem?.role) ? mem.role : [mem?.role];
    return roles.includes('Navigator/Map Reader');
  });

  const createdTripsCount = trips.filter(t => t.creatorUid === currentUser?.uid).length;
  const archivedTripsCount = userConqueredTrips.length;

  const unlockedBadges = [
    { 
      id: 'peak', name: 'The Peak Hunter', icon: Mountain, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', 
      desc: 'Menyelesaikan minimal 3 trip pendakian gunung.', current: climbingTripsCount, target: 3, unlocked: climbingTripsCount >= 3 
    },
    { 
      id: 'ironbutt', name: 'Iron Butt', icon: Bike, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30', 
      desc: 'Menyelesaikan minimal 3 trip riding / touring.', current: ridingTripsCount, target: 3, unlocked: ridingTripsCount >= 3 
    },
    { 
      id: 'allterrain', name: 'All-Terrain Explorer', icon: Zap, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', 
      desc: 'Mengikuti trip kombinasi Pendakian & Riding sekaligus.', current: bothTripsCount >= 1 || (climbingTripsCount > 0 && ridingTripsCount > 0) ? 1 : 0, target: 1, unlocked: bothTripsCount >= 1 || (climbingTripsCount > 0 && ridingTripsCount > 0) 
    },
    { 
      id: 'guardian', name: 'The Guardian', icon: Shield, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30', 
      desc: 'Pernah mengemban tugas sebagai Medical atau Logistics Officer.', current: isMedicOrLogistics ? 1 : 0, target: 1, unlocked: isMedicOrLogistics 
    },
    { 
      id: 'legend', name: 'Pathfinder Elite', icon: Trophy, color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30', 
      desc: 'Total akumulasi EXP penjelajahan menembus 3,000+.', current: totalUserExp, target: 3000, unlocked: totalUserExp >= 3000 
    },
    { 
      id: 'photographer', name: 'Memory Keeper', icon: Camera, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30', 
      desc: 'Mengunggah total minimal 5 foto galeri keseruan.', current: totalPhotosUploaded, target: 5, unlocked: totalPhotosUploaded >= 5 
    },
    { 
      id: 'master', name: 'Basecamp Master', icon: Tent, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30', 
      desc: 'Ikut serta dalam minimal 5 trip ekspedisi selesai.', current: userConqueredTrips.length, target: 5, unlocked: userConqueredTrips.length >= 5 
    },
    { 
      id: 'navigator', name: 'Pathfinder Navigator', icon: Compass, color: 'text-teal-400 bg-teal-500/15 border-teal-500/30', 
      desc: 'Pernah memegang peran sebagai Navigator/Map Reader tim.', current: isNavigatorRole ? 1 : 0, target: 1, unlocked: isNavigatorRole 
    },
    { 
      id: 'creator', name: 'Expedition Creator', icon: Flag, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30', 
      desc: 'Pernah membuat perencanaan trip baru sebagai pembuat.', current: createdTripsCount, target: 1, unlocked: createdTripsCount >= 1 
    },
    { 
      id: 'accomplished', name: 'Mission Accomplished', icon: Award, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30', 
      desc: 'Menyelesaikan minimal 2 trip hingga status arsip.', current: archivedTripsCount, target: 2, unlocked: archivedTripsCount >= 2 
    }
  ];

  // 2. Kalkulasi Leaderboard Global berdasarkan Trip Arsip
  const leaderboardData = allUsers.map(user => {
    const userConquered = trips.filter(t => t.status === 'archived' && t.members?.some(m => m.uid === user.uid));
    const userExp = userConquered.reduce((sum, t) => sum + (Number(t.expReward) || 100), 0);
    const userLevelInfo = calculateUserLevel(userExp);
    return {
      ...user,
      totalExp: userExp,
      tier: userLevelInfo.tier,
      title: userLevelInfo.title,
      tripsCount: userConquered.length
    };
  }).sort((a, b) => b.totalExp - a.totalExp);

  const filteredTrips = trips.filter(t => {
    if (activeSubTab === 'archive') return t.status === 'archived';
    return t.status !== 'archived';
  });

  return (
    <div className="space-y-6 text-left">
      {/* --- LEVELING PETUALANG & STATS CARD --- */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-6">
        
        {/* Atas: Info Profil Tier, Total EXP & Tombol Info Rank */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
              <Crown size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-xl border border-amber-500/30 uppercase">Tier: {userInfoLevel.tier}</span>
                <span className="text-xs font-bold text-amber-400 font-mono">⚡ {totalUserExp} Total EXP</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{userInfoLevel.title}</h3>
              <p className="text-xs text-slate-400">Push rank ekspedisi dengan menyelesaikan trip di menu arsip.</p>
            </div>
          </div>

          <button 
            onClick={() => setShowTierInfoModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-2xl cursor-pointer shadow-md transition-all self-stretch sm:self-auto justify-center"
          >
            <Info size={14}/> Info Jenjang Rank
          </button>
        </div>

        {/* Bawah: Tombol Tab Navigasi iOS Premium Style (Responsif 2 Kolom di HP) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800/80 shadow-inner">
          <button 
            onClick={() => setActiveSubTab('leaderboard')} 
            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeSubTab === 'leaderboard' 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy size={14} className={activeSubTab === 'leaderboard' ? 'text-amber-400' : 'text-slate-400'}/> Leaderboard
          </button>

          <button 
            onClick={() => setActiveSubTab('archive')} 
            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeSubTab === 'archive' 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Archive size={14} className={activeSubTab === 'archive' ? 'text-blue-400' : 'text-slate-400'}/> Arsip ({trips.filter(t => t.status === 'archived').length})
          </button>

          <button 
            onClick={() => setActiveSubTab('logbook')} 
            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeSubTab === 'logbook' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 size={14} className={activeSubTab === 'logbook' ? 'text-emerald-400' : 'text-slate-400'}/> Logbook ({userConqueredTrips.length})
          </button>

          <button 
            onClick={() => setActiveSubTab('badges')} 
            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeSubTab === 'badges' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Star size={14} className={activeSubTab === 'badges' ? 'text-purple-400' : 'text-slate-400'}/> Badges ({unlockedBadges.filter(b => b.unlocked).length}/10)
          </button>
        </div>

      </div>

      {/* --- MODAL INFO JENJANG RANK --- */}
      {showTierInfoModal && (
        <div onClick={() => setShowTierInfoModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Crown size={16} className="text-amber-400"/> Daftar Tier & Syarat EXP Petualang</h3>
              <button onClick={() => setShowTierInfoModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
            </div>

            <div className="space-y-3 pt-1">
              {pubgTiersInfo.map((tInfo, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tier {tInfo.tier}</span>
                      <span className="text-[10px] text-slate-400">• {tInfo.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{tInfo.desc}</p>
                  </div>
                  <div className="w-full sm:w-auto text-left sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                    <span className="text-xs font-mono font-bold text-emerald-400">{tInfo.exp}</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setShowTierInfoModal(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-lg mt-2">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL TRIP ARSIP --- */}
      {selectedArchiveDetail && (
        <div onClick={() => setSelectedArchiveDetail(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Archive size={16} className="text-amber-400"/> Detail Arsip Ekspedisi</h3>
              <button onClick={() => setSelectedArchiveDetail(null)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-xl border border-amber-500/30">+{selectedArchiveDetail.expReward || 100} EXP Reward</span>
                <h4 className="text-base font-bold text-white mt-1">{selectedArchiveDetail.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><MapPin size={12} className="text-emerald-400"/> {selectedArchiveDetail.departureCity} ➔ {selectedArchiveDetail.destinations?.join(' ➔ ')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Jenis Aktivitas</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedArchiveDetail.activityType === 'both' ? 'Daki & Riding ⚡' : 
                     selectedArchiveDetail.activityType === 'riding' ? 'Riding / Touring 🏍️' : 'Pendakian Gunung 🏔️'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Moda Transportasi</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedArchiveDetail.vehicle === 'motor' ? 'Sepeda Motor 🏍️' : 
                     selectedArchiveDetail.vehicle === 'car' ? 'Mobil / Rental 🚗' : 'Angkutan Umum 🚌'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Tipe Trip</span>
                  <span className="text-xs font-semibold text-white">{selectedArchiveDetail.tripType || 'Group'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Tanggal Selesai</span>
                  <span className="text-xs font-mono font-semibold text-white">{formatReadableDate(selectedArchiveDetail.startDate)}</span>
                </div>
              </div>

              {/* Anggota Tim yang Ikut */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Users size={13}/> Anggota Tim ({selectedArchiveDetail.members?.length || 0}):</h5>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedArchiveDetail.members?.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img src={m.avatar || "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=100"} alt="Avatar" className="w-7 h-7 rounded-xl object-cover" />
                        <span className="text-xs font-bold text-white">{m.displayName || 'Anggota'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-medium">Selesai ✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedArchiveDetail(null)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-lg">
              Tutup Detail
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL BADGE (iOS STYLE) --- */}
      {selectedBadgeDetail && (
        <div onClick={() => setSelectedBadgeDetail(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Trophy size={16} className="text-amber-400"/> Detail Misi Achievement</h3>
              <button onClick={() => setSelectedBadgeDetail(null)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 py-2">
              <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center shadow-xl ${selectedBadgeDetail.unlocked ? selectedBadgeDetail.color : 'bg-slate-950 text-slate-600 border-slate-800'}`}>
                <selectedBadgeDetail.icon size={32} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{selectedBadgeDetail.name}</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{selectedBadgeDetail.desc}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Status Misi:</span>
                <span className={`font-bold ${selectedBadgeDetail.unlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedBadgeDetail.unlocked ? 'Selesai (Completed 🏆)' : 'Dalam Proses (In Progress ⏳)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Progress:</span>
                <span className="font-mono font-bold text-white">{selectedBadgeDetail.current} / {selectedBadgeDetail.target}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 mt-1">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (selectedBadgeDetail.current / selectedBadgeDetail.target) * 100)}%` }}
                ></div>
              </div>
            </div>

            <button onClick={() => setSelectedBadgeDetail(null)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-lg">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* --- KONTEN BERDASARKAN SUB-TAB --- */}
      {activeSubTab === 'leaderboard' ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
            <Trophy size={15} className="text-amber-400"/> Global Leaderboard Rank Petualang
          </h3>
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {leaderboardData.map((user, index) => (
                <div key={user.uid || index} className="p-4 flex items-center justify-between gap-3 transition-colors hover:bg-slate-850">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${index === 0 ? 'bg-amber-500 text-slate-950' : index === 1 ? 'bg-slate-300 text-slate-950' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      #{index + 1}
                    </div>
                    <img src={user.avatar || "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=100"} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="truncate">{user.displayName || user.username || 'Petualang'}</span> 
                        {user.uid === currentUser?.uid && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0">Anda</span>}
                      </h4>
                      <p className="text-xs text-slate-400">{user.title} • {user.tripsCount} Trip Selesai</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-amber-400 font-mono block">⚡ {user.totalExp} EXP</span>
                    <span className="block text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Tier {user.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeSubTab === 'badges' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
              <Star size={15} className="text-amber-400"/> 10 Badge Achievement & Misi Petualang Anda
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Klik badge untuk melihat detail progress</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {unlockedBadges.map((badge, idx) => {
              const IconComponent = badge.icon;
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedBadgeDetail(badge)}
                  className={`p-4 rounded-3xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer hover:scale-[1.02] shadow-xl ${
                    badge.unlocked 
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-amber-500/5' 
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${badge.unlocked ? badge.color : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                    <IconComponent size={26}/>
                  </div>
                  <div className="min-w-0 w-full space-y-1">
                    <p className="text-xs font-bold text-white truncate">{badge.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{badge.desc}</p>
                    <div className="pt-1">
                      {badge.unlocked ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 inline-block">Unlocked ✓</span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 flex items-center justify-center gap-1"><Lock size={10}/> Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeSubTab === 'logbook' ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400"/> Logbook & Jurnal Perjalanan Saya ({userConqueredTrips.length})
          </h3>
          {userConqueredTrips.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-900/50 rounded-3xl border border-slate-800">Belum ada riwayat trip yang diselesaikan di arsip.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userConqueredTrips.map(trip => (
                <div key={trip.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Header Card: EXP dan Tanggal Berjejer Rapi di Kiri-Kanan */}
                    <div className="flex justify-between items-center gap-3">
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/25">+{trip.expReward || 100} EXP</span>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                        <Calendar size={13} className="text-cyan-400"/>
                        <span>{formatReadableDate(trip.startDate)}</span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white">{trip.title}</h4>
                    <p className="text-xs text-slate-300 flex items-start gap-1.5">
                      <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5"/> 
                      <span className="leading-relaxed">{trip.departureCity} ➔ {trip.destinations?.join(' ➔ ')}</span>
                    </p>
                    
                    {/* Catatan Jurnal / Diary Trip */}
                    <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5"><BookOpen size={13}/> Jurnal / Catatan Pribadi:</p>
                      {editingJournalTripId === trip.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Tulis kesan-pesan atau catatan perjalanan di sini..." className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500" rows="2" />
                          <div className="flex gap-2">
                            <button onClick={() => { onSaveJournal(trip.id, journalText); setEditingJournalTripId(null); }} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer">Simpan</button>
                            <button onClick={() => setEditingJournalTripId(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer">Batal</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs text-slate-300 italic leading-relaxed">{trip.journalNotes || "Belum ada catatan jurnal untuk trip ini."}</p>
                          <button onClick={() => { setEditingJournalTripId(trip.id); setJournalText(trip.journalNotes || ''); }} className="text-xs font-semibold text-emerald-400 hover:underline shrink-0 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">Edit</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                    <span>Status: <strong className="text-emerald-400">Mission Accomplished 🏆</strong></span>
                    <span className="font-semibold text-slate-300">{trip.members?.length || 1} Anggota</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Arsip Trip (Mission Accomplished)</h3>
          {filteredTrips.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-900/50 rounded-3xl border border-slate-800">Belum ada trip yang diarsipkan.</p>
          ) : (
            filteredTrips.map(trip => {
              const isCreator = trip.creatorUid === currentUser?.uid;
              const isMember = trip.members?.some(m => m.uid === currentUser?.uid);

              return (
                <div key={trip.id} className="bg-slate-900/85 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  
                  {/* Layout 2 Baris yang Rapi & Proporsional untuk Laptop & HP */}
                  <div className="space-y-4 border-b border-slate-800/80 pb-4">
                    
                    {/* BARIS ATAS: Badge EXP & Mission Accomplished di Kiri, Tanggal di Kanan */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/25">+{trip.expReward || 100} EXP</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40">Mission Accomplished 🏆</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 shadow-inner">
                        <Calendar size={14} className="text-cyan-400"/>
                        <span>{formatReadableDate(trip.startDate)}</span>
                      </div>
                    </div>

                    {/* BARIS BAWAH: Judul & Rute di Kiri, Tombol Aksi di Kanan */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1 flex-1">
                        <h4 className="text-lg font-bold text-white">{trip.title}</h4>
                        <p className="text-xs text-slate-300 flex items-start gap-1.5">
                          <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5"/> 
                          <span className="leading-relaxed">{trip.departureCity} ➔ {trip.destinations?.join(' ➔ ')}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button onClick={() => setSelectedArchiveDetail(trip)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-2xl cursor-pointer shadow-md transition-all flex-1 md:flex-none">
                          <Eye size={14}/> Detail Arsip
                        </button>
                        {isCreator && (
                          <button onClick={() => onToggleArchive(trip)} className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold rounded-2xl cursor-pointer shadow-md transition-all flex-1 md:flex-none text-center">
                            Buka Arsip
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Galeri Foto Keseruan */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4.5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <ImageIcon size={15}/> Galeri Keseruan Trip ({trip.photos?.length || 0}/5 Foto)
                      </h5>
                      {isMember && (trip.photos?.length || 0) < 5 && (
                        <label className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md transition-all">
                          <Upload size={13}/> Upload Foto
                          <input type="file" accept="image/*" onChange={(e) => onUploadPhoto(trip, e)} className="hidden" />
                        </label>
                      )}
                    </div>
                    {(!trip.photos || trip.photos.length === 0) ? (
                      <p className="text-xs text-slate-500 italic py-2">Belum ada dokumentasi foto (Maks 5 foto, batasan 5MB/foto).</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                        {trip.photos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square shadow-md">
                            <img src={photo.url} alt="Trip Doc" onClick={() => onPreviewImage(photo.url)} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" />
                            {isCreator && (
                              <button onClick={() => onDeletePhoto(trip, pIdx)} className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg">
                                <X size={12}/>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}