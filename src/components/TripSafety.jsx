import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  ShieldAlert, PhoneCall, HeartPulse, ExternalLink, 
  Stethoscope, Plus, Trash2, Edit3, Save, Sparkles, Activity, BellRing, X, AlertTriangle
} from 'lucide-react';
import { db } from '../firebase/config';
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

const MONKEY_AVATAR = 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=100&auto=format&fit=crop&q=80';

export default function TripSafety({ trip, currentUser }) {
  const [usersProfileMap, setUsersProfileMap] = useState({});
  
  const [isEditingMyMedical, setIsEditingMyMedical] = useState(false);
  const [myBloodType, setMyBloodType] = useState('O');
  const [myMedicalHistory, setMyMedicalHistory] = useState('');
  const [myEmergencyName, setMyEmergencyName] = useState('');
  const [myEmergencyRelation, setMyEmergencyRelation] = useState('Orang Tua');
  const [myEmergencyPhone, setMyEmergencyPhone] = useState('');
  const [myBpjs, setMyBpjs] = useState('');

  const [isAddingEmergency, setIsAddingEmergency] = useState(false);
  const [newEcName, setNewEcName] = useState('');
  const [newEcCategory, setNewEcCategory] = useState('SAR');
  const [newEcPhone, setNewEcPhone] = useState('');
  const [newEcLocation, setNewEcLocation] = useState('');

  // State Modal Konfirmasi Hapus & Toast Mandiri
  const [deleteIndexTarget, setDeleteIndexTarget] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const map = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id;
        const uid = data.uid || docId;
        
        map[uid] = data;
        map[docId] = data;
        if (data.email) map[data.email] = data;
        if (data.username) map[data.username.toLowerCase()] = data;
      });
      setUsersProfileMap(map);
    }, (err) => {
      console.error('Gagal mendengarkan perubahan profil user:', err);
    });

    return () => unsubscribe();
  }, []);

  const emergencyContacts = trip?.emergencyContacts || [
    { name: 'SAR / Basarnas Siaga', category: 'SAR', phone: '+6281112345678', location: 'Posko Utama' },
    { name: 'Pos Jaga Jalur Pendakian', category: 'Pos Jaga', phone: '+6281298765432', location: 'Basecamp Pendakian' },
    { name: 'RSUD Terdekat', category: 'Rumah Sakit', phone: '+6281355557777', location: 'Kota Terdekat' }
  ];

  const members = trip?.members || [];
  const myProfile = usersProfileMap[currentUser?.uid] || currentUser || {};

  const getMedicalRecommendation = (history) => {
    const cond = (history || '').toLowerCase().trim();

    if (!cond || cond === 'tidak ada' || cond.includes('sehat') || cond.includes('aman') || cond === '-') {
      return { 
        action: 'Kondisi stabil, jaga hidrasi, pola makan teratur, dan stamina fisik.', 
        meds: 'Vitamin C, Air Mineral, Elektrolit (Oralit)' 
      };
    }

    if (cond.includes('sakit hati') || cond.includes('galau') || cond.includes('beban hidup') || cond.includes('overthinking') || cond.includes('sedih')) {
      return {
        action: 'HEALING BRO!! Gas Touring, Daki Gunung, atau ngopi santai bareng temen biar gak overthinking.',
        meds: 'Secangkir Kopi Hitam, Playlist Musik, & Healing ke Alam Bebas'
      };
    }

    if (cond.includes('asma') || cond.includes('sesak') || cond.includes('nafas') || cond.includes('bronkitis')) {
      return { 
        action: 'Istirahat di tempat teduh, atur pernapasan lambat, hindari udara dingin ekstrem dan kelelahan berlebih.', 
        meds: 'Inhaler Salbutamol, Oksigen Portable, Ventolin' 
      };
    }

    if (cond.includes('maag') || cond.includes('lambung') || cond.includes('gerd') || cond.includes('asam') || cond.includes('perut') || cond.includes('mual')) {
      return { 
        action: 'Makan tepat waktu, hindari makanan asam/pedas berlebih dan kopi saat perut kosong. Sedia air hangat.', 
        meds: 'Antasida (Promag/Polychrolan), Omeprazole' 
      };
    }

    if (cond.includes('vertigo') || cond.includes('pusing') || cond.includes('migrain') || cond.includes('kepala')) {
      return { 
        action: 'Segera duduk atau berbaring di tempat tenang dan redup, hindari gerakan kepala secara mendadak.', 
        meds: 'Dimenhydrinate, Paracetamol / Ibuprofen' 
      };
    }

    if (cond.includes('biang keringat') || cond.includes('kulit') || cond.includes('alergi') || cond.includes('gatal')) {
      return { 
        action: 'Gunakan pakaian menyerap keringat, ganti baju berkala saat istirahat, hindari pemicu alergi.', 
        meds: 'Bedak Salicyl, Salep Anti-iritasi / Cetirizine' 
      };
    }

    if (cond.includes('jantung') || cond.includes('darah tinggi') || cond.includes('hipertensi')) {
      return {
        action: 'Hindari aktivitas fisik terlalu berat yang memacu detak jantung drastis. Pantau tensi secara berkala.',
        meds: 'Obat Rutin Pribadi (Amlodipine/Captopril)'
      };
    }

    if (cond.includes('sendi') || cond.includes('asam urat') || cond.includes('rematik') || cond.includes('engkel') || cond.includes('lutut') || cond.includes('cedera')) {
      return {
        action: 'Gunakan deker pelindung sendi jika perjalanan jauh atau mendaki, hindari beban berlebih.',
        meds: 'Natrium Diklofenak, Krim Pereda Nyeri (Salonpas/Counterpain)'
      };
    }

    return { 
      action: `Pantau kondisi berkala terkait riwayat (${history}), istirahat cukup, dan lapor tim medis.`, 
      meds: 'P3K Standar, Analgesik / Paracetamol, Obat Pribadi' 
    };
  };

  const handleWhatsApp = (phone, text) => {
    if (!phone || phone === '-') return;
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSaveMyMedicalData = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        bloodType: myBloodType,
        medicalHistory: myMedicalHistory,
        emergencyName: myEmergencyName,
        emergencyRelation: myEmergencyRelation,
        emergencyPhone: myEmergencyPhone,
        bpjsNumber: myBpjs
      };

      await updateDoc(userRef, updatedData).catch(() => {});

      if (trip?.id) {
        const updatedMembers = members.map(item => {
          if (item.uid === currentUser.uid) {
            return { ...item, ...updatedData };
          }
          return item;
        });

        const tripRef = doc(db, 'trips', trip.id);
        await updateDoc(tripRef, { members: updatedMembers });
      }

      setIsEditingMyMedical(false);
      showToast('Data profil darurat berhasil diperbarui! 🚀');
    } catch (error) {
      console.error('Gagal menyimpan data medis:', error);
      showToast('Gagal menyimpan ke database.');
    }
  };

  const handleAddEmergencyContact = async (e) => {
    e.preventDefault();
    if (!trip?.id) return;
    try {
      const newContact = { name: newEcName, category: newEcCategory.trim() || 'Darurat', phone: newEcPhone, location: newEcLocation };
      const updatedContacts = [...emergencyContacts, newContact];
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { emergencyContacts: updatedContacts });
      setNewEcName('');
      setNewEcPhone('');
      setNewEcLocation('');
      setNewEcCategory('SAR');
      setIsAddingEmergency(false);
      showToast('Kontak darurat berhasil ditambahkan!');
    } catch (error) {
      console.error('Gagal menambah kontak:', error);
    }
  };

  const confirmDeleteEmergencyContact = async () => {
    if (deleteIndexTarget === null || !trip?.id) return;
    try {
      const updatedContacts = emergencyContacts.filter((_, idx) => idx !== deleteIndexTarget);
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { emergencyContacts: updatedContacts });
      setDeleteIndexTarget(null);
      showToast('Kontak darurat berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus:', error);
      showToast('Gagal menghapus kontak.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8 text-left relative">
      
      {/* Header Elegan Bergaya Glassmorphism Modern */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-1">
              <Activity size={10} /> Protocol Aktif
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">Safety & Emergency Protocol</h2>
          </div>
        </div>

        {!isEditingMyMedical && (
          <button
            onClick={() => {
              setMyBloodType(myProfile.bloodType || 'O');
              setMyMedicalHistory(myProfile.medicalHistory || myProfile.medicalNote || '');
              setMyEmergencyName(myProfile.emergencyName || '');
              setMyEmergencyRelation(myProfile.emergencyRelation || 'Orang Tua');
              setMyEmergencyPhone(myProfile.emergencyPhone || '');
              setMyBpjs(myProfile.bpjsNumber || '');
              setIsEditingMyMedical(true);
            }}
            className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer shrink-0 border border-emerald-400/20"
          >
            <Edit3 size={14} className="transition-transform group-hover:scale-110" /> 
            <span>Update Medis Saya</span>
          </button>
        )}
      </div>

      {/* Form Inline Update Profil Medis */}
      {isEditingMyMedical && (
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-xs animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles size={16} />
              <h3 className="uppercase tracking-wider">Form Data Medis & Darurat</h3>
            </div>
            <button onClick={() => setIsEditingMyMedical(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-slate-400 block mb-1.5 font-semibold">Golongan Darah:</label>
              <select value={myBloodType} onChange={(e)=>setMyBloodType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500">
                {['A', 'B', 'AB', 'O', 'A+', 'B+', 'O+', 'AB+', '-'].map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1.5 font-semibold">Nomor BPJS:</label>
              <input 
                type="text" value={myBpjs} onChange={(e) => setMyBpjs(e.target.value)}
                placeholder="******"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-mono focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1.5 font-semibold">Riwayat Penyakit (Contoh: Maag, Demam, Asma):</label>
              <input 
                type="text" value={myMedicalHistory} onChange={(e) => setMyMedicalHistory(e.target.value)}
                placeholder="Tidak ada / Tulis kondisi Anda"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1.5 font-semibold">Nama Kontak Darurat:</label>
              <input 
                type="text" value={myEmergencyName} onChange={(e) => setMyEmergencyName(e.target.value)}
                placeholder="Nama"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1.5 font-semibold">Hubungan:</label>
              <select value={myEmergencyRelation} onChange={(e)=>setMyEmergencyRelation(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500">
                {['Orang Tua', 'Saudara Kandung', 'Pasangan', 'Teman', 'Lainnya'].map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1.5 font-semibold">No. HP Kontak Darurat:</label>
              <input 
                type="text" value={myEmergencyPhone} onChange={(e) => setMyEmergencyPhone(e.target.value)}
                placeholder="************"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-mono focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button onClick={handleSaveMyMedicalData} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30">
              <Save size={14} /> Simpan
            </button>
            <button onClick={() => setIsEditingMyMedical(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl cursor-pointer">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* 1. KONTROL CEPAT: REKAP MEDIS SELURUH ANGGOTA */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <HeartPulse size={16} className="text-rose-400 animate-pulse" /> 
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rekap Medis & Kontak Tim ({members.length} Orang)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((m, idx) => {
            const userDoc = usersProfileMap[m.uid] || usersProfileMap[m.email] || usersProfileMap[m.username?.toLowerCase()] || m;
            
            const memberName = userDoc.displayName || userDoc.name || m.displayName || m.name || 'Anggota Trip';
            const rawAvatar = userDoc.avatar || m.avatar;
            const memberAvatar = (!rawAvatar || rawAvatar.includes("53994a69daeb")) ? MONKEY_AVATAR : rawAvatar;
            
            const bloodType = userDoc.bloodType || m.bloodType || 'Tidak Tahu';
            const medicalHistory = userDoc.medicalHistory || m.medicalHistory || userDoc.medicalNote || m.medicalNote || 'Tidak ada';
            const bpjsNumber = userDoc.bpjsNumber || m.bpjsNumber || '-';
            
            const emName = userDoc.emergencyName || m.emergencyName || '';
            const emRel = userDoc.emergencyRelation || m.emergencyRelation || 'Orang Tua';
            const emPhone = userDoc.emergencyPhone || m.emergencyPhone || '';
            
            const hasEmergency = emName && emName !== '-';
            const emergencyText = hasEmergency ? `${emName} (${emRel}) - ${emPhone}` : 'Belum diatur';

            const recommendation = getMedicalRecommendation(medicalHistory);
            const isMe = m.uid === currentUser?.uid;

            return (
              <div 
                key={m.uid || idx}
                className="group relative bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 border border-slate-800/90 rounded-3xl p-4.5 space-y-4 shadow-xl hover:border-emerald-500/40 transition-all duration-300"
              >
                {/* Header Kartu Anggota */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={memberAvatar} 
                      alt={memberName}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{memberName}</h4>
                        {isMe && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Saya</span>}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{Array.isArray(m.role) ? m.role[0] : (m.role || 'Member')}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="text-xs px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 font-bold font-mono tracking-wide shadow-inner">
                      Darah: {bloodType}
                    </span>
                  </div>
                </div>

                {/* Detail Informasi Medis & Kontak */}
                <div className="grid grid-cols-1 gap-2 text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 shadow-inner">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 font-medium shrink-0">Medis:</span>
                    <span className="text-amber-400 font-bold text-right uppercase tracking-wide">{medicalHistory}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 font-medium shrink-0">BPJS:</span>
                    <span className="text-slate-300 font-mono text-right">{bpjsNumber}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-900">
                    <span className="text-slate-400 font-medium shrink-0">Darurat:</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white truncate max-w-[160px] font-medium">{emergencyText}</span>
                      {hasEmergency && (
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(emPhone, `DARURAT KELUARGA: Mengabarkan kondisi ${memberName} dalam ekspedisi.`)}
                          className="p-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl cursor-pointer shrink-0 border border-emerald-500/30 transition-all"
                          title="WhatsApp Kontak Darurat"
                        >
                          <ExternalLink size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kotak Rekomendasi Obat & Aksi Penanganan Modern */}
                <div className="relative overflow-hidden p-3.5 bg-gradient-to-r from-emerald-950/30 via-teal-950/20 to-slate-950/40 border border-emerald-500/30 rounded-2xl space-y-1.5 text-xs shadow-lg">
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-wide">
                    <Stethoscope size={14} />
                    <span>Penanganan & Rekomendasi Obat:</span>
                  </div>
                  <div className="text-slate-300 space-y-1 text-[11px] leading-relaxed">
                    <p><strong className="text-white font-semibold">Aksi:</strong> {recommendation.action}</p>
                    <p><strong className="text-white font-semibold">Obat:</strong> <span className="text-emerald-300 font-mono">{recommendation.meds}</span></p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 2. KONTAK DARURAT & INSTANSI (SAR / POS JAGA / RS) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <PhoneCall size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kontak Darurat & Pos Siaga</h3>
          </div>
          <button
            onClick={() => setIsAddingEmergency(!isAddingEmergency)}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus size={14} /> Tambah Kontak
          </button>
        </div>

        {isAddingEmergency && (
          <form onSubmit={handleAddEmergencyContact} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 text-xs shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="font-bold text-white text-sm">Tambah Kontak Darurat Baru</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Nama" value={newEcName} onChange={(e)=>setNewEcName(e.target.value)} required className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500" />
              
              {/* KATEGORI: BISA PILIH DARI SUGGESTION ATAU KETIK BEBAS */}
              <div className="space-y-1">
                <input 
                  type="text" 
                  list="category-suggestions"
                  placeholder="Kategori (SAR / Pos Jaga / Ketik Bebas)" 
                  value={newEcCategory} 
                  onChange={(e)=>setNewEcCategory(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500" 
                />
                <datalist id="category-suggestions">
                  <option value="SAR" />
                  <option value="Pos Jaga" />
                  <option value="Rumah Sakit" />
                  <option value="Kepolisian" />
                  <option value="Warga Lokal" />
                  <option value="Guide / Porter" />
                </datalist>
              </div>

              <input type="text" placeholder="Nomor" value={newEcPhone} onChange={(e)=>setNewEcPhone(e.target.value)} required className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-mono focus:border-emerald-500" />
              <input type="text" placeholder="Lokasi (Contoh: Basecamp)" value={newEcLocation} onChange={(e)=>setNewEcLocation(e.target.value)} required className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500" />
            </div>
            <div className="flex gap-2.5 pt-2">
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold cursor-pointer shadow-md">Simpan</button>
              <button type="button" onClick={()=>setIsAddingEmergency(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold cursor-pointer">Batal</button>
            </div>
          </form>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {emergencyContacts.map((ec, idx) => (
            <div key={idx} className="group bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 border border-slate-800/90 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl hover:border-emerald-500/40 transition-all">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">{ec.category}</span>
                  <button onClick={() => setDeleteIndexTarget(idx)} className="text-slate-600 hover:text-rose-400 cursor-pointer p-1 transition-colors"><Trash2 size={13} /></button>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white pt-1">{ec.name}</h4>
                <p className="text-[11px] text-slate-400">{ec.location}</p>
              </div>

              <button
                type="button"
                onClick={() => handleWhatsApp(ec.phone, `DARURAT! Halo ${ec.name}, tim ekspedisi kami memerlukan bantuan.`)}
                className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group-hover:border-emerald-500/50"
              >
                <span>WhatsApp Cepat</span>
                <ExternalLink size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CUSTOM MODAL KONFIRMASI HAPUS (GANTIIN WINDOW.CONFIRM JADUL) */}
      {deleteIndexTarget !== null && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Hapus Kontak Darurat?</h4>
              <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan setelah dihapus dari sistem.</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={confirmDeleteEmergencyContact} 
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
              >
                Ya, Hapus
              </button>
              <button 
                onClick={() => setDeleteIndexTarget(null)} 
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold cursor-pointer transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TOAST MENGGUNAKAN PORTAL (DIJAMIN MENGAMBANG DI ATAS SEGALA ELEMEN LAYAR) */}
      {toast.show && ReactDOM.createPortal(
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900/95 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="w-6 h-6 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <BellRing size={13} />
          </div>
          <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        </div>,
        document.body
      )}

    </div>
  );
}