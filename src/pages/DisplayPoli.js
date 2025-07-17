import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PoliCard from '../components/PoliCard';
import FullscreenButton from '../components/FullscreenButton';
import useWebSocket from '../hooks/useWebSocket';

// Verifikasi path asset
const verifyAssetPath = (path) => {
  const isAbsolutePath = path.startsWith('http://') || path.startsWith('https://');
  if (isAbsolutePath) return path;
  
  // Jika bukan absolute path, pastikan ada PUBLIC_URL
  return `${process.env.PUBLIC_URL || ''}${path.startsWith('/') ? path : `/${path}`}`;
};

const DisplayPoli = () => {
  const { kdDisplay } = useParams();
  const [poliList, setPoliList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const containerRef = useRef(null);
  
  // Mengelola koneksi WebSocket
  const { lastMessage, connectionStatus } = useWebSocket(kdDisplay);
  
  // Mengambil data poli saat komponen dimount
  useEffect(() => {
    const fetchPoliData = async () => {
      try {
        console.log(`Fetching poli data for display: ${kdDisplay}`);
        const response = await axios.get(`/api/display/poli/${kdDisplay}`);
        console.log('Poli data received:', response.data);
        setPoliList(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching poli data:', error);
        setError(`Gagal memuat data: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchPoliData();
    
    // Backup polling jika WebSocket gagal
    let intervalId;
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      console.log('WebSocket disconnected, starting backup polling');
      intervalId = setInterval(fetchPoliData, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [kdDisplay, connectionStatus]);
  
  // Memproses pesan WebSocket yang diterima
  useEffect(() => {
    if (lastMessage && kdDisplay === lastMessage.kd_display) {
      console.log('Processing WebSocket message:', lastMessage);
      
      // Jangan proses pesan INITIAL yang hanya untuk konfirmasi koneksi
      if (lastMessage.kd_ruang_poli === "INITIAL" || lastMessage.type === "INIT") {
        console.log('Initial connection message received, ignoring for display update');
        return;
      }
      
      // Update data poli dengan data baru
      setPoliList(prevList => {
        return prevList.map(poli => {
          if (poli.kd_ruang_poli === lastMessage.kd_ruang_poli) {
            console.log(`Updating poli ${poli.kd_ruang_poli} with new patient data`);
            return {
              ...poli,
              getPasien: [{
                nm_pasien: lastMessage.nm_pasien,
                no_reg: lastMessage.no_reg,
                nama_dokter: lastMessage.nama_dokter || poli.getPasien?.[0]?.nama_dokter || 'Dokter',
                jam_mulai: lastMessage.jam_mulai || poli.getPasien?.[0]?.jam_mulai || '00:00'
              }]
            };
          }
          return poli;
        });
      });
      
      // Terapkan efek highlight pada card
      const highlightCard = () => {
        const poliCard = document.getElementById(`poli-card-${lastMessage.kd_ruang_poli}`);
        if (poliCard) {
          poliCard.classList.add('highlight-shadow');
          setTimeout(() => {
            poliCard.classList.remove('highlight-shadow');
          }, 5000);
        } else {
          console.warn(`Poli card not found for ${lastMessage.kd_ruang_poli}`);
        }
      };
      
      highlightCard();
    }
  }, [lastMessage, kdDisplay]);
  
  // Mengatur layout berdasarkan jumlah poli
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const poliCount = poliList.length;
      
      // Khusus untuk 3 poli, sesuaikan layout
      if (poliCount === 3) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [poliList.length]);
  
  // Render berbeda berdasarkan jumlah poli
  const renderPoliGrid = () => {
    const poliCount = poliList.length;
    
    if (poliCount === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="far fa-calendar-times text-6xl text-gray-300 mb-5 animate-pulse-slow"></i>
            <p className="text-2xl text-gray-500 font-bold">Tidak ada poli yang terdaftar</p>
            <p className="text-sm text-gray-400 mt-2 font-medium">Silakan konfigurasi poli pada halaman pengaturan</p>
          </div>
        </div>
      );
    }
    
    if (poliCount === 1) {      // Layout untuk 1 poli
      return (
        <div className="container max-w-7xl mx-auto px-4">
          {poliList.map(poli => (
            <PoliCard key={poli.kd_ruang_poli} poli={poli} layout="single" />
          ))}
        </div>
      );
    } else if (poliCount === 2) {
      // Layout untuk 2 poli
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-28 max-w-7xl mx-auto">
          {poliList.map(poli => (
            <PoliCard key={poli.kd_ruang_poli} poli={poli} layout="double" />
          ))}
        </div>
      );
    } else if (poliCount === 3) {
      // Layout khusus untuk 3 poli
      return (
        <div className="three-poli-grid">
          {poliList.map((poli, index) => (
            <PoliCard key={poli.kd_ruang_poli} poli={poli} layout="triple" isSmall={true} />
          ))}
        </div>
      );
    } else {
      // Layout default untuk 4+ poli
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-28">
          {poliList.map((poli, index) => (
            <div key={poli.kd_ruang_poli} className="w-full">
              <PoliCard poli={poli} layout="multi" />
            </div>
          ))}
        </div>
      );
    }
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button 
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-primary-700 font-medium">Memuat Data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="kioskContainer" ref={containerRef} className="kiosk-mode flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {renderPoliGrid()}
      </div>
      
      <Footer />
      
      <FullscreenButton />
    </div>
  );
};

export default DisplayPoli; 