import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    // Inisialisasi audio
    audioRef.current = new Audio();
  }, []);

  const playNotificationSound = async () => {
    try {
      // Mainkan suara beep
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      
      // Mainkan suara
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        
        // Setelah beep selesai, mulai pengumuman
        setTimeout(async () => {
          try {
            // Panggil endpoint Golang untuk text-to-speech
            const response = await fetch('/api/tts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: `Nomor antrian ${pasien.no_reg}, ${pasien.nm_pasien}, silahkan menuju ke ruang poli`,
                lang: 'id-ID'
              })
            });

            if (!response.ok) {
              throw new Error('Gagal mendapatkan audio dari server');
            }

            // Dapatkan blob audio
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Mainkan audio
            const announcementAudio = new Audio(audioUrl);
            announcementAudio.volume = 0.7;
            
            await announcementAudio.play();

            // Setelah pengumuman selesai, mainkan beep kedua
            setTimeout(() => {
              const audio2 = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio2.volume = 0.5;
              audio2.play();
            }, 2000);

          } catch (error) {
            console.error('Error playing announcement:', error);
            // Jika gagal, mainkan beep kedua saja
            const audio2 = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio2.volume = 0.5;
            audio2.play();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const handlePanggil = async () => {
    try {
      // Mainkan suara notifikasi
      await playNotificationSound();
      
      // Panggil pasien
      await onPanggil(pasien);
    } catch (error) {
      console.error('Error in handlePanggil:', error);
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