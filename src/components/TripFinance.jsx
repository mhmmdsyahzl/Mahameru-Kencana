import React, { useState } from 'react';
import { Wallet, Receipt, Plus, Users, Trash2, DollarSign, Fuel, LineChart, CheckCircle2, Edit3, Save, Check, Calculator, Navigation, UserCheck, Sparkles, CheckSquare, Square } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export default function TripFinance({ trip, currentUser }) {
  const [activeTab, setActiveTab] = useState('splitter');
  
  // State Splitter & Metode Bayar
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(currentUser?.uid || '');
  const [paymentMethod, setPaymentMethod] = useState('Tunai Fisik');

  // State Kas & Cicilan
  const [targetKas, setTargetKas] = useState(trip?.targetKas || 50000); 
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [inputTarget, setInputTarget] = useState(trip?.targetKas || 50000);
  const [cicilanInputs, setCicilanInputs] = useState({});
  const [editingUserUid, setEditingUserUid] = useState(null);
  const [directEditValue, setDirectEditValue] = useState('');

  // State Tracker BBM dengan Multi-Penumpang (Array UIDs)
  const [vehicleName, setVehicleName] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelPayerId, setFuelPayerId] = useState(currentUser?.uid || '');
  const [riderUid, setRiderUid] = useState(currentUser?.uid || '');
  const [selectedPassengers, setSelectedPassengers] = useState([]); // Array UID penumpang

  // Input Tol Manual Log
  const [tolNote, setTolNote] = useState('');
  const [tolCost, setTolCost] = useState('');
  const [tolUserUid, setTolUserUid] = useState(currentUser?.uid || '');

  const expenses = trip?.expenses || [];
  const kasPayments = trip?.kasPayments || {}; 
  const fuelLogs = trip?.fuelLogs || []; 
  const tolLogs = trip?.tolLogs || []; 
  const members = trip?.members?.length > 0 ? trip.members : [currentUser];

  // --- HANDLER SPLITTER ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    const payer = members.find(m => m.uid === payerId) || currentUser;
    const newExpense = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      payerId,
      payerName: payer?.displayName || 'Unknown',
      paymentMethod,
      date: new Date().toLocaleDateString('id-ID')
    };

    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { expenses: [...expenses, newExpense] });
      setTitle('');
      setAmount('');
    } catch (err) { console.error("Gagal nyimpen:", err); }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { expenses: expenses.filter(exp => exp.id !== expenseId) });
    } catch (err) { console.error("Gagal hapus:", err); }
  };

  const calculateBalances = () => {
    const balances = {};
    members.forEach(m => { balances[m.uid] = { name: m.displayName, total: 0 }; });
    expenses.forEach(exp => {
      if (balances[exp.payerId]) balances[exp.payerId].total += exp.amount;
      const split = exp.amount / members.length;
      members.forEach(m => { if (balances[m.uid]) balances[m.uid].total -= split; });
    });
    return balances;
  };

  const balances = calculateBalances();
  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(num));

  // --- HANDLER KAS & CICILAN ---
  const handleSaveTarget = async () => {
    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { targetKas: parseFloat(inputTarget) || 0 });
      setTargetKas(parseFloat(inputTarget) || 0);
      setIsEditingTarget(false);
    } catch (err) { console.error("Gagal update target:", err); }
  };

  const handleAddCicilan = async (uid) => {
    const tambahBayar = parseFloat(cicilanInputs[uid]) || 0;
    if (tambahBayar === 0) return;
    const currentPaid = kasPayments[uid] || 0;
    const updatedPaid = Math.max(0, currentPaid + tambahBayar);
    const newKasPayments = { ...kasPayments, [uid]: updatedPaid };

    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { kasPayments: newKasPayments });
      setCicilanInputs({ ...cicilanInputs, [uid]: '' });
    } catch (err) { console.error("Gagal update cicilan:", err); }
  };

  const handleSaveDirectEdit = async (uid) => {
    const newVal = parseFloat(directEditValue);
    if (isNaN(newVal) || newVal < 0) return;
    const newKasPayments = { ...kasPayments, [uid]: newVal };
    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { kasPayments: newKasPayments });
      setEditingUserUid(null);
      setDirectEditValue('');
    } catch (err) { console.error("Gagal save direct edit:", err); }
  };

  const totalCollectedKas = Object.values(kasPayments).reduce((acc, val) => acc + val, 0);
  const totalTargetKas = members.length * targetKas;
  const progressPercentage = totalTargetKas > 0 ? Math.min((totalCollectedKas / totalTargetKas) * 100, 100) : 0;

  // --- HANDLER FUEL TRACKER (MULTI PASSENGERS) ---
  const togglePassengerSelection = (uid) => {
    if (selectedPassengers.includes(uid)) {
      setSelectedPassengers(selectedPassengers.filter(id => id !== uid));
    } else {
      setSelectedPassengers([...selectedPassengers, uid]);
    }
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    if (!vehicleName || !fuelCost) return;
    const payer = members.find(m => m.uid === fuelPayerId) || currentUser;
    const rider = members.find(m => m.uid === riderUid) || {};
    
    // Ambil nama-nama penumpang berdasarkan array UID yang dicentang
    const passengerNames = selectedPassengers
      .map(uid => members.find(m => m.uid === uid)?.displayName)
      .filter(Boolean);

    const newFuel = {
      id: Date.now().toString(),
      vehicleName,
      liters: parseFloat(liters) || 0,
      cost: parseFloat(fuelCost),
      payerUid: fuelPayerId,
      payerName: payer?.displayName || 'Unknown',
      riderName: rider?.displayName || 'Solo',
      passengers: passengerNames, // Disimpan sebagai array nama penumpang
      date: new Date().toLocaleDateString('id-ID')
    };

    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { fuelLogs: [...fuelLogs, newFuel] });
      setVehicleName('');
      setLiters('');
      setFuelCost('');
      setSelectedPassengers([]);
    } catch (err) { console.error("Gagal simpan bensin:", err); }
  };

  const handleDeleteFuel = async (fuelId) => {
    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { fuelLogs: fuelLogs.filter(f => f.id !== fuelId) });
    } catch (err) { console.error("Gagal hapus bensin:", err); }
  };

  // --- HANDLER TOL LOG ---
  const handleAddTol = async (e) => {
    e.preventDefault();
    if (!tolNote || !tolCost) return;
    const userTol = members.find(m => m.uid === tolUserUid) || currentUser;

    const newTol = {
      id: Date.now().toString(),
      note: tolNote,
      cost: parseFloat(tolCost),
      userUid: tolUserUid,
      userName: userTol?.displayName || 'Unknown',
      date: new Date().toLocaleDateString('id-ID')
    };

    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { tolLogs: [...tolLogs, newTol] });
      setTolNote('');
      setTolCost('');
    } catch (err) { console.error("Gagal simpan tol:", err); }
  };

  const handleDeleteTol = async (tolId) => {
    try {
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, { tolLogs: tolLogs.filter(t => t.id !== tolId) });
    } catch (err) { console.error("Gagal hapus tol:", err); }
  };

  const totalFuelLiters = fuelLogs.reduce((acc, f) => acc + f.liters, 0);
  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + f.cost, 0);
  const totalTolCost = tolLogs.reduce((acc, t) => acc + t.cost, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  
  const grandTotalExpenses = totalExpensesAmount + totalFuelCost + totalTolCost;
  const sisaKasGlobal = totalCollectedKas - grandTotalExpenses;

  return (
    <div className="space-y-5 text-left pb-4">
      
      {/* --- HEADER TITLE --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Wallet size={17} className="text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
            Keuangan & Treasury Ekspedisi
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Kelola talangan, celengan kas, bensin, tol, dan rekapitulasi.</p>
        </div>
      </div>
      
      {/* --- MENU TABS NAVIGASI (IOS STYLE) --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/90">
        <button onClick={() => setActiveTab('splitter')} className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'splitter' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <Receipt size={14} /> Splitter Talangan
        </button>
        <button onClick={() => setActiveTab('kas')} className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'kas' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <DollarSign size={14} /> Celengan Kas
        </button>
        <button onClick={() => setActiveTab('fuel')} className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'fuel' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <Fuel size={14} /> BBM & Tol
        </button>
        <button onClick={() => setActiveTab('rekap')} className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'rekap' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <LineChart size={14} /> Estimasi & Rekap
        </button>
      </div>

      {/* --- TAB 1: SPLITTER --- */}
      {activeTab === 'splitter' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddExpense} className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 px-0.5">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Catat Talangan Baru</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 px-1">Keperluan</label>
                <input type="text" placeholder="Beli apa? (Cth: Konsumsi)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 px-1">Nominal (Rp)</label>
                <div className="relative flex items-center bg-slate-950/90 rounded-2xl border border-slate-800/90">
                  <span className="absolute left-3.5 text-xs text-slate-500 font-mono">Rp</span>
                  <input type="number" placeholder="50000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent py-3 pl-10 pr-3 text-xs font-mono font-bold text-white focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 px-1">Ditalangin Oleh</label>
                <select value={payerId} onChange={(e) => setPayerId(e.target.value)} className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3 text-xs text-white focus:outline-none cursor-pointer">
                  {members.map(m => <option key={m.uid} value={m.uid}>{m.displayName}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-400">Metode:</span>
                <button type="button" onClick={() => setPaymentMethod('Tunai Fisik')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${paymentMethod === 'Tunai Fisik' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>💵 Tunai Fisik</button>
                <button type="button" onClick={() => setPaymentMethod('QRIS / Transfer')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${paymentMethod === 'QRIS / Transfer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>📱 QRIS / Transfer</button>
              </div>
              <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white px-5 py-3 rounded-2xl text-xs font-semibold shadow-lg shadow-emerald-950/50 cursor-pointer">Catat Pengeluaran</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Logbook Talangan</h4>
              {expenses.length === 0 ? <p className="text-xs text-slate-500 italic py-6 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">Belum ada talangan dicatat.</p> : 
                expenses.map(exp => (
                  <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 shadow-md gap-3">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{exp.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Oleh: <span className="text-emerald-400 font-medium">{exp.payerName}</span> • <span className="text-amber-300">{exp.paymentMethod || 'Tunai'}</span> • {exp.date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{formatRp(exp.amount)}</span>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 bg-slate-950/60 cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Rekap Utang Adil</h4>
              <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl space-y-3">
                {Object.values(balances).map(user => (
                  <div key={user.name} className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/80 last:border-0 last:pb-0">
                    <span className="font-semibold text-slate-300">{user.name}</span>
                    <span className={`font-bold font-mono ${user.total > 0 ? 'text-emerald-400' : user.total < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {user.total > 0 ? '+' : user.total < 0 ? '-' : ''} {formatRp(user.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CELENGAN KAS --- */}
      {activeTab === 'kas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Kas Terkumpul</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{formatRp(totalCollectedKas)}</span>
                  <span className="text-xs text-slate-500 font-mono">/ Target {formatRp(totalTargetKas)}</span>
                </div>
              </div>

              <div>
                {isEditingTarget ? (
                  <div className="flex items-center gap-1.5">
                    <input type="number" value={inputTarget} onChange={(e) => setInputTarget(e.target.value)} className="w-28 bg-slate-950 border border-emerald-500 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none" placeholder="Target/org"/>
                    <button onClick={handleSaveTarget} className="bg-emerald-600 hover:bg-emerald-500 p-2 rounded-xl text-white cursor-pointer"><Save size={14}/></button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingTarget(true)} className="flex items-center gap-1.5 text-xs text-cyan-400 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer font-medium">
                    <Edit3 size={13} /> Target: {formatRp(targetKas)}/org ✏️
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Cicilan Setoran per Anggota</h4>
            <div className="space-y-3">
              {members.map(m => {
                const totalPaid = kasPayments[m.uid] || 0;
                const isLunas = totalPaid >= targetKas;
                const progressUser = targetKas > 0 ? Math.min((totalPaid / targetKas) * 100, 100) : 0;
                const isEditingThisUser = editingUserUid === m.uid;

                return (
                  <div key={m.uid} className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono">
                          {m.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-white">{m.displayName}</span>
                      </div>
                      <div>
                        {isLunas ? (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Lunas
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Belum Lunas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                      {isEditingThisUser ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={directEditValue} onChange={(e) => setDirectEditValue(e.target.value)} className="w-full bg-slate-900 border border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none" placeholder="Nominal baru"/>
                          <button onClick={() => handleSaveDirectEdit(m.uid)} className="bg-emerald-600 px-3 py-1.5 rounded-xl text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0"><Check size={12}/> Simpan</button>
                          <button onClick={() => setEditingUserUid(null)} className="bg-slate-800 px-3 py-1.5 rounded-xl text-slate-300 text-xs cursor-pointer shrink-0">Batal</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-mono">
                            Setor: <strong className="text-emerald-400">{formatRp(totalPaid)}</strong> / Target: {formatRp(targetKas)}
                          </span>
                          <button onClick={() => { setEditingUserUid(m.uid); setDirectEditValue(totalPaid); }} className="text-cyan-400 hover:underline text-[11px] font-medium cursor-pointer">
                            ✏️ Koreksi Total
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div className={`h-full rounded-full transition-all duration-300 ${isLunas ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${progressUser}%` }}></div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input type="number" placeholder="Nominal cicilan (Cth: 20000)" value={cicilanInputs[m.uid] || ''} onChange={(e) => setCicilanInputs({ ...cicilanInputs, [m.uid]: e.target.value })} className="flex-1 bg-slate-950/90 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"/>
                      <button onClick={() => handleAddCicilan(m.uid)} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1">
                        <Plus size={13} /> Setor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: TRACKER BBM & TOL (DENGAN MULTI PENUMPANG CHECKBOX) --- */}
      {activeTab === 'fuel' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Konsumsi BBM</span>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">{fuelLogs.length} catatan pengisian bensin</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-400 font-mono">{totalFuelLiters.toFixed(1)} Liter</span>
                <p className="text-xs font-bold text-emerald-400 font-mono">{formatRp(totalFuelCost)}</p>
              </div>
            </div>

            <form onSubmit={handleAddFuel} className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 px-0.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>Catat Pengisian Bensin & Tim Boncengan / Penumpang</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input type="text" placeholder="Kendaraan (Cth: Mobil / Nmax)" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} className="bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                <input type="number" step="0.1" placeholder="Jumlah Liter (Cth: 10)" value={liters} onChange={(e) => setLiters(e.target.value)} className="bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50" />
                <input type="number" placeholder="Total Biaya (Rp)" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} className="bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 px-1">Rider / Driver</label>
                  <select value={riderUid} onChange={(e) => setRiderUid(e.target.value)} className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3 text-xs text-white focus:outline-none cursor-pointer">
                    {members.map(m => <option key={m.uid} value={m.uid}>{m.displayName}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 px-1">Ditalangin Oleh</label>
                  <select value={fuelPayerId} onChange={(e) => setFuelPayerId(e.target.value)} className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3 text-xs text-white focus:outline-none cursor-pointer">
                    {members.map(m => <option key={m.uid} value={m.uid}>{m.displayName}</option>)}
                  </select>
                </div>
              </div>

              {/* MULTI-PENUMPANG CHECKBOX SELECTION */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-slate-400 px-1 flex items-center justify-between">
                  <span>Pilih Penumpang / Anggota Ikut (Bisa lebih dari 1):</span>
                  <span className="text-[10px] text-amber-400 font-bold">{selectedPassengers.length} Dipilih</span>
                </label>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {members.map(m => {
                    const isChecked = selectedPassengers.includes(m.uid);
                    return (
                      <div 
                        key={m.uid}
                        onClick={() => togglePassengerSelection(m.uid)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {isChecked ? <CheckSquare size={16} className="text-amber-400 shrink-0" /> : <Square size={16} className="text-slate-600 shrink-0" />}
                        <span className="text-xs font-semibold truncate">{m.displayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white py-3 rounded-2xl text-xs font-semibold shadow-lg shadow-amber-950/50 cursor-pointer flex items-center justify-center gap-1">
                <Plus size={14} /> Catat Log BBM & Penumpang
              </button>
            </form>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Riwayat & Pembagian BBM</h4>
              {fuelLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">Belum ada catatan BBM.</p>
              ) : (
                fuelLogs.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 shadow-md gap-3">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate"><Fuel size={14} className="text-amber-400 shrink-0" /> {f.vehicleName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {f.liters} Liter • Driver: <span className="text-cyan-400 font-medium">{f.riderName}</span> {f.passengers && f.passengers.length > 0 ? `• Penumpang: ${f.passengers.join(', ')}` : ''} • Talang: <span className="text-emerald-400 font-medium">{f.payerName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{formatRp(f.cost)}</span>
                      <button onClick={() => handleDeleteFuel(f.id)} className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 bg-slate-950/60 cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catatan Pengeluaran Tol</span>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">{tolLogs.length} transaksi tol tercatat</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-blue-400 font-mono">{formatRp(totalTolCost)}</span>
              </div>
            </div>

            <form onSubmit={handleAddTol} className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-3">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 px-0.5">
                <Sparkles size={13} className="text-blue-400" />
                <span>Catat Pembayaran Tol Manual</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input type="text" placeholder="Keterangan (Cth: Gerbang Tol)" value={tolNote} onChange={(e) => setTolNote(e.target.value)} className="bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                <input type="number" placeholder="Nominal Bayar (Rp)" value={tolCost} onChange={(e) => setTolCost(e.target.value)} className="bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500/50" />
                <select value={tolUserUid} onChange={(e) => setTolUserUid(e.target.value)} className="bg-slate-950/90 border border-slate-800 rounded-2xl py-3 px-3 text-xs text-white focus:outline-none cursor-pointer">
                  {members.map(m => <option key={m.uid} value={m.uid}>Dibayar oleh: {m.displayName}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 text-white py-3 rounded-2xl text-xs font-semibold shadow-lg shadow-blue-950/50 cursor-pointer flex items-center justify-center gap-1">
                <Plus size={14} /> Tambah Log Tol
              </button>
            </form>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Riwayat Pembayaran Tol</h4>
              {tolLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">Belum ada catatan tol.</p>
              ) : (
                tolLogs.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 shadow-md gap-3">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{t.note}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">Dibayar oleh: <span className="text-blue-400 font-medium">{t.userName}</span> • {t.date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-blue-400 font-mono">{formatRp(t.cost)}</span>
                      <button onClick={() => handleDeleteTol(t.id)} className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 bg-slate-950/60 cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: ESTIMASI & TABEL REKAP --- */}
      {activeTab === 'rekap' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-emerald-400" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Kalkulasi Kas Trip vs Total Pengeluaran</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Kas Terkumpul</span>
                <strong className="text-emerald-400 font-mono text-sm mt-0.5 block">{formatRp(totalCollectedKas)}</strong>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Pengeluaran Trip</span>
                <strong className="text-amber-400 font-mono text-sm mt-0.5 block">{formatRp(grandTotalExpenses)}</strong>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sisa Saldo Kas Utama</span>
                <strong className={`font-mono text-sm mt-0.5 block ${sisaKasGlobal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatRp(sisaKasGlobal)} {sisaKasGlobal < 0 ? '(Kurang!)' : '(Aman)'}
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
              <UserCheck size={14} /> Tabel Grand Rekapitulasi & Saldo Per Anggota
            </h4>
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono">
                      <th className="p-3.5 font-semibold">Nama Anggota</th>
                      <th className="p-3.5 font-semibold text-right">Setor Kas</th>
                      <th className="p-3.5 font-semibold text-right">Talangan</th>
                      <th className="p-3.5 font-semibold text-right">BBM</th>
                      <th className="p-3.5 font-semibold text-right">Tol</th>
                      <th className="p-3.5 font-semibold text-right text-emerald-400">Saldo Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {members.map(m => {
                      const userKas = kasPayments[m.uid] || 0;
                      const userExpenses = expenses.filter(e => e.payerId === m.uid).reduce((acc, e) => acc + e.amount, 0);
                      const userFuel = fuelLogs.filter(f => f.payerUid === m.uid).reduce((acc, f) => acc + f.cost, 0);
                      const userTol = tolLogs.filter(t => t.userUid === m.uid).reduce((acc, t) => acc + t.cost, 0);
                      const userTotalSpent = userExpenses + userFuel + userTol;
                      const userBalance = userKas - userTotalSpent;

                      return (
                        <tr key={m.uid} className="hover:bg-slate-950/40">
                          <td className="p-3.5 font-bold text-white">{m.displayName}</td>
                          <td className="p-3.5 text-right text-emerald-400 font-mono">{formatRp(userKas)}</td>
                          <td className="p-3.5 text-right text-amber-400 font-mono">{formatRp(userExpenses)}</td>
                          <td className="p-3.5 text-right text-amber-300 font-mono">{formatRp(userFuel)}</td>
                          <td className="p-3.5 text-right text-blue-400 font-mono">{formatRp(userTol)}</td>
                          <td className={`p-3.5 text-right font-bold font-mono ${userBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {userBalance >= 0 ? `Sisa Hak ${formatRp(userBalance)}` : `Kurang ${formatRp(Math.abs(userBalance))}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}