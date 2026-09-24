import React, { useState } from 'react';
import { 
  HeartPulse, AlertTriangle, ShieldAlert, PhoneCall, 
  Bandage, Activity, Flame, Droplets, Wind, Plus, Trash2, X, 
  ChevronDown, ChevronUp, LifeBuoy, Zap, Skull, Sun, Compass
} from 'lucide-react';

export default function P3KGuide() {
  const [activeTab, setActiveTab] = useState('medical');
  const [expandedId, setExpandedId] = useState(null);

  // State untuk nomor kontak darurat & SAR kustom
  const [customContacts, setCustomContacts] = useState([
    { id: 1, name: 'SAR / BASARNAS Nasional', phone: '115', desc: 'Layanan Siaga Darurat 24 Jam' },
    { id: 2, name: 'Emergency Call Darurat Umum', phone: '112', desc: 'Layanan Darurat Terpadu' },
    { id: 3, name: 'Ambulans / Darurat Medis', phone: '118', desc: 'Evakuasi & Pertolongan Medis' },
    { id: 4, name: 'Posko / Basecamp Gunung (Opsi)', phone: '08123456789', desc: 'Simpan nomor pengelola jalur lokal' }
  ]);
  
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Diurutkan dari Ringan -> Sedang -> Kritis / Bahaya
  const medicalGuides = [
    {
      id: 'med-5',
      title: 'Luka Bakar (Knalpot Motor / Kompor Lapangan)',
      severity: 'Ringan / Sedang',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      borderGlow: 'hover:border-cyan-500/50',
      icon: <Flame className="text-orange-400" size={20} />,
      steps: [
        'Segera siram atau kompres bagian yang terkena panas dengan air mengalir biasa selama 10 hingga 15 menit.',
        'DILARANG keras mengoleskan pasta gigi, mentega, atau minyak karena dapat memicu infeksi bakteri.',
        'Tutup longgar dengan kassa steril basah. Jangan pernah memecahkan gelembung air (bula) yang timbul.'
      ]
    },
    {
      id: 'med-3',
      title: 'Cedera Kaki, Kram Otot, & Keseleo (Sprain)',
      severity: 'Sedang / Perlu Istirahat',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.2)]',
      borderGlow: 'hover:border-yellow-500/50',
      icon: <Activity className="text-yellow-400" size={20} />,
      steps: [
        'Istirahatkan bagian yang cedera. Jangan dipaksa berjalan trekking atau melanjutkan riding jika bengkak.',
        'Terapkan metode R.I.C.E (Rest, Ice, Compression, Elevation): Kompres bagian bengkak dengan es selama 15 menit.',
        'Regangkan otot secara perlahan jika terjadi kram dan berikan minuman isotonik ber-elektrolit.'
      ]
    },
    {
      id: 'med-7',
      title: 'Dehidrasi Akut & Heatstroke (Kepanasan Ekstrem)',
      severity: 'Sedang / Darurat Cairan',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      borderGlow: 'hover:border-amber-500/50',
      icon: <Sun className="text-amber-400" size={20} />,
      steps: [
        'Bawa korban ke tempat teduh, lepaskan jaket atau perlengkapan tebal yang memerangkap panas.',
        'Basahi kulit korban dengan air dingin atau kompres bagian leher, ketiak, dan dahi.',
        'Beri minum air mineral atau cairan elektrolit secara perlahan jika korban sudah sadar sepenuhnya.'
      ]
    },
    {
      id: 'med-2',
      title: 'Luka Gesek Aspal & Lecet Parah (Road Rash - Riding)',
      severity: 'Sedang / Darurat Jalan Raya',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      borderGlow: 'hover:border-amber-500/50',
      icon: <Droplets className="text-amber-400" size={20} />,
      steps: [
        'Cuci bersih luka dari sisa kerikil, debu jalanan, atau aspal menggunakan air bersih mengalir atau cairan NaCl.',
        'Jangan gosok luka terlalu keras; sterilkan menggunakan cairan antiseptik (rivanol/povidone iodine).',
        'Oleskan salep antibiotik tipis-tipis lalu tutup dengan kassa steril agar terhindar dari infeksi debu.'
      ]
    },
    {
      id: 'med-4',
      title: 'Luka Terbuka & Pendarahan Hebat',
      severity: 'Kritis / Darurat Darah',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      borderGlow: 'hover:border-rose-500/50',
      icon: <Bandage className="text-rose-400" size={20} />,
      steps: [
        'Tekan langsung pada sumber luka menggunakan kassa steril atau kain bersih sampai pendarahan mereda.',
        'Tinggikan posisi bagian luka di atas jantung jika memungkinkan untuk memperlambat laju darah keluar.',
        'Balut perban dengan kencang namun jangan sampai memutus sirkulasi darah total; bersiap evakuasi.'
      ]
    },
    {
      id: 'med-1',
      title: 'Penanganan Hipotermia (Suhu Tubuh Drop)',
      severity: 'Kritis / Bahaya Ekstrem',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      borderGlow: 'hover:border-rose-500/50',
      icon: <Wind className="text-rose-400" size={20} />,
      steps: [
        'Pindahkan korban segera dari tempat basah/berangin ke dalam tenda atau bivak yang terlindung.',
        'Ganti pakaian basah korban dengan pakaian kering dan pasang selimut darurat (survival blanket).',
        'Beri minuman hangat manis (teh/jahe hangat). DILARANG keras memberi alkohol atau menggosok kulit korban dengan kasar.',
        'Lakukan metode skin-to-skin contact di dalam sleeping bag jika korban sudah mengalami gigilan parah.'
      ]
    },
    {
      id: 'med-6',
      title: 'Gigitan Ular Berbisa / Serangga Ekstrem',
      severity: 'Kritis / Bahaya Tinggi',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      borderGlow: 'hover:border-rose-500/50',
      icon: <Skull className="text-rose-500" size={20} />,
      steps: [
        'Tenangkan korban agar detak jantung tidak memompa racun menyebar dengan cepat ke seluruh tubuh.',
        'Imobilisasi (buat kaku/diam) bagian tubuh yang tergigit dan posisikan lebih rendah dari jantung.',
        'Jangan dihisap, jangan disayat, dan jangan diikat terlalu kencang (tourniquet berbahaya). Segera evakuasi medis!'
      ]
    }
  ];

  const emergencyProtocols = [
    {
      id: 'em-3',
      title: 'Protokol Tersesat di Hutan / Gunung Bebas',
      severity: 'Survival Alam Terbuka',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      borderGlow: 'hover:border-emerald-500/50',
      icon: <LifeBuoy className="text-emerald-400" size={20} />,
      steps: [
        'Jangan terus berjalan dalam keadaan panik atau saat malam mulai gelap. Tetap di satu titik aman.',
        'Gunakan peluit (tiup 3 kali berturut-turut sebagai kode S.O.S internasional) atau pantulkan cahaya senter.',
        'Cari sumber air bersih terdekat namun hindari area tebing curam atau jurang berbahaya.'
      ]
    },
    {
      id: 'em-1',
      title: 'Prinsip Utama Survival: S.T.O.P (Wajib Diingat)',
      severity: 'Protokol Wajib / Safety First',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      borderGlow: 'hover:border-cyan-500/50',
      icon: <ShieldAlert className="text-cyan-400" size={20} />,
      steps: [
        'S (Stop): Berhenti panik seketika, tenangkan diri dan kumpulkan seluruh anggota tim.',
        'T (Think): Analisis situasi sekitar, identifikasi ancaman bahaya lanjutan (cuaca buruk, longsor, atau jalur lalu lintas).',
        'O (Observe): Periksa kondisi fisik dan mental setiap anggota tim secara menyeluruh.',
        'P (Plan): Buat rencana aksi darurat yang matang: dirikan bivak, evakuasi, atau panggil tim SAR.'
      ]
    },
    {
      id: 'em-2',
      title: 'Protokol Kecelakaan Touring / Riding di Jalan Raya',
      severity: 'Keselamatan Rider / Kritis',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      borderGlow: 'hover:border-amber-500/50',
      icon: <AlertTriangle className="text-amber-400" size={20} />,
      steps: [
        'Amankan Lokasi: Nyalakan hazard atau pasang tanda darurat di belakang korban agar tidak tertabrak kendaraan lain.',
        'Jangan Asal Lepas Helm: Jika korban tidak sadar atau dicurigai mengalami cedera leher, biarkan helm terpasang.',
        'Periksa pernapasan dan pendarahan luar, segera hubungi nomor ambulans atau pos terdekat.'
      ]
    },
    {
      id: 'em-4',
      title: 'Protokol Menghadapi Satwa Liar / Buas',
      severity: 'Bahaya Tinggi / Satwa',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      borderGlow: 'hover:border-rose-500/50',
      icon: <Compass className="text-rose-400" size={20} />,
      steps: [
        'Jangan lari! Lari akan memicu insting predator untuk mengejar mangsa.',
        'Buat suara bising atau buat diri tampak lebih besar (angkat tangan atau ransel ke atas).',
        'Mundur perlahan secara teratur tanpa memalingkan pandangan dari hewan tersebut.'
      ]
    }
  ];

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newObj = {
      id: Date.now(),
      name: newName.trim(),
      phone: newPhone.trim(),
      desc: newDesc.trim() || 'Kontak Tambahan Ekspedisi'
    };

    setCustomContacts([...customContacts, newObj]);
    setNewName('');
    setNewPhone('');
    setNewDesc('');
    setShowAddContactModal(false);
  };

  const handleDeleteContact = (id) => {
    setCustomContacts(customContacts.filter(c => c.id !== id));
  };

  return (
    <div className="w-full space-y-6 text-left relative animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
            <HeartPulse size={13} /> SAR & Medical Field Guide
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight !m-0">P3K & Protokol Darurat</h2>
          <p className="text-xs sm:text-sm text-slate-400">Panduan lengkap penanganan medis alam bebas & jalan raya untuk petualang sejati.</p>
        </div>

        {/* Tab Navigasi Responsif */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner w-full lg:w-auto">
          <button 
            onClick={() => { setActiveTab('medical'); setExpandedId(null); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              activeTab === 'medical' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            Penanganan
          </button>
          <button 
            onClick={() => { setActiveTab('emergency'); setExpandedId(null); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              activeTab === 'emergency' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Protokol
          </button>
          <button 
            onClick={() => { setActiveTab('contacts'); setExpandedId(null); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              activeTab === 'contacts' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Kontak SAR
          </button>
        </div>
      </div>

      {/* KONTEN TAB 1: PENANGANAN MEDIS (Urutan dari Ringan ke Kritis) */}
      {activeTab === 'medical' && (
        <div className="space-y-3">
          <div className="px-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Urutan Penanganan (Dari Ringan hingga Bahaya Kritis):</p>
          </div>
          {medicalGuides.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id} 
                className={`bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-2xl border border-slate-800/80 ${item.borderGlow} rounded-3xl transition-all shadow-xl overflow-hidden`}
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Langkah Penanganan:</p>
                    <ol className="space-y-2 text-xs sm:text-sm text-slate-300 list-decimal pl-4 leading-relaxed">
                      {item.steps.map((step, idx) => (
                        <li key={idx} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* KONTEN TAB 2: PROTOKOL DARURAT */}
      {activeTab === 'emergency' && (
        <div className="space-y-3">
          {emergencyProtocols.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id} 
                className={`bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-2xl border border-slate-800/80 ${item.borderGlow} rounded-3xl transition-all shadow-xl overflow-hidden`}
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Protokol Aksi:</p>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc pl-4 leading-relaxed">
                      {item.steps.map((step, idx) => (
                        <li key={idx} className="pl-1">{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* KONTEN TAB 3: KONTAK DARURAT & SAR (Langsung Telpon Seluler) */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Direktori Kontak SAR & Darurat</h3>
              <p className="text-xs text-slate-400">Nomor siaga darurat nasional dan jalur lokal yang tersimpan.</p>
            </div>
            <button 
              onClick={() => setShowAddContactModal(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-amber-600/30 cursor-pointer transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus size={15} /> Tambah Kontak
            </button>
          </div>

          <div className="space-y-3">
            {customContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <PhoneCall size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{contact.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{contact.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-cyan-400 tracking-wider shadow-inner">
                    {contact.phone}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Tautan tel: agar langsung membuka aplikasi telepon seluler */}
                    <a 
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} 
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <PhoneCall size={13} /> Panggil
                    </a>
                    {contact.id > 4 && (
                      <button 
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 rounded-xl cursor-pointer transition-all"
                        title="Hapus Kontak"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Modal Tambah Kontak Darurat */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PhoneCall size={16} className="text-amber-400" /> Tambah Kontak Darurat Baru
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama Instansi / Posko / Orang</label>
                <input 
                  type="text" 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Contoh: Basecamp Gunung Talang" 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-amber-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nomor Telepon / HP</label>
                <input 
                  type="text" 
                  required 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="Contoh: 08123456789 atau 115" 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-amber-500 font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Keterangan / Deskripsi</label>
                <input 
                  type="text" 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Contoh: Penjaga Jalur / Siaga 24 Jam" 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-amber-500" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-2xl shadow-lg cursor-pointer transition-all">
                  Simpan Kontak
                </button>
                <button type="button" onClick={() => setShowAddContactModal(false)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl cursor-pointer">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}