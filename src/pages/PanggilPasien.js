import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useWebSocket from '../hooks/useWebSocket';

const PanggilPasien = () => {
  const { kdPoli } = useParams();
  const [poliData, setPoliData] = useState(null);
  const [antrian, setAntrian] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const containerRef = useRef(null);
  
  // Mengambil data poli dan antrian pasien
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const poliResponse = await axios.get(`/api/poli/${kdPoli}`);
        setPoliData(poliResponse.data);
        
        const antrianResponse = await axios.get(`/api/poli/${kdPoli}/antrian`);
        setAntrian(antrianResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Gagal memuat data: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data setiap 30 detik
    const intervalId = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [kdPoli]);
  
  // Fungsi untuk memanggil pasien
  const callPatient = async (pasien) => {
    try {
      setCallStatus('calling');
      setSelectedPasien(pasien);
      
      // Kirim permintaan ke API untuk memperbarui status panggilan
      await axios.post(`/api/poli/${kdPoli}/panggil`, {
        no_reg: pasien.no_reg,
        kd_ruang_poli: kdPoli
      });
      
      setCallStatus('success');
      
      // Reset status setelah 5 detik
      setTimeout(() => {
        setCallStatus('idle');
        setSelectedPasien(null);
      }, 5000);
      
      // Refresh data antrian
      const antrianResponse = await axios.get(`/api/poli/${kdPoli}/antrian`);
      setAntrian(antrianResponse.data);
    } catch (error) {
      console.error('Error calling patient:', error);
      setCallStatus('error');
      
      // Reset status setelah 3 detik
      setTimeout(() => {
        setCallStatus('idle');
      }, 3000);
    }
  };
  
  // Fungsi untuk menandai pasien sudah diperiksa
  const markAsExamined = async (pasien) => {
    try {
      await axios.post(`/api/poli/${kdPoli}/selesai`, {
        no_reg: pasien.no_reg
      });
      
      // Refresh data antrian
      const antrianResponse = await axios.get(`/api/poli/${kdPoli}/antrian`);
      setAntrian(antrianResponse.data);
    } catch (error) {
      console.error('Error marking patient as examined:', error);
      alert('Gagal menandai pasien sebagai sudah diperiksa');
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
    <div ref={containerRef} className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Informasi Poli */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {poliData?.nm_poli || 'Poli'}
            </h1>
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {poliData?.kd_poli || kdPoli}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-gray-600">
              <p><i className="fas fa-user-md mr-2"></i>Dokter: <span className="font-semibold">{poliData?.nama_dokter || 'Belum ditentukan'}</span></p>
              <p><i className="far fa-clock mr-2"></i>Jam Praktek: <span className="font-semibold">{poliData?.jam_mulai || '00:00'} - {poliData?.jam_selesai || '00:00'}</span></p>
            </div>
            <div className="text-gray-600">
              <p><i className="fas fa-users mr-2"></i>Jumlah Antrian: <span className="font-semibold">{antrian.length || 0}</span></p>
              <p><i className="fas fa-check-circle mr-2"></i>Status: <span className="font-semibold text-green-600">Aktif</span></p>
            </div>
          </div>
        </div>
        
        {/* Panel Pemanggilan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pasien Saat Ini</h2>
          
          {selectedPasien ? (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{selectedPasien.nm_pasien}</p>
                  <p className="text-gray-600">No. Registrasi: {selectedPasien.no_reg}</p>
                  <p className="text-gray-600">No. RM: {selectedPasien.no_rm}</p>
                </div>
                <div>
                  {callStatus === 'calling' && (
                    <div className="animate-pulse">
                      <i className="fas fa-volume-up text-3xl text-yellow-500"></i>
                      <p className="text-sm text-yellow-600">Memanggil...</p>
                    </div>
                  )}
                  {callStatus === 'success' && (
                    <div>
                      <i className="fas fa-check-circle text-3xl text-green-500"></i>
                      <p className="text-sm text-green-600">Terpanggil</p>
                    </div>
                  )}
                  {callStatus === 'error' && (
                    <div>
                      <i className="fas fa-exclamation-circle text-3xl text-red-500"></i>
                      <p className="text-sm text-red-600">Gagal</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={() => callPatient(selectedPasien)}
                  disabled={callStatus === 'calling'}
                >
                  <i className="fas fa-volume-up mr-2"></i>
                  Panggil Ulang
                </button>
                <button 
                  className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                  onClick={() => markAsExamined(selectedPasien)}
                >
                  <i className="fas fa-check mr-2"></i>
                  Selesai Diperiksa
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-6 text-center">
              <i className="far fa-bell-slash text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">Belum ada pasien yang dipanggil</p>
            </div>
          )}
        </div>
        
        {/* Daftar Antrian */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Antrian</h2>
          
          {antrian.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">No. RM</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama Pasien</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {antrian.map((pasien, index) => (
                    <tr key={pasien.no_reg} className={pasien.status === 'dipanggil' ? 'bg-yellow-50' : ''}>
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4 text-sm">{pasien.no_rm}</td>
                      <td className="py-3 px-4 text-sm">{pasien.nm_pasien}</td>
                      <td className="py-3 px-4 text-sm">
                        {pasien.status === 'menunggu' && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Menunggu</span>}
                        {pasien.status === 'dipanggil' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Dipanggil</span>}
                        {pasien.status === 'diperiksa' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Diperiksa</span>}
                        {pasien.status === 'selesai' && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Selesai</span>}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button 
                          className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded mr-2"
                          onClick={() => callPatient(pasien)}
                          disabled={pasien.status === 'dipanggil' || pasien.status === 'diperiksa' || pasien.status === 'selesai'}
                        >
                          <i className="fas fa-volume-up mr-1"></i>
                          Panggil
                        </button>
                        <button 
                          className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded"
                          onClick={() => markAsExamined(pasien)}
                          disabled={pasien.status === 'menunggu' || pasien.status === 'selesai'}
                        >
                          <i className="fas fa-check mr-1"></i>
                          Selesai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="far fa-clipboard text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">Tidak ada pasien dalam antrian</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PanggilPasien; 