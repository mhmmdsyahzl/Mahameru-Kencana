import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import {  
  Mountain, Calendar, MapPin, Plus, Trash2, Edit3, Compass,  
  UserPlus, Check, X, Map, Info, Shield, ShieldAlert,  
  Package, Wallet, Clock, Users, ChevronDown, ChevronUp,
  Award, Archive, CheckCircle2, HeartPulse, BellRing,
  BookAIcon,
  BookCheck,
  BookDown,
  BookText,
  TrendingUpIcon,
  MountainSnow,
  MonitorUp,
  LucideMountain,
  MousePointer
} from 'lucide-react';
import GearLogistics from './GearLogistics';
import TripFinance from './TripFinance';
import TripTimelineMap from './TripTimelineMap';
import TripSafety from './TripSafety';
import TripLogbookArchive from './TripLogbookArchive';
import TripWeatherWidget from './TripWeatherWidget';
import P3KGuide from './P3KGuide';

const mountainDatabase = [
  { name: "Gn. Pangradinan (Bandung)", location: "Jawa Barat", grade: "I" },
  { name: "Gn. Singa (Bandung)", location: "Jawa Barat", grade: "I" },
  { name: "Gn. Telemoyo (Semarang)", location: "Jawa Tengah", grade: "I" },
  { name: "Gn. Papandayan (Garut)", location: "Jawa Barat", grade: "I" },
  { name: "Gn. Putri Lembang (Bandung)", location: "Jawa Barat", grade: "I" },
  { name: "Gn. Prau (Wonosobo)", location: "Jawa Tengah", grade: "I" },
  { name: "Gn. Sangar (Bandung)", location: "Jawa Barat", grade: "I" },
  { name: "Gn. Sikunir (Dieng)", location: "Jawa Tengah", grade: "I" },
  { name: "Gn. Padakasih (Cimahi)", location: "Jawa Barat", grade: "I" },
  { name: "Lembah Ramma (Gowa)", location: "Sulawesi Selatan", grade: "I" },
  { name: "Gn. Bromo (Probolinggo)", location: "Jawa Timur", grade: "I" },
  { name: "Gn. Permisan (Malang)", location: "Jawa Timur", grade: "I" },
  { name: "Danau Slank (Maros)", location: "Sulawesi Selatan", grade: "I" },
  { name: "Gn. Kareumbi (Sumedang)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Bongkok (Purwakarta)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Pawitra/Penanggungan (Mojokerto)", location: "Jawa Timur", grade: "II" },
  { name: "Gn. Muria (Kudus)", location: "Jawa Tengah", grade: "II" },
  { name: "Bukit Jempol (Lahat)", location: "Sumatera Selatan", grade: "II" },
  { name: "Gn. Pakuwaja (Wonosobo)", location: "Jawa Tengah", grade: "II" },
  { name: "Gn. Tangkuban Perahu (Subang)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Patuha (Ciwidey)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Lemongan (Lumajang)", location: "Jawa Timur", grade: "II" },
  { name: "Gn. Ungaran (Semarang)", location: "Jawa Tengah", grade: "II" },
  { name: "Gn. Galunggung (Tasikmalaya)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Sibayak (Berastagi)", location: "Sumatera Utara", grade: "II" },
  { name: "Gn. Tampomas (Sumedang)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Manglayang (Bandung)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Kerenceng (Sumedang)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Sagara (Garut)", location: "Jawa Barat", grade: "II" },
  { name: "Gn. Ijen (Banyuwangi)", location: "Jawa Timur", grade: "II" },
  { name: "Gn. Ambang (Kotamobagu)", location: "Sulawesi Utara", grade: "II" },
  { name: "Gn. Tambora (Dompu)", location: "Nusa Tenggara Barat", grade: "II" },
  { name: "Lembah Lohe (Gowa)", location: "Sulawesi Selatan", grade: "II" },
  { name: "Gn. Bawakaraeng (Gowa)", location: "Sulawesi Selatan", grade: "III" },
  { name: "Gn. Parang (Purwakarta)", location: "Jawa Barat", grade: "III" },
  { name: "Gn. Sindoro (Temanggung)", location: "Jawa Tengah", grade: "III" },
  { name: "Gn. Lompobattang (Bantaeng)", location: "Sulawesi Selatan", grade: "III" },
  { name: "Gn. Cikuray (Garut)", location: "Jawa Barat", grade: "III" },
  { name: "Gn. Talang (Solok)", location: "Sumatera Barat", grade: "III" },
  { name: "Gn. Sinabung (Karo)", location: "Sumatera Utara", grade: "III" },
  { name: "Gn. Lorokan (Mojokerto)", location: "Jawa Timur", grade: "III" },
  { name: "Gn. Lawu (Karanganyar)", location: "Jawa Tengah / Jawa Timur", grade: "III" },
  { name: "Gn. Antang (Tanah Bumbu)", location: "Kalimantan Selatan", grade: "III" },
  { name: "Gn. Bukittunggul (Bandung)", location: "Jawa Barat", grade: "III" },
  { name: "Gn. Gede (Cianjur)", location: "Jawa Barat", grade: "III" },
  { name: "Gn. Sibuatan (Karo)", location: "Sumatera Utara", grade: "III" },
  { name: "Gn. Daun (Rejang Lebong)", location: "Bengkulu", grade: "III" },
  { name: "Gn. Wilis (Madiun)", location: "Jawa Timur", grade: "III" },
  { name: "Gn. Soputan (Minahasa)", location: "Sulawesi Utara", grade: "III" },
  { name: "Gn. Burangrang (Bandung Barat)", location: "Jawa Barat", grade: "III" },
  { name: "Gn. Malabar (Bandung)", location: "Jawa Barat", grade: "III" },
  { name: "Gn. Merbabu (Magelang)", location: "Jawa Tengah", grade: "III" },
  { name: "Gn. Halimun Salak (Bogor)", location: "Jawa Barat / Banten", grade: "III" },
  { name: "Gn. Argopuro (Probolinggo)", location: "Jawa Timur", grade: "IV" },
  { name: "Gn. Slamet (Purwokerto)", location: "Jawa Tengah", grade: "IV" },
  { name: "Gn. Latimojong (Enrekang)", location: "Sulawesi Selatan", grade: "IV" },
  { name: "Gn. Dempo (Pagar Alam)", location: "Sumatera Selatan", grade: "IV" },
  { name: "Gn. Agung (Karangasem)", location: "Bali", grade: "IV" },
  { name: "Gn. Arjuno (Pasuruan)", location: "Jawa Timur", grade: "IV" },
  { name: "Gn. Welirang (Mojokerto)", location: "Jawa Timur", grade: "IV" },
  { name: "Gn. Patah (Kaur)", location: "Bengkulu / Sumatera Selatan", grade: "IV" },
  { name: "Gn. Talamau (Pasaman Barat)", location: "Sumatera Barat", grade: "IV" },
  { name: "Gn. Karang (Pandeglang)", location: "Banten", grade: "IV" },
  { name: "Gn. Mekongga (Kolaka)", location: "Sulawesi Tenggara", grade: "IV" },
  { name: "Bukit Raya (Melawi)", location: "Kalimantan Barat / Kalimantan Tengah", grade: "IV" },
  { name: "Gn. Sumbing (Wonosobo)", location: "Jawa Tengah", grade: "IV" },
  { name: "Gn. Semeru (Lumajang)", location: "Jawa Timur", grade: "IV" },
  { name: "Gn. Kerinci (Kerinci)", location: "Jambi / Sumatera Barat", grade: "IV" },
  { name: "Gn. Rinjani (Lombok)", location: "Nusa Tenggara Barat", grade: "IV" },
  { name: "Gn. Ciremai (Kuningan)", location: "Jawa Barat", grade: "IV" },
  { name: "Gn. Gandang Dewata (Mamasa)", location: "Sulawesi Barat", grade: "IV" },
  { name: "Gn. Cartensz Pyramid (Mimika)", location: "Papua Tengah", grade: "V" },
  { name: "Gn. Trikora (Jayawijaya)", location: "Papua Pegunungan", grade: "V" },
  { name: "Gn. Leuser (Aceh Tenggara)", location: "Aceh", grade: "V" },
  { name: "Gn. Tolangi-Balease (Luwu Utara)", location: "Sulawesi Selatan", grade: "V" },
  { name: "Gn. Raung (Banyuwangi)", location: "Jawa Timur", grade: "V" },
  { name: "Gn. Binaiya (Seram Bagian Timur)", location: "Maluku", grade: "V" }
];

