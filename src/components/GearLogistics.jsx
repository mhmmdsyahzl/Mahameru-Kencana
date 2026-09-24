import React, { useState, useEffect } from 'react';
import { Package, Backpack, Trash2, CheckCircle2, Circle, AlertTriangle, Plus, X, Edit3, Save, Minus, Users, Download, Sparkles, Layers } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function GearLogistics({ 
  tripId = '', 
  currentUser = { uid: '123', displayName: 'Alfin' }, 
  isLeader = false, 
  isNavigator = false,
  tripMembers = [] 
}) {
  const [activeTab, setActiveTab] = useState('group');

  // ================= STATE LOGISTIK TIM (REAL-TIME FIREBASE SYNC) =================
  const [groupGear, setGroupGear] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupForm, setEditGroupForm] = useState({});

  useEffect(() => {
    if (!tripId) return;
    const tripRef = doc(db, 'trips', tripId);
    
    const unsubscribe = onSnapshot(tripRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroupGear(data.groupGear || [
          { id: 1, name: 'Tenda Kapasitas 4', qty: 1, pj: 'Tim (Bawaan Bersama)', method: 'Sewa', status: 'ready' },
          { id: 2, name: 'Nesting + Kompor', qty: 1, pj: currentUser.displayName || 'Leader', method: 'Punya Pribadi', status: 'pending' },
        ]);
      }
    });

    return () => unsubscribe();
  }, [tripId, currentUser]);

  const updateGroupGearToFirebase = async (newGearList) => {
    if (!tripId) return;
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, { groupGear: newGearList });
    } catch (error) {
      console.error("Gagal update logistik tim ke database:", error);
    }
  };

  // ================= STATE PERSONAL GEAR =================
  const [personalGear, setPersonalGear] = useState([
    { id: 1, name: 'Carrier 45L+', qty: 1, checked: true },
    { id: 2, name: 'Sleeping Bag', qty: 1, checked: false },
  ]);
  const [newPersonalItem, setNewPersonalItem] = useState('');
  const [newPersonalQty, setNewPersonalQty] = useState(1);
  const [editingPersonalId, setEditingPersonalId] = useState(null);
  const [editPersonalForm, setEditPersonalForm] = useState({});
  
  // ================= STATE MASTER TEMPLATE =================
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [masterTemplates, setMasterTemplates] = useState([
    { id: 't1', name: 'Standar Pendakian (2H1M)', items: ['Jaket Gunung Windproof', 'Headlamp + Baterai', 'Jas Hujan'] }
  ]);
  const [templateItemInputs, setTemplateItemInputs] = useState({});

  // ================= STATE ECO-WASTE =================
  const [ecoWaste, setEcoWaste] = useState([
    { id: 1, name: 'Bungkus Mie Instan', naik: 10, turun: 10, status: 'clear' },
  ]);
  const [isAddingWaste, setIsAddingWaste] = useState(false);
  const [newWasteItem, setNewWasteItem] = useState('');


  // ================= HANDLERS: LOGISTIK TIM =================
  const toggleGroupStatus = async (id) => {
    if (editingGroupId) return;
    const updated = groupGear.map(item => 
      item.id === id ? { ...item, status: item.status === 'ready' ? 'pending' : 'ready' } : item
    );
    await updateGroupGearToFirebase(updated);
  };

  const handleEditGroupSave = async () => {
    let updated;
    if (editingGroupId === 'new') {
      updated = [...groupGear, { ...editGroupForm, id: Date.now(), status: 'pending' }];
    } else {
      updated = groupGear.map(g => g.id === editingGroupId ? editGroupForm : g);
    }
    await updateGroupGearToFirebase(updated);
    setEditingGroupId(null);
  };

  const hapusGroupGear = async (e, id) => {
    e.stopPropagation();
    const updated = groupGear.filter(item => item.id !== id);
    await updateGroupGearToFirebase(updated);
  };


  // ================= HANDLERS: PERSONAL GEAR =================
  const togglePersonalStatus = (id) => {
    if (editingPersonalId) return;
    setPersonalGear(personalGear.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const hapusPersonalItem = (e, id) => {
    e.stopPropagation();
    setPersonalGear(personalGear.filter(item => item.id !== id));
  };

  const tambahPersonalItem = (e) => {
    e.preventDefault();
    if (!newPersonalItem.trim()) return;
    setPersonalGear([...personalGear, { id: Date.now(), name: newPersonalItem, qty: newPersonalQty, checked: false }]);
    setNewPersonalItem('');
    setNewPersonalQty(1);
  };

  const handleEditPersonalSave = () => {
    setPersonalGear(personalGear.map(p => p.id === editingPersonalId ? editPersonalForm : p));
    setEditingPersonalId(null);
  };

  const importFromTemplate = (templateItems) => {
    const newItems = templateItems.map((name, idx) => ({ id: Date.now() + idx, name: name, qty: 1, checked: false }));
    setPersonalGear([...personalGear, ...newItems]);
    setShowTemplateModal(false);
  };


  // ================= HANDLERS: TEMPLATE =================
  const tambahMasterTemplate = (e) => {
    e.preventDefault();
    if (!isLeader) return;
    if (!newTemplateName.trim()) return;
    setMasterTemplates([...masterTemplates, { id: Date.now().toString(), name: newTemplateName, items: [] }]);
    setNewTemplateName('');
  };

  const hapusMasterTemplate = (id) => {
    if (!isLeader) return;
    setMasterTemplates(masterTemplates.filter(t => t.id !== id));
  };

  const handleTemplateItemInput = (templateId, val) => setTemplateItemInputs({ ...templateItemInputs, [templateId]: val });

  const tambahItemKeMasterInline = (templateId) => {
    if (!isLeader) return;
    const itemName = templateItemInputs[templateId];
    if (!itemName || !itemName.trim()) return;
    setMasterTemplates(masterTemplates.map(t => t.id === templateId ? { ...t, items: [...t.items, itemName.trim()] } : t));
    setTemplateItemInputs({ ...templateItemInputs, [templateId]: '' });
  };

  const hapusItemDariMaster = (templateId, itemIndex) => {
    if (!isLeader) return;
    setMasterTemplates(masterTemplates.map(t => {
      if (t.id === templateId) return { ...t, items: t.items.filter((_, idx) => idx !== itemIndex) };
      return t;
    }));
  };

  // ================= HANDLERS: ECO-WASTE =================
  const updateWasteCount = (id, field, change) => {
    setEcoWaste(ecoWaste.map(item => {
      if (item.id === id) {
        const newVal = Math.max(0, item[field] + change);
        const updated = { ...item, [field]: newVal };
        updated.status = updated.turun >= updated.naik ? 'clear' : 'warning';
        return updated;
      }
      return item;
    }));
  };

  const tambahWasteItem = (e) => {
    e.preventDefault();
    if (!newWasteItem.trim()) return;
    setEcoWaste([...ecoWaste, { id: Date.now(), name: newWasteItem, naik: 1, turun: 0, status: 'warning' }]);
    setNewWasteItem('');
    setIsAddingWaste(false);
  };


  return (
    <div className="space-y-5 text-left pb-4">
      
      {/* --- HEADER TITLE --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
            Gear & Logistics Ekspedisi
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Kelola logistik tim, perlengkapan pribadi, dan ecowaste.</p>
        </div>
      </div>

      {/* Tabs iOS Style */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/90">
        <button onClick={() => setActiveTab('group')} className={`flex items-center justify-center gap-2 py-2.5 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'group' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <Package size={14} /> <span className="hidden sm:inline">Logistik Tim</span><span className="sm:hidden">Tim</span>
        </button>
        <button onClick={() => setActiveTab('personal')} className={`flex items-center justify-center gap-2 py-2.5 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'personal' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <Backpack size={14} /> <span className="hidden sm:inline">Personal Gear</span><span className="sm:hidden">Pribadi</span>
        </button>
        <button onClick={() => setActiveTab('waste')} className={`flex items-center justify-center gap-2 py-2.5 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'waste' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <Trash2 size={14} /> <span className="hidden sm:inline">Eco-Waste</span><span className="sm:hidden">Sampah</span>
        </button>
      </div>

      {/* ================= TAB 1: GROUP ================= */}
      {activeTab === 'group' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {groupGear.map(item => (
            <div key={item.id} className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-md ${item.status === 'ready' && editingGroupId !== item.id ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300' : 'bg-slate-900/90 border-slate-800/90 text-white hover:border-emerald-500/40'}`}>
              {editingGroupId === item.id ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={editGroupForm.name} onChange={(e) => setEditGroupForm({...editGroupForm, name: e.target.value})} placeholder="Nama Barang..." className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500" />
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-[10px] font-bold text-slate-400">QTY:</span>
                      <input type="number" min="1" value={editGroupForm.qty} onChange={(e) => setEditGroupForm({...editGroupForm, qty: parseInt(e.target.value) || 1})} className="w-8 bg-transparent text-white text-xs text-center outline-none font-bold font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select value={editGroupForm.pj} onChange={(e) => setEditGroupForm({...editGroupForm, pj: e.target.value})} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer">
                      <option value="Tim (Bawaan Bersama)">Tim (Bawaan Bersama)</option>
                      {tripMembers.map((member, mIdx) => {
                        const mName = typeof member === 'string' ? member : (member.displayName || member.name || member.username || 'Anggota');
                        const mUid = member.uid || mIdx;
                        return <option key={mUid} value={mName}>{mName}</option>;
                      })}
                    </select>
                    <select value={editGroupForm.method} onChange={(e) => setEditGroupForm({...editGroupForm, method: e.target.value})} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer">
                      <option value="Punya Pribadi">Punya Pribadi</option>
                      <option value="Sewa">Sewa</option>
                      <option value="Beli Patungan">Beli Patungan</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setEditingGroupId(null)} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer">Batal</button>
                    <button onClick={handleEditGroupSave} className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-500 cursor-pointer shadow-md"><Save size={14}/> Simpan</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGroupStatus(item.id)}>
                  <div className="flex items-center gap-3.5">
                    {item.status === 'ready' ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0" /> : <Circle size={20} className="text-slate-600 shrink-0 hover:text-slate-400" />}
                    <div>
                      <p className={`text-xs sm:text-sm font-bold ${item.status === 'ready' ? 'text-slate-300' : 'text-white'}`}>
                        <span className="text-emerald-400 font-bold mr-2 px-2 py-0.5 bg-emerald-950/80 rounded-lg border border-emerald-900 font-mono">{item.qty}x</span>{item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Users size={11} className="text-emerald-400 shrink-0"/> <span className="text-slate-300 font-medium">{item.pj}</span> • {item.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditGroupForm(item); setEditingGroupId(item.id); }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl cursor-pointer transition-colors"><Edit3 size={15} /></button>
                    <button onClick={(e) => hapusGroupGear(e, item.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"><X size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {editingGroupId === 'new' ? (
            <div className="p-4 bg-slate-900/90 border border-emerald-500/50 rounded-2xl space-y-3">
              <div className="flex gap-2">
                <input type="text" value={editGroupForm.name} onChange={(e) => setEditGroupForm({...editGroupForm, name: e.target.value})} placeholder="Nama Barang Baru..." className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500" autoFocus />
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400">QTY:</span>
                  <input type="number" min="1" value={editGroupForm.qty} onChange={(e) => setEditGroupForm({...editGroupForm, qty: parseInt(e.target.value) || 1})} className="w-8 bg-transparent text-white text-xs text-center outline-none font-bold font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select value={editGroupForm.pj} onChange={(e) => setEditGroupForm({...editGroupForm, pj: e.target.value})} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer">
                  <option value="Tim (Bawaan Bersama)">Tim (Bawaan Bersama)</option>
                  {tripMembers.map((member, mIdx) => {
                    const mName = typeof member === 'string' ? member : (member.displayName || member.name || member.username || 'Anggota');
                    const mUid = member.uid || mIdx;
                    return <option key={mUid} value={mName}>{mName}</option>;
                  })}
                </select>
                <select value={editGroupForm.method} onChange={(e) => setEditGroupForm({...editGroupForm, method: e.target.value})} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer">
                  <option value="Punya Pribadi">Punya Pribadi</option>
                  <option value="Sewa">Sewa</option>
                  <option value="Beli Patungan">Beli Patungan</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setEditingGroupId(null)} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer">Batal</button>
                <button onClick={handleEditGroupSave} className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-500 cursor-pointer shadow-md"><Save size={14}/> Tambah</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setEditGroupForm({ name: '', qty: 1, pj: 'Tim (Bawaan Bersama)', method: 'Punya Pribadi' }); setEditingGroupId('new'); }} className="w-full py-3.5 border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer bg-slate-900/40">
              <Plus size={15} /> Tambah Logistik Tim
            </button>
          )}
        </div>
      )}

      {/* ================= TAB 2: PERSONAL ================= */}
      {activeTab === 'personal' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl gap-3">
            <div>
              <p className="text-cyan-400 text-xs font-bold mb-0.5 flex items-center gap-1.5"><Sparkles size={13}/> Checklist Milik {currentUser?.displayName}</p>
              <p className="text-slate-400 text-[11px]">Data ini terisolasi cuma buat akun lo. Tarik template dari Leader biar ga lupa bawaan.</p>
            </div>
            <button onClick={() => {setShowTemplateModal(true); setIsManageMode(false);}} className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md">
              <Download size={14} /> Import Template
            </button>
          </div>

          {personalGear.map(item => (
            <div key={item.id} className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-md ${item.checked && editingPersonalId !== item.id ? 'bg-cyan-950/20 border-cyan-500/30 text-slate-400' : 'bg-slate-900/90 border-slate-800/90 text-white hover:border-cyan-500/40'}`}>
              {editingPersonalId === item.id ? (
                <div className="flex w-full flex-col sm:flex-row items-center gap-2">
                  <input type="text" value={editPersonalForm.name} onChange={(e) => setEditPersonalForm({...editPersonalForm, name: e.target.value})} className="flex-1 w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500" />
                  <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-[10px] font-bold text-slate-400">QTY:</span>
                      <input type="number" min="1" value={editPersonalForm.qty} onChange={(e) => setEditPersonalForm({...editPersonalForm, qty: parseInt(e.target.value) || 1})} className="w-8 bg-transparent text-white text-xs text-center outline-none font-bold font-mono" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingPersonalId(null)} className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer">Batal</button>
                      <button onClick={handleEditPersonalSave} className="p-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 cursor-pointer shadow-md"><Save size={15}/></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePersonalStatus(item.id)}>
                  <div className="flex items-center gap-3.5 flex-1">
                    {item.checked ? <CheckCircle2 size={20} className="text-cyan-400 shrink-0" /> : <Circle size={20} className="text-slate-600 shrink-0 hover:text-slate-400" />}
                    <span className={`text-xs sm:text-sm font-medium transition-colors ${item.checked ? 'text-slate-500 line-through' : 'text-white'}`}>
                       <span className="text-cyan-400 font-bold mr-2 px-2 py-0.5 bg-cyan-950/80 rounded-lg border border-cyan-900 font-mono">{item.qty}x</span>
                       {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditPersonalForm(item); setEditingPersonalId(item.id); }} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded-xl cursor-pointer transition-colors"><Edit3 size={15} /></button>
                    <button onClick={(e) => hapusPersonalItem(e, item.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"><X size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <form onSubmit={tambahPersonalItem} className="flex gap-2">
            <input type="text" value={newPersonalItem} onChange={(e) => setNewPersonalItem(e.target.value)} placeholder="Tambah barang manual ke list lo..." className="flex-1 bg-slate-900/90 border border-slate-800 text-white text-xs rounded-2xl px-4 py-3 outline-none focus:border-cyan-500" />
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-2 hidden sm:flex">
               <span className="text-[10px] font-bold text-slate-400">QTY:</span>
               <input type="number" min="1" value={newPersonalQty} onChange={(e) => setNewPersonalQty(parseInt(e.target.value) || 1)} className="w-8 bg-transparent text-white text-xs text-center outline-none font-bold font-mono" />
            </div>
            <button type="submit" className="px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white rounded-2xl cursor-pointer shadow-md"><Plus size={16}/></button>
          </form>

          {/* MODAL TEMPLATE */}
          {showTemplateModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-5 flex justify-between items-center border-b border-slate-800 bg-slate-950/50">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="text-cyan-400" size={16}/> {isManageMode ? 'Kelola Master Template' : 'Pilih Master Template'}
                    </h3>
                  </div>
                  <button onClick={() => {setShowTemplateModal(false); setIsManageMode(false);}} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"><X size={16}/></button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto space-y-3">
                  {masterTemplates.map(tpl => (
                    <div key={tpl.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-cyan-400">{tpl.name}</h4>
                        {!isManageMode ? (
                          <button onClick={() => importFromTemplate(tpl.items)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm">Pakai Template</button>
                        ) : (
                          isLeader && <button onClick={() => hapusMasterTemplate(tpl.id)} className="px-3 py-1.5 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs font-semibold rounded-xl cursor-pointer">Hapus</button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {tpl.items.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic">Belum ada item.</span>
                        ) : (
                          tpl.items.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl">
                              {item}
                              {isManageMode && isLeader && <button onClick={() => hapusItemDariMaster(tpl.id, idx)} className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"><X size={12}/></button>}
                            </span>
                          ))
                        )}
                      </div>

                      {isManageMode && isLeader && (
                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <input type="text" value={templateItemInputs[tpl.id] || ''} onChange={(e) => handleTemplateItemInput(tpl.id, e.target.value)} placeholder="Tambah item baru lalu enter..." className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); tambahItemKeMasterInline(tpl.id); }}} />
                          <button type="button" onClick={() => tambahItemKeMasterInline(tpl.id)} className="px-3 bg-cyan-600 text-white text-xs font-semibold rounded-xl cursor-pointer">Tambah</button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isManageMode && isLeader && (
                    <form onSubmit={tambahMasterTemplate} className="p-4 bg-slate-950 border border-dashed border-slate-700 rounded-2xl space-y-2">
                      <p className="text-xs font-semibold text-slate-300">Buat Master Template Baru</p>
                      <div className="flex gap-2">
                        <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Nama Template..." className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500" />
                        <button type="submit" className="px-4 bg-cyan-600 text-white text-xs font-semibold rounded-xl cursor-pointer">Buat</button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
                  {isLeader ? (
                     <button onClick={() => setIsManageMode(!isManageMode)} className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer">
                       {isManageMode ? '← Kembali ke Pilih' : '⚙️ Kelola Template'}
                     </button>
                  ) : <span className="text-[10px] text-slate-500">Cuma Leader yang bisa ngedit template.</span>}
                  <button onClick={() => {setShowTemplateModal(false); setIsManageMode(false);}} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer">Tutup</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ECO-WASTE ================= */}
      {activeTab === 'waste' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-amber-400 text-xs flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 text-amber-300">Leave No Trace Commitment</span>
              Pastikan total sampah yang turun kembali ke bawah sama persis dengan jumlah logistik yang dibawa naik.
            </div>
          </div>
          
          {ecoWaste.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
              <p className="text-xs sm:text-sm font-semibold text-white">{item.name}</p>
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Naik</span>
                  <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                    <button onClick={() => updateWasteCount(item.id, 'naik', -1)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer"><Minus size={13}/></button>
                    <span className="w-7 text-center text-xs font-bold text-white font-mono">{item.naik}</span>
                    <button onClick={() => updateWasteCount(item.id, 'naik', 1)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer"><Plus size={13}/></button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Turun</span>
                  <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                    <button onClick={() => updateWasteCount(item.id, 'turun', -1)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer"><Minus size={13}/></button>
                    <span className="w-7 text-center text-xs font-bold text-amber-400 font-mono">{item.turun}</span>
                    <button onClick={() => updateWasteCount(item.id, 'turun', 1)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer"><Plus size={13}/></button>
                  </div>
                </div>
                <div className="w-20 flex justify-end">
                  {item.status === 'clear' ? <span className="px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-900 text-emerald-400 rounded-xl text-[10px] font-extrabold font-mono">CLEAR</span> : <span className="px-2.5 py-1.5 bg-amber-950/80 border border-amber-900 text-amber-400 rounded-xl text-[10px] font-extrabold font-mono">MINUS {item.naik - item.turun}</span>}
                </div>
              </div>
            </div>
          ))}

          {isAddingWaste ? (
            <form onSubmit={tambahWasteItem} className="flex gap-2 pt-2">
              <input type="text" value={newWasteItem} onChange={(e) => setNewWasteItem(e.target.value)} placeholder="Contoh: Kaleng Gas, Bungkus Plastik..." className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-2xl px-4 py-3 outline-none focus:border-amber-500" autoFocus />
              <button type="submit" className="px-5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-2xl cursor-pointer">Simpan</button>
              <button type="button" onClick={() => setIsAddingWaste(false)} className="px-3 text-slate-400 hover:text-white cursor-pointer"><X size={16}/></button>
            </form>
          ) : (
            <button onClick={() => setIsAddingWaste(true)} className="w-full py-3.5 border border-dashed border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer bg-slate-900/40">
              <Plus size={15} /> Lapor Jenis Sampah Baru
            </button>
          )}
        </div>
      )}
    </div>
  );
}