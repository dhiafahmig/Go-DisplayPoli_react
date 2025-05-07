import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Konfigurasi base URL untuk axios
axios.defaults.baseURL = 'http://localhost:8080';

const PanggilPasien = () => {
  const { kd_ruang_poli } = useParams();
  const [antrian, setAntrian] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [htmlContent, setHtmlContent] = useState('');
  const containerRef = useRef(null);

  // Update jam setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mengambil data HTML
  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        setIsLoading(true);
        // Menggunakan endpoint yang sesuai dengan handler Go
        const url = `http://localhost:8080/panggilpoli/${kd_ruang_poli}/DISPLAY1`;
        console.log('Mencoba mengambil data dari:', url);
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'text/html',
          },
          responseType: 'text'
        });
        
        setHtmlContent(response.data);
        
        // Mencoba parse data pasien dari HTML
        try {
          const pasienList = extractPasienFromHtml(response.data);
          setAntrian(pasienList);
        } catch (parseError) {
          console.error('Error saat parsing HTML:', parseError);
          setError('Gagal mengekstrak data pasien dari respon server');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error detail:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        setError(`Gagal memuat data: ${error.response?.data?.message || error.message}`);
        setIsLoading(false);
      }
    };

    fetchHtmlContent();
    const intervalId = setInterval(fetchHtmlContent, 30000);
    return () => clearInterval(intervalId);
  }, [kd_ruang_poli]);

  // Fungsi untuk mengekstrak data pasien dari HTML
  const extractPasienFromHtml = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const pasienCards = doc.querySelectorAll('.card.pasien-ada, .card.pasien-tidak');
    const pasienList = [];
    
    pasienCards.forEach(card => {
      const namaPasien = card.querySelector('.card-title')?.textContent.trim();
      const infoElements = card.querySelectorAll('.card-text strong');
      
      let noReg = '';
      let noRawat = '';
      let dokter = '';
      let nmPoli = '';
      let penjamin = '';
      
      infoElements.forEach(element => {
        const label = element.textContent.trim();
        const value = element.nextSibling?.textContent.trim().replace(':', '').trim();
        
        if (label.includes('No. Registrasi')) noReg = value;
        if (label.includes('No. Rawat')) noRawat = value;
        if (label.includes('Dokter')) dokter = value;
        if (label.includes('Poli')) nmPoli = value;
        if (label.includes('Penjamin')) penjamin = value;
      });
      
      // Coba dapatkan data dari button onclick handler untuk kd_dokter
      const adaButton = card.querySelector('.btn-ada');
      let kdDokter = '';
      let status = card.classList.contains('pasien-ada') ? '0' : 
                   card.classList.contains('pasien-tidak') ? '1' : '';
      
      if (adaButton) {
        const onclickAttr = adaButton.getAttribute('onclick');
        const matches = onclickAttr.match(/handleLog\('([^']+)', '([^']+)', '([^']+)', '[^']+'\)/);
        if (matches && matches.length >= 4) {
          kdDokter = matches[1];
        }
      }
      
      pasienList.push({
        nm_pasien: namaPasien,
        no_reg: noReg,
        no_rawat: noRawat,
        nama_dokter: dokter,
        kd_dokter: kdDokter,
        nm_poli: nmPoli,
        png_jawab: penjamin,
        status: status
      });
    });
    
    return pasienList;
  };

  // Fungsi untuk memanggil pasien
  const panggilPasien = async (nmPasien, kdRuangPoli, nmPoli, noReg) => {
    try {
      console.log('Memanggil pasien dengan data:', {
        nm_pasien: nmPasien,
        kd_ruang_poli: kdRuangPoli,
        nm_poli: nmPoli,
        no_reg: noReg,
        kd_display: 'DISPLAY1'
      });

      // Redirect langsung ke UI server untuk memanggil fungsi panggilPasien
      window.open(`http://localhost:8080/panggilpoli/${kdRuangPoli}/DISPLAY1?action=panggil&nm_pasien=${encodeURIComponent(nmPasien)}&no_reg=${encodeURIComponent(noReg)}`, '_blank');
      
      alert('Pasien dipanggil: ' + nmPasien);
    } catch (error) {
      console.error('Error saat memanggil pasien:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Terjadi kesalahan saat memanggil pasien');
    }
  };

  // Fungsi untuk menangani log pasien (ada/tidak)
  const handleLog = async (kdDokter, noRawat, kdRuangPoli, type) => {
    try {
      console.log('Mengupdate log pasien:', {
        kd_dokter: kdDokter,
        no_rawat: noRawat,
        kd_ruang_poli: kdRuangPoli,
        type: type
      });

      // Redirect langsung ke UI server untuk memanggil fungsi handleLog
      window.open(`http://localhost:8080/panggilpoli/${kdRuangPoli}/DISPLAY1?action=log&kd_dokter=${encodeURIComponent(kdDokter)}&no_rawat=${encodeURIComponent(noRawat)}&type=${encodeURIComponent(type)}`, '_blank');
      
      alert('Status pasien diupdate: ' + (type === 'ada' ? 'Hadir' : 'Tidak Hadir'));
      window.location.reload();
    } catch (error) {
      console.error('Error saat update log:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Terjadi kesalahan saat mengupdate status pasien');
    }
  };

  // Fungsi untuk reset log pasien
  const resetLog = async (noRawat) => {
    try {
      console.log('Reset log untuk no_rawat:', noRawat);
      
      // Redirect langsung ke UI server untuk memanggil fungsi resetLog
      window.open(`http://localhost:8080/panggilpoli/${kd_ruang_poli}/DISPLAY1?action=reset&no_rawat=${encodeURIComponent(noRawat)}`, '_blank');
      
      alert('Status pasien di-reset');
      window.location.reload();
    } catch (error) {
      console.error('Error saat reset log:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Terjadi kesalahan saat mereset status pasien');
    }
  };

  // Jika ingin menampilkan HTML asli dari server
  const showServerPage = () => {
    window.open(`http://localhost:8080/panggilpoli/${kd_ruang_poli}/DISPLAY1`, '_blank');
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
          <button 
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={showServerPage}
          >
            Buka Halaman Server
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-blue-600 text-white text-center p-4 rounded-lg mb-6">
          <h2 className="text-2xl font-bold">Panggil Pasien Poli</h2>
          <h4 className="text-lg mt-2">
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </h4>
        </div>

        {/* Tombol Kembali */}
        <div className="mb-6 flex justify-between">
          <Link to="/settings/poli" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            <i className="fas fa-arrow-left mr-2"></i>
            Kembali ke Pengaturan
          </Link>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={showServerPage}
          >
            <i className="fas fa-external-link-alt mr-2"></i>
            Buka Halaman Server
          </button>
        </div>

        {/* Daftar Antrian */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat Data...</p>
            </div>
          ) : antrian.length > 0 ? (
            antrian.map((pasien, index) => (
              <div 
                key={pasien.no_rawat || index} 
                className={`bg-white rounded-lg shadow-md p-6 ${
                  pasien.status === '0' ? 'bg-green-50' : pasien.status === '1' ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h5 className="text-xl font-semibold mb-2">{pasien.nm_pasien}</h5>
                    <div className="text-gray-600">
                      <p><strong>No. Registrasi:</strong> {pasien.no_reg}</p>
                      <p><strong>No. Rawat:</strong> {pasien.no_rawat}</p>
                      <p><strong>Dokter:</strong> {pasien.nama_dokter}</p>
                      <p><strong>Poli:</strong> {pasien.nm_poli}</p>
                      <p><strong>Penjamin:</strong> {pasien.png_jawab}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      onClick={() => panggilPasien(
                        pasien.nm_pasien,
                        kd_ruang_poli,
                        pasien.nm_poli,
                        pasien.no_reg
                      )}
                    >
                      <i className="fas fa-volume-up mr-2"></i>
                      Panggil
                    </button>
                    <div className="space-x-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => handleLog(pasien.kd_dokter, pasien.no_rawat, kd_ruang_poli, 'ada')}
                      >
                        <i className="fas fa-check mr-1"></i>
                        Ada
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleLog(pasien.kd_dokter, pasien.no_rawat, kd_ruang_poli, 'tidak')}
                      >
                        <i className="fas fa-times mr-1"></i>
                        Tidak
                      </button>
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        onClick={() => resetLog(pasien.no_rawat)}
                      >
                        <i className="fas fa-redo mr-1"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Tidak ada pasien dalam antrian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanggilPasien; 