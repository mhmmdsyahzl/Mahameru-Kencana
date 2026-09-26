import React, { useState, useEffect } from 'react';
import { Package, Backpack, Trash2, CheckCircle2, Circle, AlertTriangle, Plus, X, Edit3, Save, Minus, Users, Download, Sparkles, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const DEFAULT_CATEGORIES = [
  'Pakaian / Layering',
  'Pakaian Harian / Ganti',
  'Perlengkapan Tidur / Shelter',
  'Riding Gear',
  'Gear Perjalanan / Trekking',
  'Elektronik / Gadget',
  'Logistik / Konsumsi',
  'Perlengkapan Mandi & Saniter',
  'P3K / Safety',
  'Dokumen & Dompet'
];

export default function GearLogistics({ 
  tripId = '', 
  currentUser = { uid: '123', displayName: 'Alfin' }, 
  isLeader = false, 
  isNavigator = false,
  tripMembers = [] 
}) {
  const [activeTab, setActiveTab] = useState('group');

  // ================= STATE LOGISTIK TIM =================
  const [groupGear, setGroupGear] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupForm, setEditGroupForm] = useState({});
  const [collapsedGroupCategories, setCollapsedGroupCategories] = useState({});

  const [ecoWaste, setEcoWaste] = useState([]);
  const [isAddingWaste, setIsAddingWaste] = useState(false);
  const [newWasteItem, setNewWasteItem] = useState('');

  // ================= STATE PERSONAL GEAR =================
  const [personalGear, setPersonalGear] = useState([]);
  const [newPersonalItem, setNewPersonalItem] = useState('');
  const [newPersonalQty, setNewPersonalQty] = useState(1);
  const [newPersonalCategory, setNewPersonalCategory] = useState('Pakaian / Layering');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  
  const [editingPersonalId, setEditingPersonalId] = useState(null);
  const [editPersonalForm, setEditPersonalForm] = useState({});
  const [collapsedPersonalCategories, setCollapsedPersonalCategories] = useState({});

  // Kategori dinamis (bisa nambah kategori baru selain default)
  const [allCategories, setAllCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    if (!tripId) return;
    const tripRef = doc(db, 'trips', tripId);
    
    const unsubscribe = onSnapshot(tripRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        setGroupGear(data.groupGear || [
          { id: 1, name: 'Tenda Kapasitas 4', qty: 1, pj: 'Tim (Bawaan Bersama)', method: 'Sewa', status: 'ready', checkedIndices: [] },
          { id: 2, name: 'Nesting + Kompor', qty: 1, pj: currentUser.displayName || 'Leader', method: 'Punya Pribadi', status: 'pending', checkedIndices: [] },
        ]);
        
        setEcoWaste(data.ecoWaste || [
          { id: 1, name: 'Bungkus Mie Instan', naik: 10, turun: 10, status: 'clear' },
        ]);

        const personalMap = data.personalGearMap || {};
        const userGear = personalMap[currentUser?.uid] || [
          { id: 1, name: 'Carrier 45L+', qty: 1, category: 'Gear Perjalanan / Trekking', checkedIndices: [], checked: true },
          { id: 2, name: 'Sleeping Bag', qty: 1, category: 'Perlengkapan Tidur / Shelter', checkedIndices: [], checked: false },
        ];
        setPersonalGear(userGear);

        // Ambil kategori custom jika ada tersimpan
        if (data.personalCategoriesMap && data.personalCategoriesMap[currentUser?.uid]) {
          setAllCategories(data.personalCategoriesMap[currentUser.uid]);
        }
      }
    });

    return () => unsubscribe();
  }, [tripId, currentUser]);

  const updateGroupGearToFirebase = async (newGearList) => {
    if (!tripId) return;
    try {
      await updateDoc(doc(db, 'trips', tripId), { groupGear: newGearList });
    } catch (error) {
      console.error("Gagal update logistik tim:", error);
    }
  };

  const updateEcoWasteToFirebase = async (newEcoWasteList) => {
    if (!tripId) return;
    try {
      await updateDoc(doc(db, 'trips', tripId), { ecoWaste: newEcoWasteList });
    } catch (error) {
      console.error("Gagal update eco-waste:", error);
    }
  };

  const updatePersonalGearToFirebase = async (newUserGearList, newCategoriesList = allCategories) => {
    if (!tripId || !currentUser?.uid) return;
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        [`personalGearMap.${currentUser.uid}`]: newUserGearList,
        [`personalCategoriesMap.${currentUser.uid}`]: newCategoriesList
      });
    } catch (error) {
      console.error("Gagal update personal gear:", error);
    }
  };
  
  // ================= STATE MASTER TEMPLATE =================
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [masterTemplates, setMasterTemplates] = useState([
    { 
      id: 't1', 
      name: 'Standar Pendakian (2H1M)', 
      items: [
        { name: 'Jaket Gunung Windproof', category: 'Pakaian / Layering' },
        { name: 'Headlamp + Baterai', category: 'Elektronik / Gadget' },
        { name: 'Jas Hujan', category: 'Pakaian / Layering' }
      ] 
    }
  ]);
  const [templateItemInputs, setTemplateItemInputs] = useState({});
  const [templateItemCategoryInputs, setTemplateItemCategoryInputs] = useState({});

  // ================= HANDLERS: LOGISTIK TIM =================
  const handleEditGroupSave = async () => {
    let updated;
    if (editingGroupId === 'new') {
      updated = [...groupGear, { ...editGroupForm, id: Date.now(), status: 'pending', checkedIndices: [] }];
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
  const hapusPersonalItem = async (e, id) => {
    e.stopPropagation();
    const updated = personalGear.filter(item => item.id !== id);
    setPersonalGear(updated);
    await updatePersonalGearToFirebase(updated);
  };

  const tambahPersonalItem = async (e) => {
    e.preventDefault();
    if (!newPersonalItem.trim()) return;

    let targetCategory = newPersonalCategory;
    let updatedCategories = allCategories;

    if (isAddingCustomCategory && customCategoryInput.trim()) {
      targetCategory = customCategoryInput.trim();
      if (!allCategories.includes(targetCategory)) {
        updatedCategories = [...allCategories, targetCategory];
        setAllCategories(updatedCategories);
      }
      setCustomCategoryInput('');
      setIsAddingCustomCategory(false);
      setNewPersonalCategory(targetCategory);
    }

    const updated = [...personalGear, { 
      id: Date.now(), 
      name: newPersonalItem.trim(), 
      qty: newPersonalQty, 
      category: targetCategory, 
      checkedIndices: [], 
      checked: false 
    }];
    setPersonalGear(updated);
    await updatePersonalGearToFirebase(updated, updatedCategories);
    setNewPersonalItem('');
    setNewPersonalQty(1);
  };

  const handleEditPersonalSave = async () => {
    const updated = personalGear.map(p => p.id === editingPersonalId ? editPersonalForm : p);
    setPersonalGear(updated);
    await updatePersonalGearToFirebase(updated);
    setEditingPersonalId(null);
  };

  const importFromTemplate = async (templateItems) => {
    const newItems = templateItems.map((tItem, idx) => ({ 
      id: Date.now() + idx, 
      name: tItem.name, 
      qty: 1, 
      category: tItem.category || 'Pakaian / Layering', 
      checkedIndices: [], 
      checked: false 
    }));
    
    // Pastikan kategori dari template masuk ke list kategori user jika belum ada
    let updatedCategories = [...allCategories];
    templateItems.forEach(tItem => {
      if (tItem.category && !updatedCategories.includes(tItem.category)) {
        updatedCategories.push(tItem.category);
      }
    });
    setAllCategories(updatedCategories);

    const updated = [...personalGear, ...newItems];
    setPersonalGear(updated);
    await updatePersonalGearToFirebase(updated, updatedCategories);
    setShowTemplateModal(false);
  };

  // ================= HANDLERS: TEMPLATE =================
  const tambahMasterTemplate = (e) => {
    e.preventDefault();
    if (!isLeader) return;
    if (!newTemplateName.trim()) return;
    setMasterTemplates([...masterTemplates, { id: Date.now().toString(), name: newTemplateName.trim(), items: [] }]);
    setNewTemplateName('');
  };

  const hapusMasterTemplate = (id) => {
    if (!isLeader) return;
    setMasterTemplates(masterTemplates.filter(t => t.id !== id));
  };

  const tambahItemKeMasterInline = (templateId) => {
    if (!isLeader) return;
    const itemName = templateItemInputs[templateId];
    const itemCat = templateItemCategoryInputs[templateId] || 'Pakaian / Layering';
    if (!itemName || !itemName.trim()) return;

    setMasterTemplates(masterTemplates.map(t => {
      if (t.id === templateId) {
        return { ...t, items: [...t.items, { name: itemName.trim(), category: itemCat }] };
      }
      return t;
    }));
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
  const updateWasteCount = async (id, field, change) => {
    const updated = ecoWaste.map(item => {
      if (item.id === id) {
        const newVal = Math.max(0, item[field] + change);
        const updatedItem = { ...item, [field]: newVal };
        updatedItem.status = updatedItem.turun >= updatedItem.naik ? 'clear' : 'warning';
        return updatedItem;
      }
      return item;
    });
    await updateEcoWasteToFirebase(updated);
  };

  const tambahWasteItem = async (e) => {
    e.preventDefault();
    if (!newWasteItem.trim()) return;
    const updated = [...ecoWaste, { id: Date.now(), name: newWasteItem, naik: 1, turun: 0, status: 'warning' }];
    await updateEcoWasteToFirebase(updated);
    setNewWasteItem('');
    setIsAddingWaste(false);
  };

  const hapusWasteItem = async (id) => {
    const updated = ecoWaste.filter(item => item.id !== id);
    await updateEcoWasteToFirebase(updated);
  };

  return (
    <div className="space-y-5 text-left pb-4">
      
      {/* --- HEADER TITLE --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers size={17} className="text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
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
        <div className="space-y-4 animate-in fade-in duration-200">
          {['Punya Pribadi', 'Sewa', 'Beli Patungan'].map(methodCategory => {
            const itemsInGroup = [...groupGear]
              .filter(item => (item.method || 'Punya Pribadi') === methodCategory)
              .sort((a, b) => (b.qty || 1) - (a.qty || 1));

            if (itemsInGroup.length === 0) return null;
            const isCollapsed = Boolean(collapsedGroupCategories[methodCategory]);

            return (
              <div key={methodCategory} className="space-y-3">
                <div 
                  onClick={() => setCollapsedGroupCategories(prev => ({ ...prev, [methodCategory]: !prev[methodCategory] }))}
                  className="flex items-center gap-2 px-1 cursor-pointer select-none group"
                >
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 px-3 py-1 rounded-xl shadow-sm flex items-center gap-2">
                    📦 {methodCategory} ({itemsInGroup.length})
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
                  <span className="text-slate-400 text-xs font-bold px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1">
                    {isCollapsed ? 'Buka ▾' : 'Tutup ▴'}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {itemsInGroup.map(item => {
                      const checkedCount = item.checkedIndices?.length || 0;
                      const totalQty = item.qty || 1;
                      const isFull = checkedCount >= totalQty;
                      const isEmpty = checkedCount === 0;

                      let cardColorClass = "bg-slate-900/90 border-slate-800/90 text-white hover:border-emerald-500/40";
                      if (totalQty > 1) {
                        if (isEmpty) cardColorClass = "bg-rose-950/20 border-rose-500/40 text-slate-300";
                        else if (isFull) cardColorClass = "bg-emerald-950/20 border-emerald-500/30 text-slate-300";
                        else cardColorClass = "bg-cyan-950/20 border-cyan-500/30 text-slate-300";
                      } else {
                        cardColorClass = isFull 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300" 
                          : "bg-rose-950/20 border-rose-500/40 text-white hover:border-rose-500/60";
                      }

                      return (
                        <div key={item.id} className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-md ${cardColorClass}`}>
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
                            <div className="flex items-start justify-between cursor-pointer gap-3" onClick={async (e) => {
                              e.stopPropagation();
                              if (editingGroupId || totalQty > 1) return;
                              const isChecked = checkedCount > 0;
                              const updatedIndices = isChecked ? [] : [0];
                              const newStatus = updatedIndices.length > 0 ? 'ready' : 'pending';
                              const updated = groupGear.map(g => 
                                g.id === item.id ? { ...g, checkedIndices: updatedIndices, status: newStatus } : g
                              );
                              await updateGroupGearToFirebase(updated);
                            }}>
                              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                {totalQty <= 1 ? (
                                  <div className="shrink-0 pt-0.5">
                                    {isFull ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} className="text-rose-500 animate-pulse" />}
                                  </div>
                                ) : null}

                                <div className="min-w-0 flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`text-xs sm:text-sm font-bold leading-snug ${isFull ? 'text-slate-400 line-through' : 'text-white'}`}>
                                      {item.name}
                                    </p>
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                      isFull ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900' : isEmpty ? 'bg-rose-950/80 text-rose-400 border-rose-900' : 'bg-cyan-950/80 text-cyan-400 border-cyan-900'
                                    }`}>
                                      {totalQty}x
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
                                    <Users size={12} className={isFull ? "text-emerald-400 shrink-0" : isEmpty ? "text-rose-400 shrink-0" : "text-cyan-400 shrink-0"}/> 
                                    <span className="truncate">{item.pj}</span>
                                  </div>

                                  <div>
                                    <span className="inline-block px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded-lg uppercase tracking-wider">
                                      {item.method}
                                    </span>
                                  </div>

                                  {totalQty > 1 && (
                                    <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                      <div className={`inline-flex items-center justify-between rounded-xl border px-2 py-1 ${
                                        isFull ? 'bg-emerald-950/40 border-emerald-800/80' : isEmpty ? 'bg-rose-950/40 border-rose-800/80' : 'bg-cyan-950/40 border-cyan-800/80'
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          <button 
                                            type="button"
                                            onClick={async () => {
                                              if (editingGroupId) return;
                                              if (checkedCount <= 0) return;
                                              const updatedIndices = Array.from({ length: checkedCount - 1 }, (_, i) => i);
                                              const newStatus = updatedIndices.length >= totalQty ? 'ready' : 'pending';
                                              const updated = groupGear.map(g => 
                                                g.id === item.id ? { ...g, checkedIndices: updatedIndices, status: newStatus } : g
                                              );
                                              await updateGroupGearToFirebase(updated);
                                            }}
                                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                          >
                                            <Minus size={12}/>
                                          </button>
                                          
                                          <span className={`text-xs font-bold font-mono px-1 ${
                                            isFull ? 'text-emerald-400' : isEmpty ? 'text-rose-400' : 'text-cyan-400'
                                          }`}>
                                            {checkedCount} dari {totalQty} ada
                                          </span>

                                          <button 
                                            type="button"
                                            onClick={async () => {
                                              if (editingGroupId) return;
                                              if (checkedCount >= totalQty) return;
                                              const updatedIndices = Array.from({ length: checkedCount + 1 }, (_, i) => i);
                                              const newStatus = updatedIndices.length >= totalQty ? 'ready' : 'pending';
                                              const updated = groupGear.map(g => 
                                                g.id === item.id ? { ...g, checkedIndices: updatedIndices, status: newStatus } : g
                                              );
                                              await updateGroupGearToFirebase(updated);
                                            }}
                                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                          >
                                            <Plus size={12}/>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); setEditGroupForm(item); setEditingGroupId(item.id); }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl cursor-pointer transition-colors"><Edit3 size={15} /></button>
                                <button onClick={(e) => hapusGroupGear(e, item.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"><X size={15} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {editingGroupId === 'new' ? (
            <div className="p-4 bg-slate-900/90 border border-emerald-500/50 rounded-2xl space-y-3 mt-4">
              <div className="flex gap-2">
                <input type="text" value={editGroupForm.name} onChange={(e) => setEditGroupForm({...editGroupForm, name: e.target.value})} placeholder="Nama Barang Baru" className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500" autoFocus />
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
            <button onClick={() => { setEditGroupForm({ name: '', qty: 1, pj: 'Tim (Bawaan Bersama)', method: 'Punya Pribadi' }); setEditingGroupId('new'); }} className="w-full py-3.5 border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer bg-slate-900/40 mt-4">
              <Plus size={15} /> Tambah Logistik Tim
            </button>
          )}
        </div>
      )}

      {/* ================= TAB 2: PERSONAL (BERDASARKAN KATEGORI & BUKA-TUTUP) ================= */}
      {activeTab === 'personal' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl gap-3">
            <div>
              <p className="text-cyan-400 text-xs font-bold mb-0.5 flex items-center gap-1.5"><Sparkles size={13}/> Checklist Milik {currentUser?.displayName}</p>
              <p className="text-slate-400 text-[11px]">List ini dikelompokkan per kategori pendakian/perjalanan.</p>
            </div>
            <button onClick={() => {setShowTemplateModal(!showTemplateModal); setIsManageMode(false);}} className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md">
              <Download size={14} /> {showTemplateModal ? 'Tutup Template' : 'Import Template'}
            </button>
          </div>

          {/* TEMPLATE CONTAINER */}
          {showTemplateModal && (
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                  <Layers size={14}/> {isManageMode ? 'Kelola Master Template' : 'Pilih Master Template'}
                </h3>
                <button onClick={() => {setShowTemplateModal(false); setIsManageMode(false);}} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X size={15}/></button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                {masterTemplates.map(tpl => (
                  <div key={tpl.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">{tpl.name}</h4>
                      {!isManageMode ? (
                        <button onClick={() => importFromTemplate(tpl.items)} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold rounded-lg cursor-pointer">Pakai</button>
                      ) : (
                        isLeader && <button onClick={() => hapusMasterTemplate(tpl.id)} className="px-2.5 py-1 bg-rose-950/40 text-rose-400 text-[11px] font-semibold rounded-lg cursor-pointer">Hapus</button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {tpl.items.length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic">Belum ada item.</span>
                      ) : (
                        tpl.items.map((tItem, idx) => (
                          <div key={idx} className="flex items-center justify-between px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                            <span className="text-slate-200">{tItem.name} <span className="text-[10px] text-cyan-400">({tItem.category})</span></span>
                            {isManageMode && isLeader && <button onClick={() => hapusItemDariMaster(tpl.id, idx)} className="text-slate-500 hover:text-rose-400 cursor-pointer"><X size={12}/></button>}
                          </div>
                        ))
                      )}
                    </div>

                    {isManageMode && isLeader && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex gap-2">
                          <input type="text" value={templateItemInputs[tpl.id] || ''} onChange={(e) => setTemplateItemInputs({...templateItemInputs, [tpl.id]: e.target.value})} placeholder="Nama Item..." className="flex-1 bg-slate-900 border border-slate-700 text-white text-[11px] rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-500" />
                          <select value={templateItemCategoryInputs[tpl.id] || 'Pakaian / Layering'} onChange={(e) => setTemplateItemCategoryInputs({...templateItemCategoryInputs, [tpl.id]: e.target.value})} className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 outline-none">
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <button type="button" onClick={() => tambahItemKeMasterInline(tpl.id)} className="w-full py-1.5 bg-cyan-600 text-white text-[11px] font-semibold rounded-lg cursor-pointer">Tambah Item ke Template</button>
                      </div>
                    )}
                  </div>
                ))}

                {isManageMode && isLeader && (
                  <form onSubmit={tambahMasterTemplate} className="p-3 bg-slate-950 border border-dashed border-slate-700 rounded-xl space-y-2">
                    <p className="text-[11px] font-semibold text-slate-300">Buat Master Template Baru</p>
                    <div className="flex gap-2">
                      <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Nama Template..." className="flex-1 bg-slate-900 border border-slate-700 text-white text-[11px] rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-500" />
                      <button type="submit" className="px-3 bg-cyan-600 text-white text-[11px] font-semibold rounded-lg cursor-pointer">Buat</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
                {isLeader ? (
                  <button onClick={() => setIsManageMode(!isManageMode)} className="text-cyan-400 hover:underline font-medium cursor-pointer">
                    {isManageMode ? '← Kembali ke Pilih' : '⚙️ Kelola Template'}
                  </button>
                ) : <span className="text-slate-500 text-[10px]">Cuma Leader yang bisa ngedit template.</span>}
                <button onClick={() => {setShowTemplateModal(false); setIsManageMode(false);}} className="text-slate-400 hover:text-white cursor-pointer">Tutup</button>
              </div>
            </div>
          )}

          {/* RENDER PER KATEGORI DI PERSONAL GEAR */}
          {allCategories.map(catName => {
            const itemsInCat = [...personalGear]
              .filter(item => (item.category || 'Pakaian / Layering') === catName)
              .sort((a, b) => (b.qty || 1) - (a.qty || 1));

            if (itemsInCat.length === 0) return null;
            const isCollapsed = Boolean(collapsedPersonalCategories[catName]);

            return (
              <div key={catName} className="space-y-3">
                <div 
                  onClick={() => setCollapsedPersonalCategories(prev => ({ ...prev, [catName]: !prev[catName] }))}
                  className="flex items-center gap-2 px-1 cursor-pointer select-none group"
                >
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-900/80 px-3 py-1 rounded-xl shadow-sm flex items-center gap-2">
                    🎒 {catName} ({itemsInCat.length})
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
                  <span className="text-slate-400 text-xs font-bold px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1">
                    {isCollapsed ? 'Buka ▾' : 'Tutup ▴'}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {itemsInCat.map(item => {
                      const checkedCount = item.checkedIndices?.length || 0;
                      const totalQty = item.qty || 1;
                      const isFull = checkedCount >= totalQty;
                      const isEmpty = checkedCount === 0;

                      let cardColorClass = "bg-slate-900/90 border-slate-800/90 text-white hover:border-cyan-500/40";
                      if (totalQty > 1) {
                        if (isEmpty) cardColorClass = "bg-rose-950/20 border-rose-500/40 text-slate-300";
                        else if (isFull) cardColorClass = "bg-cyan-950/20 border-cyan-500/30 text-slate-300";
                        else cardColorClass = "bg-emerald-950/20 border-emerald-500/30 text-slate-300";
                      } else {
                        cardColorClass = isFull 
                          ? "bg-cyan-950/20 border-cyan-500/30 text-slate-300" 
                          : "bg-rose-950/20 border-rose-500/40 text-white hover:border-rose-500/60";
                      }

                      return (
                        <div key={item.id} className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-md ${cardColorClass}`}>
                          {editingPersonalId === item.id ? (
                            <div className="space-y-2">
                              <div className="flex w-full flex-col sm:flex-row items-center gap-2">
                                <input type="text" value={editPersonalForm.name} onChange={(e) => setEditPersonalForm({...editPersonalForm, name: e.target.value})} className="flex-1 w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500" />
                                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                                    <span className="text-[10px] font-bold text-slate-400">QTY:</span>
                                    <input type="number" min="1" value={editPersonalForm.qty} onChange={(e) => setEditPersonalForm({...editPersonalForm, qty: parseInt(e.target.value) || 1})} className="w-8 bg-transparent text-white text-xs text-center outline-none font-bold font-mono" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button onClick={() => setEditingPersonalId(null)} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer">Batal</button>
                                <button onClick={handleEditPersonalSave} className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 text-white text-xs font-semibold rounded-xl hover:bg-cyan-500 cursor-pointer shadow-md"><Save size={14}/> Simpan</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between cursor-pointer gap-3" onClick={async (e) => {
                              e.stopPropagation();
                              if (editingPersonalId || totalQty > 1) return;
                              const isChecked = checkedCount > 0;
                              const updatedIndices = isChecked ? [] : [0];
                              const updated = personalGear.map(p => 
                                p.id === item.id ? { ...p, checkedIndices: updatedIndices, checked: updatedIndices.length > 0 } : p
                              );
                              setPersonalGear(updated);
                              await updatePersonalGearToFirebase(updated);
                            }}>
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {totalQty <= 1 ? (
                                  <div className="shrink-0">
                                    {isFull ? <CheckCircle2 size={20} className="text-cyan-400" /> : <Circle size={20} className="text-rose-500 animate-pulse" />}
                                  </div>
                                ) : null}

                                <div className="min-w-0 flex-1 space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`text-xs sm:text-sm font-bold leading-snug ${isFull ? 'text-slate-400 line-through' : 'text-white'}`}>
                                      {item.name}
                                    </p>
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                      isFull ? 'bg-cyan-950/80 text-cyan-400 border-cyan-900' : isEmpty ? 'bg-rose-950/80 text-rose-400 border-rose-900' : 'bg-emerald-950/80 text-emerald-400 border-emerald-900'
                                    }`}>
                                      {totalQty}x
                                    </span>
                                  </div>

                                  {totalQty > 1 && (
                                    <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                      <div className={`inline-flex items-center justify-between rounded-xl border px-2 py-1 ${
                                        isFull ? 'bg-cyan-950/40 border-cyan-800/80' : isEmpty ? 'bg-rose-950/40 border-rose-800/80' : 'bg-emerald-950/40 border-emerald-800/80'
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          <button 
                                            type="button"
                                            onClick={async () => {
                                              if (editingPersonalId) return;
                                              if (checkedCount <= 0) return;
                                              const updatedIndices = Array.from({ length: checkedCount - 1 }, (_, i) => i);
                                              const updated = personalGear.map(p => 
                                                p.id === item.id ? { ...p, checkedIndices: updatedIndices, checked: updatedIndices.length >= p.qty } : p
                                              );
                                              setPersonalGear(updated);
                                              await updatePersonalGearToFirebase(updated);
                                            }}
                                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                          >
                                            <Minus size={12}/>
                                          </button>
                                          
                                          <span className={`text-xs font-bold font-mono px-1 ${
                                            isFull ? 'text-cyan-400' : isEmpty ? 'text-rose-400' : 'text-emerald-400'
                                          }`}>
                                            {checkedCount} dari {totalQty} ada
                                          </span>

                                          <button 
                                            type="button"
                                            onClick={async () => {
                                              if (editingPersonalId) return;
                                              if (checkedCount >= totalQty) return;
                                              const updatedIndices = Array.from({ length: checkedCount + 1 }, (_, i) => i);
                                              const updated = personalGear.map(p => 
                                                p.id === item.id ? { ...p, checkedIndices: updatedIndices, checked: updatedIndices.length >= p.qty } : p
                                              );
                                              setPersonalGear(updated);
                                              await updatePersonalGearToFirebase(updated);
                                            }}
                                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                          >
                                            <Plus size={12}/>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); setEditPersonalForm(item); setEditingPersonalId(item.id); }} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded-xl cursor-pointer transition-colors"><Edit3 size={15} /></button>
                                <button onClick={(e) => hapusPersonalItem(e, item.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"><X size={15} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* FORM TAMBAH PERSONAL GEAR + PILIH/TAMBAH KATEGORI MANUAL */}
          <form onSubmit={tambahPersonalItem} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 mt-4">
            <p className="text-xs font-bold text-slate-300">Tambah Perlengkapan Pribadi Baru</p>
            <div className="flex gap-2">
              <input type="text" value={newPersonalItem} onChange={(e) => setNewPersonalItem(e.target.value)} placeholder="Nama barang..." className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500" />
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                 <span className="text-[10px] font-bold text-slate-400">QTY:</span>
                 <input type="number" min="1" value={newPersonalQty} onChange={(e) => setNewPersonalQty(parseInt(e.target.value) || 1)} className="w-8 bg-transparent text-white text-xs text-center outline-none font-bold font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!isAddingCustomCategory ? (
                <select value={newPersonalCategory} onChange={(e) => {
                  if (e.target.value === 'ADD_NEW_CUSTOM') {
                    setIsAddingCustomCategory(true);
                  } else {
                    setNewPersonalCategory(e.target.value);
                  }
                }} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer">
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="ADD_NEW_CUSTOM">+ Tambah Kategori Baru</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={customCategoryInput} onChange={(e) => setCustomCategoryInput(e.target.value)} placeholder="Nama kategori baru..." className="flex-1 bg-slate-950 border border-cyan-500 text-white text-xs rounded-xl px-3 py-2 outline-none" autoFocus />
                  <button type="button" onClick={() => setIsAddingCustomCategory(false)} className="px-3 bg-slate-800 text-slate-300 rounded-xl text-xs">Batal</button>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md flex items-center justify-center gap-1.5">
                <Plus size={15}/> Tambah ke List
              </button>
            </div>
          </form>
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
            <div key={item.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-semibold text-white">{item.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex justify-end">
                    {item.status === 'clear' ? (
                      <span className="px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-900 text-emerald-400 rounded-xl text-[10px] font-extrabold font-mono">CLEAR</span>
                    ) : (
                      <span className="px-2.5 py-1.5 bg-amber-950/80 border border-amber-900 text-amber-400 rounded-xl text-[10px] font-extrabold font-mono">MINUS {item.naik - item.turun}</span>
                    )}
                  </div>
                  <button onClick={() => hapusWasteItem(item.id)} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-950/30 cursor-pointer transition-colors">
                    <X size={15}/>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center justify-between bg-slate-950 rounded-xl border border-slate-800 p-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold pl-1">Naik</span>
                  <div className="flex items-center">
                    <button onClick={() => updateWasteCount(item.id, 'naik', -1)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><Minus size={12}/></button>
                    <span className="w-6 text-center text-xs font-bold text-white font-mono">{item.naik}</span>
                    <button onClick={() => updateWasteCount(item.id, 'naik', 1)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><Plus size={12}/></button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-950 rounded-xl border border-slate-800 p-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold pl-1">Turun</span>
                  <div className="flex items-center">
                    <button onClick={() => updateWasteCount(item.id, 'turun', -1)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><Minus size={12}/></button>
                    <span className="w-6 text-center text-xs font-bold text-amber-400 font-mono">{item.turun}</span>
                    <button onClick={() => updateWasteCount(item.id, 'turun', 1)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><Plus size={12}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isAddingWaste ? (
            <form onSubmit={tambahWasteItem} className="flex gap-2 pt-2">
              <input type="text" value={newWasteItem} onChange={(e) => setNewWasteItem(e.target.value)} placeholder="Contoh: Kenzler, Kopi, dll" className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-2xl px-4 py-3 outline-none focus:border-amber-500" autoFocus />
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