const roleDescriptions = {
  "Leader": "Memimpin jalannya ekspedisi, mengambil keputusan krusial di jalur.",
  "Sweeper": "Menjaga barisan paling belakang, memastikan tidak ada anggota tim yang tertinggal.",
  "Navigator/Map Reader": "Bertanggung jawab membaca rute, arah kompas, dan peta.",
  "Pointman/Scout": "Berjalan paling depan untuk memantau kondisi jalur atau rintangan.",
  "Timer/Pace Keeper": "Mengatur ritme perjalanan dan waktu istirahat agar sesuai jadwal.",
  "Logistics Officer": "Mengatur perbekalan, distribusi logistik, dan perlengkapan kelompok.",
  "Chef/Cook": "Bertanggung jawab meracik dan memasak makanan di basecamp/tenda.",
  "Medical Officer": "Memegang P3K dan menangani cedera atau masalah kesehatan darurat.",
  "Road Captain": "Pemimpin barisan konvoi riding, mengatur formasi dan kecepatan di jalan.",
  "Voorijder": "Membuka jalan paling depan saat konvoi motor (mengamankan jalur/persimpangan).",
  "Driver": "Mengemudikan kendaraan roda empat atau logistik utama tim."
};

const allAvailableRoles = Object.keys(roleDescriptions);

const getRealMapDistanceKm = (depCity, destName) => {
  const dep = (depCity || '').toLowerCase();
  const dest = (destName || '').toLowerCase();

  if (dep.includes('kalimantan') || dep.includes('pontianak') || dep.includes('ketapang') || dep.includes('singkawang')) {
    if (dest.includes('jawa') || dest.includes('jakarta') || dest.includes('bandung') || dest.includes('semarang') || dest.includes('surabaya') || dest.includes('yogyakarta')) {
      return 1100; 
    }
    if (dest.includes('sumatera') || dest.includes('pekanbaru') || dest.includes('padang') || dest.includes('medan') || dest.includes('kerinci') || dest.includes('talang')) {
      return 1400; 
    }
    return 300;
  }

  if (dep.includes('pekanbaru') || dep.includes('dumai')) {
    if (dest.includes('talang') || dest.includes('maninjau') || dest.includes('padang') || dest.includes('bukittinggi') || dest.includes('toba')) {
      return 175;
    }
    if (dest.includes('medan') || dest.includes('sibayak')) {
      return 325;
    }
    if (dest.includes('kerinci')) {
      return 225;
    }
    if (dest.includes('jawa') || dest.includes('jakarta') || dest.includes('bandung')) {
      return 600;
    }
    return 75;
  }

  if (dep.includes('jakarta') || dest.includes('bandung') || dep.includes('bogor')) {
    if (dest.includes('bali') || dest.includes('lombok') || dest.includes('rinjani')) {
      return 600;
    }
    if (dest.includes('surabaya') || dest.includes('bromo') || dest.includes('ijen') || dest.includes('semeru')) {
      return 400;
    }
    if (dest.includes('papandayan') || dest.includes('prau') || dest.includes('sindoro') || dest.includes('slamet')) {
      return 175;
    }
    return 125;
  }

  return 200;
};

