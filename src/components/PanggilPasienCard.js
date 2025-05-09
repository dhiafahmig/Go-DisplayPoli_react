import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faUserCheck, 
  faUserTimes, 
  faRedo,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const PanggilPasienCard = ({ pasien, onPanggil, onUpdateStatus, onResetStatus, isCalling, index }) => {
  const audioRef = useRef(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    // Inisialisasi audio
    audioRef.current = new Audio();
    
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
      // Panggil endpoint PanggilPasienAPI dari backend Go
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
      
      if (result.status === 'success') {
        // Coba putar audio dari server jika ada audio_url
        if (result.data.message.audio_url) {
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
    } catch (error) {
      console.error('Error memanggil pasien:', error);
      
      // Jika terjadi error saat memanggil API, gunakan speech synthesis
      const message = `Nomor antrian ${pasien.no_reg}, atas nama ${pasien.nm_pasien}, silakan menuju ke ruang poli ${pasien.kd_ruang_poli || 'poli'}`;
      await speakText(message);
    }
  };

  const handlePanggil = async () => {
    try {
      // Mainkan suara notifikasi
      await playNotificationSound();
      
      // Panggil pasien (update UI jika diperlukan)
      await onPanggil(pasien);
    } catch (error) {
      console.error('Error dalam handlePanggil:', error);
      // Jika gagal memainkan suara, tetap panggil pasien
      await onPanggil(pasien);
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

  return (
    <tr className={`${pasien.status === '0' ? 'bg-green-50' : pasien.status === '1' ? 'bg-red-50' : ''}`}>
      <td className="py-3 px-4">{index + 1}</td>
      <td className="py-3 px-4 font-medium">{pasien.no_reg}</td>
      <td className="py-3 px-4">{pasien.nm_pasien}</td>
      <td className="py-3 px-4">{pasien.nama_dokter}</td>
      <td className="py-3 px-4">
        {getStatusBadge(pasien.status)}
      </td>
      <td className="py-2 px-4">
        <div className="flex justify-center space-x-2">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={handlePanggil}
            disabled={isCalling}
          >
            <FontAwesomeIcon icon={faBell} /> Panggil
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => onUpdateStatus(pasien, '0')}
          >
            <FontAwesomeIcon icon={faUserCheck} /> Hadir
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => onUpdateStatus(pasien, '1')}
          >
            <FontAwesomeIcon icon={faUserTimes} /> Tidak
          </button>
          {(pasien.status === '0' || pasien.status === '1') && (
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
              onClick={() => onResetStatus(pasien)}
            >
              <FontAwesomeIcon icon={faRedo} /> Reset
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PanggilPasienCard; 