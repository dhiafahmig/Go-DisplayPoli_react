import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faUserCheck, 
  faUserTimes, 
  faRedo,
  faUser,
  faTimesCircle,
  faVolumeUp,
  faSpinner,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

// Impor file audio langsung
import bellSound from '../assets/notification.mp3';

const PanggilPasienCard = ({ pasien, onPanggil, onUpdateStatus, onResetStatus, isCalling, index }) => {
  const audioRef = useRef(null);
  const bellAudioRef = useRef(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callProgress, setCallProgress] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastCallTime, setLastCallTime] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [buttonState, setButtonState] = useState('idle'); // idle, calling, success

  useEffect(() => {
    // Inisialisasi audio
    audioRef.current = new Audio();
    bellAudioRef.current = new Audio(bellSound);
    
    // Inisialisasi dan perbarui daftar suara
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };
    
    // Panggil sekali di awal
    updateVoices();
    
    // Dengarkan event voiceschanged
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    // Reset state jika isCalling berubah jadi false
    if (!isCalling && isCallInProgress) {
      setIsCallInProgress(false);
    }
  }, [isCalling, isCallInProgress]);

  useEffect(() => {
    // Efek flash saat sedang memanggil
    if (isCallInProgress || buttonState === 'calling') {
      setIsHighlighted(true);
    } else {
      // Hilangkan highlight setelah panggilan selesai
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCallInProgress, buttonState]);

  // Fungsi untuk memainkan suara lonceng
  const playBellSound = () => {
    return new Promise((resolve) => {
      try {
        console.log("Mencoba memainkan suara lonceng...");
        setCallProgress('Memainkan notifikasi...');
        
        // Gunakan bellAudioRef yang sudah diinisialisasi
        const bell = bellAudioRef.current;
        bell.volume = 0.6;
        
        // Reset bell ke awal jika sudah pernah diputar
        bell.currentTime = 0;
        
        bell.onended = () => {
          console.log("Suara lonceng selesai diputar");
          resolve();
        };
        
        bell.onerror = (err) => {
          console.error('Gagal memainkan suara lonceng:', err);
          resolve(); // Tetap resolve promise agar alur bisa lanjut
        };
        
        const playPromise = bell.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log("Suara lonceng berhasil dimulai");
          }).catch(err => {
            console.error('Error memutar lonceng:', err);
            resolve();
          });
        }
      } catch (e) {
        console.error("Error saat mencoba memainkan suara lonceng:", e);
        resolve();
      }
    });
  };

  // Fungsi helper untuk mendapatkan suara Bahasa Indonesia terbaik
  const getBestIndonesianVoice = () => {
    if (!availableVoices.length) return null;
    
    // Prioritas suara:
    // 1. Google Indonesia
    // 2. Microsoft Indonesia
    // 3. Suara Indonesia lainnya
    // 4. Default Google
    
    // Cari Google Indonesia
    const googleIndonesianVoice = availableVoices.find(
      voice => voice.name.includes('Google') && voice.lang.includes('id-ID')
    );
    if (googleIndonesianVoice) return googleIndonesianVoice;
    
    // Cari Microsoft Indonesia
    const microsoftIndonesianVoice = availableVoices.find(
      voice => voice.name.includes('Microsoft') && voice.lang.includes('id-ID')
    );
    if (microsoftIndonesianVoice) return microsoftIndonesianVoice;
    
    // Cari suara Indonesia lainnya
    const anyIndonesianVoice = availableVoices.find(
      voice => voice.lang.includes('id-ID')
    );
    if (anyIndonesianVoice) return anyIndonesianVoice;
    
    // Jika tidak ada, gunakan suara Google default
    const googleDefaultVoice = availableVoices.find(
      voice => voice.name.includes('Google')
    );
    if (googleDefaultVoice) return googleDefaultVoice;
    
    // Jika masih tidak ada, gunakan suara pertama
    return availableVoices[0];
  };

  // Fungsi helper untuk speech synthesis
  const speakText = (text) => {
    return new Promise((resolve) => {
      // Periksa apakah browser mendukung Speech Synthesis
      if ('speechSynthesis' in window) {
        setCallProgress('Membacakan pengumuman...');
        // Hentikan semua suara yang sedang berbicara
        window.speechSynthesis.cancel();
        
        // Buat utterance baru
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Pilih suara terbaik
        const bestVoice = getBestIndonesianVoice();
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
        
        // Pengaturan suara Indonesia
        utterance.lang = 'id-ID';
        
        // Atur volume dan kecepatan untuk mirip Google Translate
        utterance.volume = 1.0;   // Volume maksimum
        utterance.rate = 0.9;     // Sedikit lebih lambat dari normal
        utterance.pitch = 1.0;    // Pitch normal
        
        // Handler untuk event end
        utterance.onend = () => {
          resolve();
        };
        
        // Handler untuk error
        utterance.onerror = (err) => {
          console.error('SpeechSynthesis Error:', err);
          resolve();
        };
        
        // Log info suara yang digunakan (untuk debugging)
        console.log(`Menggunakan suara: ${utterance.voice ? utterance.voice.name : 'default'}`);
        
        // Mainkan suara
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('Browser tidak mendukung Speech Synthesis');
        resolve();
      }
    });
  };

  const playNotificationSound = async () => {
    try {
      // Set status memanggil
      setIsCallInProgress(true);
      setButtonState('calling');
      setCallProgress('Memulai proses panggilan...');
      
      // Mainkan suara lonceng terlebih dahulu
      await playBellSound();
      
      // Sangat singkat jeda antara bel dan panggilan
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Panggil endpoint PanggilPasienAPI dari backend Go
      setCallProgress('Mengirim data ke server...');
      const response = await fetch(`/api/antrian/panggil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nm_pasien: pasien.nm_pasien,
          kd_ruang_poli: pasien.kd_ruang_poli,
          nm_poli: pasien.nm_poli || 'poli',
          no_reg: pasien.no_reg,
          kd_display: '1', // Default display
          no_rawat: pasien.no_rawat
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memanggil pasien');
      }

      const result = await response.json();
      
      // Simpan pesan sukses
      setSuccessMessage(`Pasien ${pasien.nm_pasien} berhasil dipanggil!`);
      
      if (result.status === 'success') {
        // Coba putar audio dari server jika ada audio_url
        if (result.data.message.audio_url) {
          setCallProgress('Memainkan audio pengumuman...');
          const announcementAudio = new Audio(result.data.message.audio_url);
          announcementAudio.volume = 0.8;
          await announcementAudio.play();
        } else {
          // Jika tidak ada audio_url, gunakan browser speech synthesis
          const message = `Nomor antrian ${pasien.no_reg}, atas nama ${pasien.nm_pasien}, silakan menuju ke ruang poli ${pasien.kd_ruang_poli || 'poli'}`;
          await speakText(message);
        }
      } else {
        // Jika respon dari server tidak sukses, gunakan speech synthesis
        const message = `Nomor antrian ${pasien.no_reg}, atas nama ${pasien.nm_pasien}, silakan menuju ke ruang poli ${pasien.kd_ruang_poli || 'poli'}`;
        await speakText(message);
      }
      
      // Tunggu sebentar sebelum memainkan bel penutup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Mainkan sekali lagi suara lonceng di akhir
      setCallProgress('Menyelesaikan panggilan...');
      await playBellSound();
      
      // Tandai bahwa panggilan selesai
      setButtonState('success');
      
      // Reset ke idle setelah 3 detik
      setTimeout(() => {
        setButtonState('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error memanggil pasien:', error);
      
      // Mainkan suara lonceng
      await playBellSound();
      
      // Tunggu sesaat sebelum TTS (sangat singkat)
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Jika terjadi error saat memanggil API, gunakan speech synthesis
      const message = `Nomor antrian ${pasien.no_reg}, atas nama ${pasien.nm_pasien}, silakan menuju ke ruang poli ${pasien.kd_ruang_poli || 'poli'}`;
      await speakText(message);
      
      // Tunggu sebentar sebelum memainkan bel penutup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Mainkan lagi suara lonceng di akhir
      await playBellSound();
      
      // Tandai bahwa panggilan selesai tapi dengan error
      setButtonState('idle');
    } finally {
      setIsCallInProgress(false);
    }
  };

  const handlePanggil = async () => {
    // Cegah pemanggilan berulang terlalu cepat (minimal 3 detik antar panggilan)
    const now = Date.now();
    if (now - lastCallTime < 3000) {
      // Jika panggilan terlalu cepat, berikan pesan
      alert("Mohon tunggu beberapa saat sebelum memanggil pasien lagi");
      return;
    }
    
    setLastCallTime(now);
    
    try {
      // Mainkan suara notifikasi dengan perubahan state tombol
      await playNotificationSound();
      
      // Update UI di backend tanpa menampilkan alert
      if (typeof onPanggil === 'function') {
        await onPanggil(pasien, true); // Selalu gunakan silent mode
      }
    } catch (error) {
      console.error('Error dalam handlePanggil:', error);
      // Jika gagal memainkan suara, tetap update UI tanpa alert
      if (typeof onPanggil === 'function') {
        await onPanggil(pasien, true); // Selalu gunakan silent mode
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case '0':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FontAwesomeIcon icon={faUserCheck} className="mr-1" /> Hadir
          </span>
        );
      case '1':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FontAwesomeIcon icon={faUserTimes} className="mr-1" /> Tidak Hadir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FontAwesomeIcon icon={faUser} className="mr-1" /> Menunggu
          </span>
        );
    }
  };

  // Render tombol panggil berdasarkan state
  const getCallButton = () => {
    if (buttonState === 'calling' || isCalling) {
      return (
        <button 
          className="bg-blue-400 cursor-wait text-white px-3 py-1 rounded flex items-center justify-center min-w-[120px]"
          disabled={true}
          title={callProgress}
        >
          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1" /> 
          Memanggil...
        </button>
      );
    } else if (buttonState === 'success') {
      return (
        <button 
          className="bg-green-500 text-white px-3 py-1 rounded flex items-center justify-center min-w-[120px]"
          disabled={true}
        >
          <FontAwesomeIcon icon={faCheck} className="mr-1" /> 
          Berhasil
        </button>
      );
    } else {
      return (
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center justify-center min-w-[120px]"
          onClick={handlePanggil}
          disabled={isCalling || isCallInProgress}
          title="Panggil pasien melalui pengumuman"
          aria-label={`Panggil pasien ${pasien.nm_pasien}`}
        >
          <FontAwesomeIcon icon={faBell} className="mr-1" /> 
          Panggil
        </button>
      );
    }
  };

  return (
    <tr 
      className={`
        ${pasien.status === '0' ? 'bg-green-50' : pasien.status === '1' ? 'bg-red-50' : ''}
        ${isHighlighted ? 'bg-yellow-100 animate-pulse' : ''}
        transition-colors duration-300 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-300
      `}
      tabIndex="0"
      onKeyDown={(e) => {
        // Akses tombol dengan keyboard untuk aksesibilitas
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isCalling && !isCallInProgress && buttonState === 'idle') {
            handlePanggil();
          }
        }
      }}
    >
      <td className="py-3 px-4">{index + 1}</td>
      <td className="py-3 px-4 font-medium">{pasien.no_reg}</td>
      <td className="py-3 px-4">{pasien.nm_pasien}</td>
      <td className="py-3 px-4">{pasien.nama_dokter}</td>
      <td className="py-3 px-4">
        {getStatusBadge(pasien.status)}
      </td>
      <td className="py-2 px-4">
        <div className="flex justify-center space-x-2">
          {getCallButton()}
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center justify-center"
            onClick={() => onUpdateStatus(pasien, '0')}
            title="Tandai pasien hadir"
            aria-label={`Tandai ${pasien.nm_pasien} hadir`}
          >
            <FontAwesomeIcon icon={faUserCheck} className="mr-1" /> Hadir
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center justify-center"
            onClick={() => onUpdateStatus(pasien, '1')}
            title="Tandai pasien tidak hadir"
            aria-label={`Tandai ${pasien.nm_pasien} tidak hadir`}
          >
            <FontAwesomeIcon icon={faUserTimes} className="mr-1" /> Tidak
          </button>
          {(pasien.status === '0' || pasien.status === '1') && (
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center justify-center"
              onClick={() => onResetStatus(pasien)}
              title="Reset status pasien ke menunggu"
              aria-label={`Reset status ${pasien.nm_pasien}`}
            >
              <FontAwesomeIcon icon={faRedo} className="mr-1" /> Reset
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PanggilPasienCard; 