export default function TripManager({ currentUser }) {
  const [trips, setTrips] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeMapTrip, setActiveMapTrip] = useState(null);
  const [activeRoleInfo, setActiveRoleInfo] = useState(null);
  const [mainViewTab, setMainViewTab] = useState('hub');
  
  // State Deteksi Sinyal PWA Online/Offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [userHomeCity, setUserHomeCity] = useState('');
  const [expandedTripIds, setExpandedTripIds] = useState({});
  const [editingRolesMember, setEditingRolesMember] = useState(null);
  const [selectedInviteUserUid, setSelectedInviteUserUid] = useState('');

  const [editingTripId, setEditingTripId] = useState(null);
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState('climbing'); 
  const [departureCity, setDepartureCity] = useState('');
  
  const [destinations, setDestinations] = useState([]);
  const [destinationSelectInput, setDestinationSelectInput] = useState('');
  const [customDestinationInput, setCustomDestinationInput] = useState('');

  const [tripType, setTripType] = useState('Solo');
  const [dateMode, setDateMode] = useState('fixed');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [vehicle, setVehicle] = useState('motor');
  const [fuelEstimate, setFuelEstimate] = useState('');
  const [roles, setRoles] = useState(['Leader']);
  const [previewImage, setPreviewImage] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleToggle = (tripId, section) => {
    setOpenSection(prev => ({
        ...prev,
        [tripId]: prev[tripId] === section ? null : section
    }));
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Koneksi pulih! Data otomatis tersinkron ke cloud. ⚡");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("⚠️ Kehilangan sinyal! Masuk ke Mode Offline (Data lokal aman).");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeTrips = onSnapshot(collection(db, 'trips'), (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(tripsData);
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setAllUsers(usersList);
      if (currentUser) {
        const me = usersList.find(u => u.uid === currentUser.uid);
        if (me && me.homeCity) {
          setUserHomeCity(me.homeCity);
        }
      }
    });

    const fetchUserDataOnce = async () => {
      if (!currentUser) return;
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        let currentHomeCity = 'Pekanbaru';
        if (userSnap.exists()) {
          currentHomeCity = userSnap.data().homeCity || 'Pekanbaru';
          setUserHomeCity(currentHomeCity);
        } else {
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            homeCity: 'Pekanbaru'
          }, { merge: true });
          setUserHomeCity('Pekanbaru');
        }
      } catch (err) {
        console.error("Gagal load user data:", err);
      }
    };
    fetchUserDataOnce();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeTrips();
      unsubscribeUsers();
    };
  }, [currentUser]);

  const handleUpdateUserHomeCity = async (newCity) => {
    setUserHomeCity(newCity);
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), { homeCity: newCity });
      } catch (err) {
        console.error("Gagal update kota asal:", err);
      }
    }
  };

  const toggleExpandTrip = (tripId) => {
    setExpandedTripIds(prev => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const handleOpenCreateModal = () => {
    setEditingTripId(null);
    setTitle('');
    setDepartureCity(userHomeCity || 'Pekanbaru');
    setDestinations([]);
    setDestinationSelectInput('');
    setCustomDestinationInput('');
    setStartDate('');
    setEndDate('');
    setTargetMonth('');
    setFuelEstimate('');
    setTripType('Solo');
    setActivityType('climbing');
    setVehicle('motor');
    setRoles(['Leader']);
    setShowModal(true);
  };

  const handleOpenEditModal = (trip) => {
    setEditingTripId(trip.id);
    setTitle(trip.title || '');
    setDepartureCity(trip.departureCity || userHomeCity || '');
    setDestinations(trip.destinations || []);
    setDestinationSelectInput('');
    setCustomDestinationInput('');
    setTripType(trip.tripType || 'Solo');
    setActivityType(trip.activityType || 'climbing');
    setDateMode(trip.dateMode || 'fixed');
    setStartDate(trip.startDate && trip.startDate !== '-' ? trip.startDate : '');
    setEndDate(trip.endDate && trip.endDate !== '-' ? trip.endDate : '');
    setTargetMonth(trip.dateMode === 'month' ? trip.startDate : '');
    setVehicle(trip.vehicle || 'motor');
    setFuelEstimate(trip.fuelEstimate || trip.targetKas || '');
    setRoles(trip.roles || ['Leader']);
    setShowModal(true);
  };

  const handleRemoveDestination = (destToRemove) => {
    setDestinations(destinations.filter(d => d !== destToRemove));
  };

  const calculateAdventureExp = (actType, dests, depCity) => {
    let exp = 0;
    const gradePoints = { 'I': 100, 'II': 250, 'III': 500, 'IV': 900, 'V': 1500 };
    let totalOneWayKm = 0;
    dests.forEach(dest => {
      totalOneWayKm += getRealMapDistanceKm(depCity, dest);
    });

    if (actType === 'climbing' || actType === 'both') {
      dests.forEach(dName => {
        const found = mountainDatabase.find(m => m.name === dName);
        const g = found ? found.grade : 'I';
        exp += gradePoints[g] || 100;
      });
    }

    if (actType === 'riding' || actType === 'both') {
      exp += totalOneWayKm;
    }

    return exp > 0 ? exp : 100;
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    if (destinations.length === 0) {
      showToast("Harap tambahkan minimal 1 destinasi / rute tujuan! 🗺️");
      return;
    }

    let highestGrade = "I";
    destinations.forEach(dName => {
      const found = mountainDatabase.find(m => m.name === dName);
      if (found) {
        if (found.grade === "V" || (highestGrade !== "V" && found.grade === "IV")) highestGrade = found.grade;
        else if (found.grade === "IV" && (highestGrade === "I" || highestGrade === "II" || highestGrade === "III")) highestGrade = "IV";
        else if (found.grade === "III" && (highestGrade === "I" || highestGrade === "II")) highestGrade = "III";
        else if (found.grade === "II" && highestGrade === "I") highestGrade = "II";
      }
    });

    const currentExp = calculateAdventureExp(activityType, destinations, departureCity);
    const numericKas = Number(fuelEstimate.replace(/\D/g, '')) || 0;

    const tripPayload = {
      title: title.trim(),
      activityType,
      departureCity: departureCity.trim(),
      destinations,
      grade: activityType === 'riding' ? 'Riding' : highestGrade,
      expReward: currentExp,
      tripType,
      dateMode,
      startDate: dateMode === 'fixed' ? startDate : targetMonth,
      endDate: dateMode === 'fixed' ? endDate : '-',
      vehicle,
      fuelEstimate: vehicle === 'public' ? '0' : (fuelEstimate.trim() || '0'),
      targetKas: numericKas,
      roles
    };

    try {
      if (editingTripId) {
        await updateDoc(doc(db, 'trips', editingTripId), tripPayload);
        showToast("Trip berhasil diperbarui! 🚀");
      } else {
        const newTrip = {
          ...tripPayload,
          creatorUid: currentUser.uid,
          creatorName: currentUser.displayName,
          status: 'active',
          photos: [],
          members: [{ 
            uid: currentUser.uid, 
            displayName: currentUser.displayName || currentUser.username || 'Leader', 
            avatar: currentUser.avatar || '', 
            role: ['Leader'] 
          }],
          requests: []
        };
        await addDoc(collection(db, 'trips'), newTrip);
        showToast("Trip baru berhasil dibuat! 🎉");
      }

      setShowModal(false);
      setEditingTripId(null);
    } catch (err) {
      showToast("Gagal menyimpan trip: " + err.message);
    }
  };

  const handleToggleArchiveTrip = async (trip) => {
    if (trip.status !== 'archived') {
      const timelines = trip.timelines || trip.rundown || [];
      const hasUnfinishedTimeline = timelines.some(item => !item.completed && !item.isDone && !item.status);
      
      if (timelines.length > 0 && hasUnfinishedTimeline) {
        showToast("⚠️ Belum bisa selesaikan trip! Masih ada rundown kegiatan yang belum beres.");
        return;
      }
    }

    const newStatus = trip.status === 'archived' ? 'active' : 'archived';
    try {
      await updateDoc(doc(db, 'trips', trip.id), { status: newStatus });
      showToast(newStatus === 'archived' ? "Trip sukses diarsipkan! EXP & Leveling resmi bertambah! 🏆⚡" : "Trip dikembalikan ke status Aktif! 🚀");
    } catch (err) {
      showToast("Gagal mengubah status arsip trip. ❌");
    }
  };

  const handleDeleteTrip = async (id) => {
    try {
      await deleteDoc(doc(db, 'trips', id));
      showToast("Trip berhasil dihapus! 🗑️");
    } catch (err) {
      showToast("Gagal menghapus trip: " + err.message);
    }
  };

  const handleUploadPhoto = async (trip, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5MB, bro! ⚠️");
      return;
    }

    const currentPhotos = trip.photos || [];
    if (currentPhotos.length >= 5) {
      showToast("Maksimal upload 5 foto per trip! 📸");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      const newPhotoObj = {
        url: base64String,
        uploadedBy: currentUser.displayName || 'User',
        date: new Date().toLocaleDateString('id-ID')
      };
      try {
        await updateDoc(doc(db, 'trips', trip.id), {
          photos: [...currentPhotos, newPhotoObj]
        });
        showToast("Foto berhasil diunggah ke galeri! 📸✨");
      } catch (err) {
        showToast("Gagal mengunggah foto. ❌");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (trip, photoIndex) => {
    const currentPhotos = trip.photos || [];
    const updatedPhotos = currentPhotos.filter((_, idx) => idx !== photoIndex);
    try {
      await updateDoc(doc(db, 'trips', trip.id), { photos: updatedPhotos });
      showToast("Foto berhasil dihapus dari galeri! 🗑️");
    } catch (err) {
      showToast("Gagal menghapus foto. ❌");
    }
  };

  const handleSaveJournal = async (tripId, notes) => {
    try {
      await updateDoc(doc(db, 'trips', tripId), { journalNotes: notes });
      showToast("Catatan jurnal perjalanan berhasil disimpan! 📖✨");
    } catch (err) {
      showToast("Gagal menyimpan jurnal. ❌");
    }
  };

  const handleDirectInvite = async (trip) => {
    if (!selectedInviteUserUid) return;
    const targetUser = allUsers.find(u => u.uid === selectedInviteUserUid);
    if (!targetUser) return;

    const alreadyMember = trip.members?.some(m => m.uid === targetUser.uid);
    if (alreadyMember) {
      showToast("User tersebut sudah menjadi anggota tim. ⚠️");
      return;
    }

    const updatedMembers = [...(trip.members || []), { uid: targetUser.uid, displayName: targetUser.displayName, avatar: targetUser.avatar, role: ['Participant'], partnerRiding: '-' }];
    const updatedTripType = updatedMembers.length > 1 ? 'Group' : trip.tripType;

    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        members: updatedMembers,
        tripType: updatedTripType
      });
      setSelectedInviteUserUid('');
      showToast(`Berhasil mengundang ${targetUser.displayName} ke dalam trip! 🎉`);
    } catch (err) {
      showToast("Gagal mengundang user. ❌");
    }
  };

  const handleRequestJoin = async (trip) => {
    const alreadyRequested = trip.requests?.some(r => r.uid === currentUser.uid);
    const alreadyMember = trip.members?.some(m => m.uid === currentUser.uid);
    if (alreadyRequested || alreadyMember) return;

    const meUser = allUsers.find(u => u.uid === currentUser.uid);
    const updatedRequests = [...(trip.requests || []), { uid: currentUser.uid, displayName: meUser?.displayName || currentUser.displayName, avatar: meUser?.avatar || currentUser.avatar }];
    try {
      await updateDoc(doc(db, 'trips', trip.id), { requests: updatedRequests });
      showToast("Berhasil mengirim request join! 🤝");
    } catch (err) {
      showToast("Gagal mengirim request join. ❌");
    }
  };

  const handleAcceptRequest = async (trip, reqUser) => {
    const freshReqUserObj = allUsers.find(u => u.uid === reqUser.uid) || reqUser;
    const updatedRequests = trip.requests.filter(r => r.uid !== reqUser.uid);
    const updatedMembers = [...trip.members, { uid: freshReqUserObj.uid, displayName: freshReqUserObj.displayName, avatar: freshReqUserObj.avatar, role: ['Participant'], partnerRiding: '-' }];
    const updatedTripType = updatedMembers.length > 1 ? 'Group' : trip.tripType;

    try {
      await updateDoc(doc(db, 'trips', trip.id), { 
        requests: updatedRequests, 
        members: updatedMembers,
        tripType: updatedTripType 
      });
      showToast("Berhasil menerima member ke dalam tim! 🚀");
    } catch (err) {
      showToast("Gagal menerima member. ❌");
    }
  };

  const handleRejectRequest = async (trip, reqUid) => {
    const updatedRequests = trip.requests.filter(r => r.uid !== reqUid);
    try {
      await updateDoc(doc(db, 'trips', trip.id), { requests: updatedRequests });
      showToast("Permintaan gabung ditolak. 🚫");
    } catch (err) {
      showToast("Gagal menolak request. ❌");
    }
  };

  const handleKickMember = async (trip, memberUid) => {
    if (memberUid === trip.creatorUid) return;
    const updatedMembers = trip.members.filter(m => m.uid !== memberUid);
    const updatedTripType = updatedMembers.length <= 1 ? 'Solo' : trip.tripType;

    try {
      await updateDoc(doc(db, 'trips', trip.id), { 
        members: updatedMembers,
        tripType: updatedTripType
      });
      showToast("Member berhasil dikeluarkan dari trip. 👢");
    } catch (err) {
      showToast("Gagal mengeluarkan member. ❌");
    }
  };

  const handleSaveMemberRoles = async (tripId, memberUid, newRoles) => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip) return;

    let cleanRoles = [];
    if (Array.isArray(newRoles)) {
      cleanRoles = newRoles.flat(Infinity).filter(r => typeof r === 'string' && r.trim() !== '');
    } else if (typeof newRoles === 'string') {
      cleanRoles = [newRoles];
    }
    
    if (cleanRoles.includes('Leader')) {
      const isLeaderTakenByOther = targetTrip.members.some(m => m.uid !== memberUid && (Array.isArray(m.role) ? m.role.includes('Leader') : m.role === 'Leader'));
      if (isLeaderTakenByOther) {
        showToast("Role Leader sudah dipegang oleh anggota lain! ⚠️");
        return;
      }
    }

    if (cleanRoles.length === 0) {
      cleanRoles = ['Participant'];
    }

    const updatedMembers = targetTrip.members.map(m => {
      if (m.uid === memberUid) {
        return { ...m, role: cleanRoles };
      }
      return m;
    });

    try {
      await updateDoc(doc(db, 'trips', tripId), { members: updatedMembers });
      setEditingRolesMember(null);
      showToast("Role member berhasil diperbarui! 🛡️");
    } catch (err) {
      showToast("Gagal menyimpan role member: " + err.message);
    }
  };

  const getGoogleMapsDirectionsUrl = (trip) => {
    const origin = encodeURIComponent(trip.departureCity || userHomeCity || 'Pekanbaru');
    const dests = trip.destinations || [];
    if (dests.length === 0) return `https://www.google.com/maps/search/?api=1&query=${origin}`;
    const lastDest = encodeURIComponent(dests[dests.length - 1]);
    const waypoints = dests.slice(0, dests.length - 1).map(d => encodeURIComponent(d)).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${lastDest}${waypoints ? `&waypoints=${waypoints}` : ''}`;
  };

  const getGoogleMapsEmbedUrl = (trip) => {
    const queryParts = [trip.departureCity, ...(trip.destinations || [])].filter(Boolean);
    return `https://maps.google.com/maps?q=${encodeURIComponent(queryParts.join(' to '))}&output=embed`;
  };

  const activeTripsList = trips.filter(t => t.status !== 'archived');

  return (
    <div className="w-full space-y-6 text-left relative">
      
      {/* Header Section: Mobile Optimized & Multi-Color Theme */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        
        {/* Sisi Kiri: Judul & Deskripsi */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <Compass size={13} className="animate-spin" /> Mahameru Kencana Workspace
            </div>
            
            {/* Indikator Status Sinyal PWA Offline/Online */}
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border shadow-inner ${
              isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight !m-0">Trip Hub & Workspace</h2>
          <p className="text-xs sm:text-sm text-slate-400">Kelola ekspedisi, rute, galeri foto, dan pantau level petualang Anda.</p>
        </div>

        {/* Sisi Kanan: Kontrol & Navigasi Fleksibel */}
        <div className="flex flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
          
          {/* Baris Atas Kanan: Input Kota & Tombol Buat Trip Berjajar Rapi */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-between sm:justify-end flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950/90 px-3.5 py-2 rounded-2xl border border-slate-800/80 shadow-inner flex-1 sm:flex-initial">
              <MapPin className="text-emerald-400 shrink-0" size={14}/>
              <input 
                type="text" 
                value={userHomeCity} 
                onChange={(e) => setUserHomeCity(e.target.value)}
                onBlur={(e) => handleUpdateUserHomeCity(e.target.value)}
                placeholder="Kota Asal Anda" 
                className="bg-transparent text-xs text-white outline-none w-24 sm:w-28"
              />
            </div>

            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"  
            >
              <Plus size={15} /> Buat Trip Baru
            </button>
          </div>

          {/* Baris Bawah Kanan: Tab Menu Navigasi (Multi-Color Responsive) */}
   <div className="grid grid-cols-3 gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner w-full lg:w-auto">
  
  <button 
    onClick={() => setMainViewTab('hub')}
    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
      mainViewTab === 'hub' 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <Mountain size={14} className="shrink-0" />
    <span className="truncate">Trip Hub</span>
  </button>

  <button 
    onClick={() => setMainViewTab('p3k')}
    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
      mainViewTab === 'p3k' 
        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
        : 'text-slate-400 hover:text-cyan-400'
    }`}
  >
    <HeartPulse size={14} className="shrink-0" />
    <span className="truncate">P3K Guide</span>
  </button>

  <button 
    onClick={() => setMainViewTab('logbookArchive')}
    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
      mainViewTab === 'logbookArchive' 
        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' 
        : 'text-slate-400 hover:text-amber-400'
    }`}
  >
    <Award size={14} className="shrink-0" />
    <span className="truncate">Arsip</span>
  </button>

</div>

        </div>
      </div>

      {activeMapTrip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Map size={16} className="text-emerald-400"/> Google Maps Route ({activeMapTrip.destinations?.length || 0} Titik Kunjungan)
              </h3>
              <button onClick={() => setActiveMapTrip(null)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
            </div>
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe title="Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={getGoogleMapsEmbedUrl(activeMapTrip)}></iframe>
            </div>
            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-slate-400">📍 Rute: {activeMapTrip.departureCity} ➔ {activeMapTrip.destinations?.join(' ➔ ')}</p>
              <a href={getGoogleMapsDirectionsUrl(activeMapTrip)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">Buka Maps HP</a>
            </div>
          </div>
        </div>
      )}

      {activeRoleInfo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info size={16} className="text-emerald-400"/> Info Role: {activeRoleInfo}
              </h3>
              <button onClick={() => setActiveRoleInfo(null)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18}/></button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {roleDescriptions[activeRoleInfo] || "Deskripsi role belum tersedia."}
            </p>
            <button onClick={() => setActiveRoleInfo(null)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl cursor-pointer">
              Mengerti
            </button>
          </div>
        </div>
      )}

      {editingRolesMember && (() => {
        const targetTrip = trips.find(t => t.id === editingRolesMember.tripId);
        const currentSelectedRoles = Array.isArray(editingRolesMember.currentRole) ? editingRolesMember.currentRole : [editingRolesMember.currentRole];
        const leaderTaken = targetTrip?.members?.some(m => m.uid !== editingRolesMember.memberUid && (Array.isArray(m.role) ? m.role.includes('Leader') : m.role === 'Leader'));
        const activeHoveredRole = currentSelectedRoles[currentSelectedRoles.length - 1] || 'Leader';

        return (
          <div onClick={() => setEditingRolesMember(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Shield size={16} className="text-emerald-400" /> Atur Role Anggota Tim</h3>
                <button onClick={() => setEditingRolesMember(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
              </div>

              <div className="flex flex-wrap gap-2">
                {allAvailableRoles.map((roleName) => {
                  const isSelected = currentSelectedRoles.includes(roleName);
                  const isLeaderDisabled = roleName === 'Leader' && leaderTaken && !isSelected;

                  return (
                    <button
                      key={roleName}
                      type="button"
                      disabled={isLeaderDisabled}
                      onClick={() => {
                        let updated = [];
                        if (isSelected) {
                          updated = currentSelectedRoles.filter(r => r !== roleName);
                        } else {
                          let filtered = currentSelectedRoles;
                          if (roleName === 'Participant') {
                            filtered = [];
                          } else {
                            filtered = currentSelectedRoles.filter(r => r !== 'Participant');
                          }
                          updated = [...filtered, roleName];
                        }
                        if (updated.length === 0) updated = ['Participant'];
                        setEditingRolesMember({ ...editingRolesMember, currentRole: updated });
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                        isLeaderDisabled 
                          ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-50' 
                          : isSelected 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {roleName} {isSelected && '✓'} {isLeaderDisabled && '(Sudah ada Leader)'}
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Info size={12} /> Penjelasan Role ({activeHoveredRole}):
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {roleDescriptions[activeHoveredRole] || "Pilih role di atas untuk melihat deskripsi tugas."}
                </p>
              </div>

              <button onClick={() => handleSaveMemberRoles(editingRolesMember.tripId, editingRolesMember.memberUid, editingRolesMember.currentRole)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold cursor-pointer">Simpan Role</button>
            </div>
          </div>
        );
      })()}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{editingTripId ? 'Edit Perencanaan Trip' : 'Form Perencanaan Trip Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmitTrip} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Judul Trip</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh : MT.MERBABU 3145 MDPL" className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kota Keberangkatan</label>
                  <input type="text" required value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} placeholder="Kota Asal" className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jenis Aktivitas</label>
                  <select value={activityType} onChange={(e) => { setActivityType(e.target.value); setDestinations([]); }} className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="climbing">🏔️ Pendakian Gunung</option>
                    <option value="riding">🏍️ Riding / Touring</option>
                    <option value="both">⚡ Gunung & Riding / Touring</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Destinasi / Titik Rute</label>
                
                {activityType !== 'riding' && (
                  <div className="flex gap-2">
                    <select value={destinationSelectInput} onChange={(e) => setDestinationSelectInput(e.target.value)} className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer">
                      <option value="">Pilih Gunung</option>
                      {mountainDatabase.map((item, idx) => (
                        <option key={idx} value={item.name}>
                          {item.name} (Grade {item.grade})
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => { if (destinationSelectInput && !destinations.includes(destinationSelectInput)) { setDestinations([...destinations, destinationSelectInput]); setDestinationSelectInput(''); }}} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-2xl cursor-pointer">+ Tambah</button>
                  </div>
                )}

                {activityType !== 'climbing' && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customDestinationInput} 
                      onChange={(e) => setCustomDestinationInput(e.target.value)} 
                      placeholder="Ketik Nama Destinasi" 
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500" 
                    />
                    <button type="button" onClick={() => { if (customDestinationInput.trim() && !destinations.includes(customDestinationInput.trim())) { setDestinations([...destinations, customDestinationInput.trim()]); setCustomDestinationInput(''); }}} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-2xl cursor-pointer">+ Tambah</button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {destinations.map((dest, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold">
                      {dest} <button type="button" onClick={() => handleRemoveDestination(dest)} className="cursor-pointer hover:text-white"><X size={12}/></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipe Trip</label>
                  <select value={tripType} onChange={(e) => setTripType(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="Solo">👤 Solo Expedition</option>
                    <option value="Group">👥 Group Expedition</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Moda Transportasi</label>
                  <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="motor">🏍️ Sepeda Motor</option>
                    <option value="car">🚗 Mobil / Rental</option>
                    <option value="public">🚌 Angkutan Umum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mode Jadwal</label>
                  <select value={dateMode} onChange={(e) => setDateMode(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="fixed">📅 Tanggal Pasti</option>
                    <option value="month">🗓️ Estimasi Bulan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Biaya / Kas (Rp)</label>
                  <input type="text" value={fuelEstimate} onChange={(e) => setFuelEstimate(e.target.value)} placeholder="Contoh: 150000" className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 font-mono" />
                </div>
              </div>

              {dateMode === 'fixed' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal Mulai</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal Selesai</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Bulan / Waktu</label>
                  <input type="text" value={targetMonth} onChange={(e) => setTargetMonth(e.target.value)} placeholder="Contoh: Akhir Bulan November 2026" className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white outline-none" />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-bold rounded-2xl shadow-lg cursor-pointer transition-all">Simpan Trip</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl cursor-pointer">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mainViewTab === 'p3k' ? (
        <P3KGuide />
      ) : mainViewTab === 'logbookArchive' ? (
        <TripLogbookArchive 
          trips={trips} 
          allUsers={allUsers}
          currentUser={currentUser} 
          onToggleArchive={handleToggleArchiveTrip} 
          onUploadPhoto={handleUploadPhoto} 
          onDeletePhoto={handleDeletePhoto} 
          onPreviewImage={setPreviewImage} 
          onSaveJournal={handleSaveJournal}
        />
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Daftar Ekspedisi Tim & Public Hub</h3>
          {activeTripsList.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-900/50 rounded-3xl border border-slate-800">Belum ada trip aktif terdaftar.</p>
          ) : (
            activeTripsList.map(trip => {
              const targetStr = trip.startDate || "";
              let isApproaching = false;
              let isToday = false;
              let badgeText = "Mendekat!";

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              if (targetStr.includes("-") && targetStr.length >= 10) {
                  const tripDate = new Date(targetStr);
                  tripDate.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
                  
                  if (diffDays >= 0 && diffDays <= 7) {
                    isApproaching = true;
                    isToday = diffDays === 0;
                    badgeText = isToday ? "Hari-H ⚡" : "Mendekat!";
                  }
              } else {
                  const lowerTarget = targetStr.toLowerCase();
                  const currentMonthName = today.toLocaleString('id-ID', { month: 'long' }).toLowerCase();
                  const currentYear = today.getFullYear().toString();

                  if (lowerTarget.includes(currentMonthName) && lowerTarget.includes(currentYear)) {
                    isApproaching = true;
                    badgeText = "Lets Go 🚀";
                  } else if (lowerTarget.includes(currentMonthName) && !/\d{4}/.test(lowerTarget)) {
                    isApproaching = true;
                    badgeText = "Mendekati Bulan Target ⚡";
                  }
              }

              const isCreator = trip.creatorUid === currentUser?.uid;
              const isMember = trip.members?.some(m => m.uid === currentUser?.uid);
              const isRequested = trip.requests?.some(r => r.uid === currentUser?.uid);
              const isThisExpanded = Boolean(expandedTripIds?.[trip.id]);
              const currentMember = trip.members?.find(m => m.uid === currentUser?.uid);
              const isLeader = isCreator || (Array.isArray(currentMember?.role) ? currentMember?.role.includes('Leader') : currentMember?.role === 'Leader');
              const isNavigator = isLeader || (Array.isArray(currentMember?.role) ? currentMember?.role.includes('Navigator/Map Reader') : currentMember?.role === 'Navigator/Map Reader');
              const availableUsersToInvite = allUsers.filter(u => u && u.uid && !trip.members.some(m => m.uid === u.uid) && !trip.requests?.some(r => r.uid === u.uid));
              const formattedActivity = trip.activityType === 'both' ? 'Riding & Daki' : (trip.activityType === 'riding' ? 'Riding' : 'Pendakian');

              return (
                <div key={trip.id} className={`bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-2xl border rounded-3xl p-5 shadow-2xl transition-all space-y-4 ${isApproaching ? 'border-amber-500/60 shadow-amber-500/5' : 'border-slate-800/80 hover:border-slate-700'}`}>
                  <div onClick={() => toggleExpandTrip(trip.id)} className="cursor-pointer select-none space-y-3">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-bold text-[11px] rounded-xl border border-amber-500/25 flex items-center gap-1 shadow-inner">
                        <Clock size={11} /> +{trip.expReward || 100} EXP
                      </span>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 font-bold text-[11px] rounded-xl border border-blue-500/20">
                        {trip.tripType || 'Solo'} Trip
                      </span>
                      <span className="px-3 py-1 bg-slate-800/80 text-slate-300 font-semibold text-[11px] rounded-xl uppercase tracking-wider">
                        {formattedActivity}
                      </span>
                      {isApproaching && (
                        <span className="px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                          <Clock size={11} /> <span>{badgeText}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-base font-bold text-white tracking-wide !m-0">
                          {trip.title} <span className="text-xs font-medium text-slate-400 font-normal">({trip.destinations?.[0] || 'Destinasi'})</span>
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-2xl border border-emerald-500/25 transition-all shrink-0">
                        <span>{isThisExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
                        {isThisExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                      <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5"/>
                      <p className="leading-relaxed break-words">
                        <strong className="text-white">Rute:</strong> {trip.departureCity} ➔ {trip.destinations?.join(' ➔ ')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800">
                        <Calendar size={13} className="text-emerald-400"/> 
                        {trip.dateMode === 'fixed' ? `${trip.startDate}` : `Target: ${trip.startDate}`}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800 text-slate-300">
                        <Users size={13} className="text-emerald-400"/> 
                        {trip.members?.length || 1} Anggota Tim
                      </span>
                    </div>

                  </div>

                  {isThisExpanded && (
                    <div className="border-t border-slate-800/80 pt-4 space-y-4 animate-in fade-in duration-300">
                      
                      <TripWeatherWidget trip={trip} />

                      <div className="bg-slate-950/70 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
                        <div className="space-y-1.5 text-xs text-slate-300">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Rute Perjalanan:</span> 
                          <p className="font-bold text-white text-sm leading-relaxed break-words">
                            {trip.departureCity} ➔ {trip.destinations?.join(' ➔ ')}
                          </p>
                          <p className="pt-2"><span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Estim Kas / Biaya:</span> <span className="font-mono font-bold text-amber-400">Rp {Number(trip.targetKas || trip.fuelEstimate || 0).toLocaleString('id-ID')}</span></p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                          <div className="flex flex-wrap items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMapTrip(trip); }} 
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm"
                            >
                              <Compass size={14}/> Peta ({trip.destinations?.length || 1} Titik)
                            </button>

                            {isCreator && (
                              <button 
                                onClick={() => handleToggleArchiveTrip(trip)}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold rounded-2xl cursor-pointer shadow-sm"
                                title="Selesaikan & Arsipkan Trip"
                              >
                                <Archive size={14}/> Selesaikan Trip
                              </button>
                            )}

                            {!isMember && !isRequested && (
                              <button 
                                onClick={() => handleRequestJoin(trip)} 
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-2xl cursor-pointer shadow-sm"
                              >
                                <UserPlus size={14}/> Request Join
                              </button>
                            )}

                            {isRequested && !isMember && (
                              <span className="px-3.5 py-2.5 bg-amber-950/40 text-amber-400 border border-amber-900/50 text-xs rounded-2xl font-medium">⏳ Menunggu Konfirmasi</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isNavigator && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(trip); }}
                                className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-800 bg-slate-900 rounded-2xl cursor-pointer transition-colors shadow-sm"
                                title="Edit Trip"
                              >
                                <Edit3 size={15} />
                              </button>
                            )}

                            {isCreator && (
                              <button onClick={() => handleDeleteTrip(trip.id)} className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 bg-slate-900 rounded-2xl cursor-pointer transition-colors shadow-sm" title="Hapus Trip">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-emerald-400"/>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Anggota Tim ({trip.members?.length || 0}):</span>
                          </div>

                          {isCreator && availableUsersToInvite.length > 0 && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <select 
                                value={selectedInviteUserUid} 
                                onChange={(e) => setSelectedInviteUserUid(e.target.value)}
                                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white cursor-pointer outline-none focus:border-emerald-500"
                              >
                                <option value="">-- Pilih User untuk Diundang --</option>
                                {availableUsersToInvite.map(u => (
                                  <option key={u.uid} value={u.uid}>{u.displayName} (@{u.username})</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => handleDirectInvite(trip)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-semibold rounded-2xl cursor-pointer whitespace-nowrap shadow-md"
                              >
                                Undang Langsung
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {trip.members?.map((m, idx) => {
                            const isMe = m.uid === currentUser?.uid;
                            const freshUserDoc = allUsers.find(u => u.uid === m.uid) || {};
                            const currentAvatar = freshUserDoc.avatar || m.avatar || 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=100&auto=format&fit=crop&q=80';
                            const currentDisplayName = freshUserDoc.displayName || m.displayName || 'User';

                            const rolesArray = Array.isArray(m.role) ? m.role : (m.role ? m.role.split(',').map(r => r.trim()) : ['Participant']);
                            const uniqueRoles = [...new Set(rolesArray)];

                            return (
                              <div key={idx} className="bg-slate-950/85 backdrop-blur-2xl border border-slate-800/90 p-4 rounded-3xl space-y-3 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <img 
                                      src={currentAvatar.includes("53994a69daeb") ? "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=100&auto=format&fit=crop&q=80" : currentAvatar} 
                                      alt="Avatar" 
                                      onClick={() => setPreviewImage(currentAvatar)}
                                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md cursor-pointer hover:opacity-80 transition-all shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
                                        <span className="truncate">{currentDisplayName}</span>
                                        {m.uid === trip.creatorUid && (
                                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-semibold shrink-0">Creator</span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5">Anggota Tim Ekspedisi</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {(isCreator || isMe) && (
                                      <button 
                                        onClick={() => setEditingRolesMember({ tripId: trip.id, memberUid: m.uid, currentRole: m.role || 'Participant' })}
                                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer border border-slate-800 transition-colors shadow-sm"
                                        title="Atur Role"
                                      >
                                        <Shield size={14}/>
                                      </button>
                                    )}
                                    {isCreator && m.uid !== currentUser?.uid && (
                                      <button onClick={() => handleKickMember(trip, m.uid)} className="p-2 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 rounded-xl cursor-pointer border border-rose-900/50 transition-colors shadow-sm" title="Keluarkan member">
                                        <X size={14}/>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-900/80 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-bold text-slate-400 mr-1">Role:</span>
                                  {uniqueRoles.map((r, rIdx) => (
                                    <span 
                                      key={rIdx} 
                                      onClick={() => setActiveRoleInfo(r)}
                                      className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer hover:bg-emerald-500/25 transition-all"
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {isCreator && trip.requests?.length > 0 && (
                        <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-3xl space-y-2.5 backdrop-blur-xl">
                          <p className="text-xs font-bold text-amber-400">Permintaan Gabung Masuk ({trip.requests.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {trip.requests.map((req, idx) => {
                              const freshReqUser = allUsers.find(u => u.uid === req.uid) || req;
                              return (
                                <div key={idx} className="flex items-center gap-2.5 bg-slate-950/90 px-3.5 py-2 rounded-2xl border border-slate-800 shadow-md">
                                  <img src={freshReqUser.avatar || req.avatar || "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=150"} alt="Req" className="w-7 h-7 rounded-xl object-cover" /> 
                                  <span className="text-xs font-bold text-white">{freshReqUser.displayName || req.displayName}</span>
                                  <button onClick={() => handleAcceptRequest(trip, req)} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer shadow-sm"><Check size={13}/></button>
                                  <button onClick={() => handleRejectRequest(trip, req.uid)} className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl cursor-pointer shadow-sm"><X size={13}/></button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isMember ? (
                        <div className="space-y-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-300">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggle(trip.id, 'gear')}
                              className={`group relative flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border transition-all cursor-pointer ${
                                openSection[trip.id] === 'gear'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <Package size={17} className="transition-transform group-hover:scale-110" />
                              <span className="text-xs font-bold tracking-wide">Gear</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggle(trip.id, 'finance')}
                              className={`group relative flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border transition-all cursor-pointer ${
                                openSection[trip.id] === 'finance'
                                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <Wallet size={17} className="transition-transform group-hover:scale-110" />
                              <span className="text-xs font-bold tracking-wide">Keuangan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggle(trip.id, 'timeline')}
                              className={`group relative flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border transition-all cursor-pointer ${
                                openSection[trip.id] === 'timeline'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <Compass size={17} className="transition-transform group-hover:scale-110" />
                              <span className="text-xs font-bold tracking-wide">Rundown</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggle(trip.id, 'safety')}
                              className={`group relative flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border transition-all cursor-pointer ${
                                openSection[trip.id] === 'safety'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <ShieldAlert size={17} className="transition-transform group-hover:scale-110" />
                              <span className="text-xs font-bold tracking-wide">Safety</span>
                            </button>
                          </div>

                          {openSection[trip.id] === 'gear' && <GearLogistics tripId={trip.id} currentUser={currentUser} isLeader={isLeader} isNavigator={isNavigator} tripMembers={trip.members} />}
                          {openSection[trip.id] === 'finance' && <TripFinance trip={trip} currentUser={currentUser} />}
                          {openSection[trip.id] === 'timeline' && <TripTimelineMap trip={trip} currentUser={currentUser} />}
                          {openSection[trip.id] === 'safety' && <TripSafety trip={trip} currentUser={currentUser} />}
                        </div>
                      ) : (
                        <div className="p-5 bg-slate-950/70 backdrop-blur-xl border border-slate-800 rounded-3xl text-center space-y-2 mt-4 shadow-xl">
                          <p className="text-xs font-bold text-white tracking-wide">Akses Terbatas 🔒</p>
                          <p className="text-xs text-slate-400 leading-relaxed">Anda belum bergabung dalam tim ekspedisi ini. Kirim permintaan gabung di atas untuk melihat logistik, keuangan, dan rundown.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {previewImage && (
        <div onClick={() => setPreviewImage(null)} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white p-2 hover:text-slate-300 cursor-pointer"><X size={24}/></button>
            <img src={previewImage} alt="Preview" className="max-h-[85vh] max-w-full rounded-3xl object-contain border border-slate-800 shadow-2xl" />
          </div>
        </div>
      )}

      {/* NOTIFIKASI MODERN (Floating Glassmorphism Toast) */}
      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-slate-700/80 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <BellRing size={13} />
          </div>
          <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}