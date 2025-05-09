import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRedo } from '@fortawesome/free-solid-svg-icons';
import PanggilPasienCard from '../components/PanggilPasienCard';

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
  const handlePanggilPasien = async (pasien, silentMode = false) => {
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
        // Feedback visual sukses hanya jika tidak dalam mode silent
        if (!silentMode) {
          alert(`Pasien ${pasien.nm_pasien} berhasil dipanggil!`);
        }
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
            if (!silentMode) {
              alert(`Pasien ${pasien.nm_pasien} berhasil dipanggil!`);
            }
            return;
          }
        }
        
        throw new Error(data.message || 'Gagal memanggil pasien');
      }
    } catch (error) {
      console.error('Error calling patient:', error);
      if (!silentMode) {
        alert(`Gagal memanggil pasien: ${error.message}`);
      }
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

  const formatDateTime = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-[#16a34a] text-white shadow-lg py-6 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/pengaturan" className="mr-4">
                <FontAwesomeIcon icon={faArrowLeft} className="text-2xl hover:text-green-200 transition-colors" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Panggil Pasien</h1>
                <p className="text-green-200">Poli {poliInfo?.nama_ruang_poli || kd_ruang_poli}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-700/30 px-5 py-2 rounded-full border border-green-400/30 backdrop-blur-sm">
                <span className="text-lg">{formatDateTime(currentTime)}</span>
              </div>
              <button
                onClick={fetchData}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faRedo} className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pasien...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <PanggilPasienCard
                        key={pasien.no_rawat}
                        pasien={pasien}
                        index={index}
                        onPanggil={handlePanggilPasien}
                        onUpdateStatus={handleUpdateStatus}
                        onResetStatus={handleResetStatus}
                        isCalling={isCallingPatient}
                      />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PanggilPasien; 
