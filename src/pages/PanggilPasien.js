import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faRedo,
  faExclamationTriangle,
  faBell,
  faUserCheck,
  faUserTimes,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const PanggilPasien = () => {
  const { kd_ruang_poli } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poliInfo, setPoliInfo] = useState(null);
  const [pasienList, setPasienList] = useState([]);
  const [isCallingPatient, setIsCallingPatient] = useState(false);

  // Update jam setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mengambil data dari API
  useEffect(() => {
    fetchData();
  }, [kd_ruang_poli]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/antrian/poli/${kd_ruang_poli}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPoliInfo(data.data.poli_info);
        setPasienList(data.data.antrian);
        setError(null);
      } else {
        throw new Error('Format data tidak valid');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Coba lagi dengan endpoint lama jika API JSON gagal
      try {
        const oldApiResponse = await fetch(`/api/panggil/${kd_ruang_poli}`);
        if (oldApiResponse.ok) {
          const oldData = await oldApiResponse.json();
          if (oldData.success) {
            setPoliInfo(oldData.data.poli_info);
            setPasienList(oldData.data.pasien_list);
            setError(null);
            return;
          }
        }
      } catch (secondError) {
        console.error('Error fetching from old API as well:', secondError);
      }
      
      setError('Gagal memuat data pasien. Pastikan server berjalan dan API tersedia.');
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil pasien
  const handlePanggilPasien = async (pasien) => {
    try {
      setIsCallingPatient(true);
      
      const response = await fetch('/api/antrian/panggil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nm_pasien: pasien.nm_pasien,
          kd_ruang_poli: kd_ruang_poli,
          nm_poli: poliInfo?.nama_ruang_poli || 'Poli',
          no_reg: pasien.no_reg,
          kd_display: 'DISPLAY1'
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Feedback visual sukses
        alert(`Pasien ${pasien.nm_pasien} berhasil dipanggil!`);
      } else {
        // Coba dengan endpoint lama jika fail
        const oldApiResponse = await fetch('/api/panggilpoli', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nm_pasien: pasien.nm_pasien,
            kd_ruang_poli: kd_ruang_poli,
            nm_poli: poliInfo?.nama_ruang_poli || 'Poli',
            no_reg: pasien.no_reg,
            kd_display: 'DISPLAY1'
          }),
        });
        
        if (oldApiResponse.ok) {
          const oldData = await oldApiResponse.json();
          if (oldData.success) {
            alert(`Pasien ${pasien.nm_pasien} berhasil dipanggil!`);
            return;
          }
        }
        
        throw new Error(data.message || 'Gagal memanggil pasien');
      }
    } catch (error) {
      console.error('Error calling patient:', error);
      alert(`Gagal memanggil pasien: ${error.message}`);
    } finally {
      setIsCallingPatient(false);
    }
  };

  // Menandai status pasien (hadir/tidak)
  const handleUpdateStatus = async (pasien, status) => {
    try {
      const response = await fetch('/api/antrian/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          no_rawat: pasien.no_rawat,
          kd_ruang_poli: kd_ruang_poli,
          type: status === '0' ? 'ada' : 'tidak'
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Refresh data setelah update
        fetchData();
      } else {
        // Coba dengan endpoint lama
        const oldApiResponse = await fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            no_rawat: pasien.no_rawat,
            kd_ruang_poli: kd_ruang_poli,
            type: status === '0' ? 'ada' : 'tidak'
          }),
        });
        
        if (oldApiResponse.ok) {
          fetchData();
          return;
        }
        
        throw new Error(data.message || 'Gagal mengupdate status pasien');
      }
    } catch (error) {
      console.error('Error updating patient status:', error);
      alert(`Gagal mengupdate status: ${error.message}`);
    }
  };

  // Reset status pasien
  const handleResetStatus = async (pasien) => {
    try {
      const response = await fetch(`/api/antrian/log/reset/${pasien.no_rawat}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Refresh data setelah reset
        fetchData();
      } else {
        // Coba dengan endpoint lama
        const oldApiResponse = await fetch(`/api/log/reset/${pasien.no_rawat}`, {
          method: 'POST',
        });
        
        if (oldApiResponse.ok) {
          fetchData();
          return;
        }
        
        throw new Error(data.message || 'Gagal mereset status pasien');
      }
    } catch (error) {
      console.error('Error resetting patient status:', error);
      alert(`Gagal mereset status: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-red-700 font-medium mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center"
              onClick={() => fetchData()}
            >
              <FontAwesomeIcon icon={faRedo} className="mr-2" />
              Coba Lagi
            </button>
            <Link 
              to="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold">Panggil Pasien</h2>
                <h3 className="text-xl font-medium text-green-100 mt-1">
                  {poliInfo ? poliInfo.nama_ruang_poli : `Poli ${kd_ruang_poli}`}
                </h3>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-xl font-medium">
                  {currentTime.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-2xl font-bold mt-1">
                  {currentTime.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Navigasi */}
        <div className="mb-6 flex flex-wrap gap-3 justify-between">
          <Link to="/" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center shadow-md">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Kembali ke Pengaturan
          </Link>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center shadow-md"
            onClick={fetchData}
          >
            <FontAwesomeIcon icon={faRedo} className="mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Daftar Pasien */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 font-medium">Memuat Data Pasien...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">No.</th>
                    <th className="py-3 px-4 text-left">No. Reg</th>
                    <th className="py-3 px-4 text-left">Nama Pasien</th>
                    <th className="py-3 px-4 text-left">Dokter</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pasienList.length > 0 ? (
                    pasienList.map((pasien, index) => (
                      <tr key={pasien.no_rawat || index} className={`${pasien.status === '0' ? 'bg-green-50' : pasien.status === '1' ? 'bg-red-50' : ''}`}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{pasien.no_reg}</td>
                        <td className="py-3 px-4">{pasien.nm_pasien}</td>
                        <td className="py-3 px-4">{pasien.nama_dokter}</td>
                        <td className="py-3 px-4">
                          {pasien.status === '0' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FontAwesomeIcon icon={faUserCheck} className="mr-1" /> Hadir
                            </span>
                          ) : pasien.status === '1' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FontAwesomeIcon icon={faUserTimes} className="mr-1" /> Tidak Hadir
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <FontAwesomeIcon icon={faUser} className="mr-1" /> Menunggu
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex justify-center space-x-2">
                            <button 
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                              onClick={() => handlePanggilPasien(pasien)}
                              disabled={isCallingPatient}
                            >
                              <FontAwesomeIcon icon={faBell} /> Panggil
                            </button>
                            <button 
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                              onClick={() => handleUpdateStatus(pasien, '0')}
                            >
                              <FontAwesomeIcon icon={faUserCheck} /> Hadir
                            </button>
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                              onClick={() => handleUpdateStatus(pasien, '1')}
                            >
                              <FontAwesomeIcon icon={faUserTimes} /> Tidak
                            </button>
                            {(pasien.status === '0' || pasien.status === '1') && (
                              <button 
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                                onClick={() => handleResetStatus(pasien)}
                              >
                                <FontAwesomeIcon icon={faRedo} /> Reset
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                        Tidak ada data pasien untuk hari ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2025 Rumah Sakit Bumi Waras - Sistem Manajemen Antrian Poli</p>
            <p className="mt-1 text-gray-400">Versi 1.0.0 - Dikembangkan oleh Dhia Fahmi G</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PanggilPasien; 
