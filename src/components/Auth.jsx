import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Heart, LogOut, AlertCircle, ArrowRight, ShieldCheck, Edit3, X, Trash2, CheckCircle2 } from 'lucide-react';

const MONKEY_AVATAR = 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=150&auto=format&fit=crop&q=80';

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function Auth({ currentUser, setCurrentUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [displayName, setDisplayName] = useState('');
  const [bloodType, setBloodType] = useState('O');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Orang Tua');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [bpjsNumber, setBpjsNumber] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [delUsername, setDelUsername] = useState('');
  const [delPassword, setDelPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isEditing) {
      setDisplayName(currentUser.displayName || currentUser.name || '');
      setBloodType(currentUser.bloodType || currentUser.blood || 'O');
      setMedicalHistory(currentUser.medicalHistory || currentUser.medicalNote || '');
      setEmergencyName(currentUser.emergencyName || '');
      setEmergencyRelation(currentUser.emergencyRelation || 'Orang Tua');
      setEmergencyPhone(currentUser.emergencyPhone || currentUser.emergency || '');
      setBpjsNumber(currentUser.bpjsNumber || currentUser.bpjs || '');
      setAvatar(currentUser.avatar || null);
    }
  }, [isEditing, currentUser]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setError('');
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        setAvatar(compressedBase64);
      } catch (err) {
        setError('Gagal memproses gambar, bro!');
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formattedEmail = `${username.toLowerCase().trim()}@jejakrimba.app`;

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data());
        } else {
          const fallbackData = {
            uid: userCredential.user.uid,
            username: username.trim(),
            displayName: username.trim(),
            name: username.trim(),
            bloodType: 'Tidak Tahu',
            medicalHistory: 'Tidak ada',
            emergencyName: '-',
            emergencyRelation: 'Orang Tua',
            emergencyPhone: '-',
            bpjsNumber: '-',
            avatar: MONKEY_AVATAR
          };
          await setDoc(doc(db, 'users', userCredential.user.uid), fallbackData);
          setCurrentUser(fallbackData);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
        const userData = {
          uid: userCredential.user.uid,
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          name: displayName.trim() || username.trim(),
          bloodType: bloodType || 'Tidak Tahu',
          medicalHistory: medicalHistory.trim() || 'Tidak ada',
          emergencyName: emergencyName.trim() || '-',
          emergencyRelation: emergencyRelation || 'Orang Tua',
          emergencyPhone: emergencyPhone.trim() || '-',
          bpjsNumber: bpjsNumber.trim() || '-',
          avatar: avatar || MONKEY_AVATAR
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        setCurrentUser(userData);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Username udah dipakai orang lain, bro! Coba ganti yang lain ya.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Username atau password salah, cuy. Coba dicek lagi.');
      } else {
        setError('Duh, ada error nih: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedData = {
        ...currentUser,
        displayName: displayName.trim() || currentUser.username,
        name: displayName.trim() || currentUser.username,
        bloodType: bloodType || 'Tidak Tahu',
        medicalHistory: medicalHistory.trim() || 'Tidak ada',
        medicalNote: medicalHistory.trim() || 'Tidak ada',
        emergencyName: emergencyName.trim() || '-',
        emergencyRelation: emergencyRelation || 'Orang Tua',
        emergencyPhone: emergencyPhone.trim() || '-',
        bpjsNumber: bpjsNumber.trim() || '-',
        avatar: avatar || currentUser.avatar || MONKEY_AVATAR
      };

      await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });
      setCurrentUser(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError('Gagal update profil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formattedEmail = `${delUsername.toLowerCase().trim()}@jejakrimba.app`;

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(formattedEmail, delPassword);
      
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);

      setCurrentUser(null);
      setShowDeleteModal(false);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-mismatch') {
        setError('Username atau password konfirmasi salah, bro!');
      } else {
        setError('Gagal menghapus akun: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setIsEditing(false);
  };

  if (currentUser) {
    if (isEditing) {
      return (
        <div className="w-full bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-2xl text-left transition-all">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-white !m-0">Edit Profil Pendaki</h2>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Panggilan</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Gol. Darah</label>
                <select 
                  value={bloodType} onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm cursor-pointer outline-none focus:border-emerald-500"
                >
                  {['A', 'B', 'AB', 'O', 'A+', 'B+', 'O+', 'AB+', 'Tidak Tahu'].map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Riwayat Penyakit</label>
                <input 
                  type="text" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Kontak</label>
                <input 
                  type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hubungan</label>
                <select 
                  value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm cursor-pointer outline-none focus:border-emerald-500"
                >
                  {['Orang Tua', 'Saudara Kandung', 'Pasangan', 'Teman', 'Lainnya'].map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">No. HP</label>
                <input 
                  type="text" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">No. BPJS</label>
              <input 
                type="text" value={bpjsNumber} onChange={(e) => setBpjsNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Ganti Avatar</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-slate-300 cursor-pointer" />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-2xl cursor-pointer">
                Batal
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-6 w-full text-left relative">
        <div className="w-full bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-2xl transition-all space-y-6">
          
          {/* Header Profil */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={!currentUser.avatar || currentUser.avatar.includes("53994a69daeb") ? MONKEY_AVATAR : currentUser.avatar} 
                  alt="Avatar" 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate !m-0">{currentUser.displayName || currentUser.name}</h2>
                <p className="text-xs text-slate-400 truncate mt-0.5">@{currentUser.username}</p>
              </div>
            </div>
            
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-inner shrink-0">
              <CheckCircle2 size={12}/> Active
            </span>
          </div>

          {/* List Informasi Medis & Darurat (Clean Responsive Stacked Card) */}
          <div className="space-y-3 text-xs">
            
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/70 shadow-sm gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Heart size={14} />
                </div>
                <span className="font-semibold text-slate-300">Golongan Darah</span>
              </div>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold font-mono">
                {currentUser.bloodType || currentUser.blood || 'Tidak Tahu'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/70 shadow-sm">
              <span className="font-semibold text-slate-400">Riwayat Medis</span>
              <span className="font-bold text-white sm:text-right break-words">
                {currentUser.medicalHistory || currentUser.medicalNote || 'Tidak ada'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/70 shadow-sm">
              <span className="font-semibold text-slate-400">Kontak Darurat</span>
              <span className="font-bold text-white sm:text-right break-words">
                {currentUser.emergencyName && currentUser.emergencyName !== '-' 
                  ? `${currentUser.emergencyName} (${currentUser.emergencyRelation}) - ${currentUser.emergencyPhone}` 
                  : (currentUser.emergencyContact || '-')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/70 shadow-sm gap-2">
              <span className="font-semibold text-slate-400">No. BPJS</span>
              <span className="font-mono font-bold text-white tracking-wider">
                {currentUser.bpjsNumber || currentUser.bpjs || '-'}
              </span>
            </div>

          </div>

          {/* Tombol Aksi */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-1.5 py-3 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Edit3 size={14} /> Edit Profil
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <LogOut size={14} /> Keluar
              </button>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-500/30 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Trash2 size={14} /> Hapus Akun Permanen
            </button>
          </div>
        </div>

        {/* Modal Konfirmasi Hapus Akun */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-left">
              <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
              <div>
                <h3 className="text-base font-bold text-rose-400 !m-0">Hapus Akun Permanen</h3>
                <p className="text-xs text-slate-400 mt-1">Masukkan kembali username dan password Anda untuk konfirmasi penghapusan akun.</p>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Konfirmasi Username</label>
                  <input 
                    type="text" required value={delUsername} onChange={(e) => setDelUsername(e.target.value)}
                    placeholder="Username Anda..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Konfirmasi Password</label>
                  <input 
                    type="password" required value={delPassword} onChange={(e) => setDelPassword(e.target.value)}
                    placeholder="Password Anda..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl cursor-pointer">
                    {loading ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                  <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer">
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

  return (
    <div className="w-full bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-2xl text-left transition-all">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white !m-0">
          {isLogin ? 'Welcome back' : 'Create workspace'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isLogin ? 'Masuk pakai username & password lo.' : 'Setup username & profil medis trip lo.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Panggilan</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alfin (Opsional)"
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Gol. Darah</label>
                <select 
                  value={bloodType} onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm cursor-pointer outline-none focus:border-emerald-500"
                >
                  {['A', 'B', 'AB', 'O', 'A+', 'B+', 'O+', 'AB+', 'Tidak Tahu'].map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Riwayat Penyakit</label>
                <input 
                  type="text" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Kosongkan jika aman"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Kontak</label>
                <input 
                  type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Cth: Suhelmi"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hubungan</label>
                <select 
                  value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm cursor-pointer outline-none focus:border-emerald-500"
                >
                  {['Orang Tua', 'Saudara Kandung', 'Pasangan', 'Teman', 'Lainnya'].map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">No. HP</label>
                <input 
                  type="text" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="0812xxxx"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">No. BPJS</label>
              <input 
                type="text" value={bpjsNumber} onChange={(e) => setBpjsNumber(e.target.value)}
                placeholder="Kosongkan jika tidak ada"
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Avatar (Opsional)</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-slate-300 cursor-pointer" />
            </div>
          </>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username</label>
          <input 
            type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="alfin_rimba"
            className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
          <input 
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer">
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} {!loading && <ArrowRight size={15} />}
        </button>
      </form>

      <div className="text-center mt-6">
        <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-slate-400 font-medium hover:text-white transition-colors cursor-pointer">
          {isLogin ? "Belum punya akun? Register" : "Sudah punya akun? Sign In"}
        </button>
      </div>
    </div>
  );
}