import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faListAlt, 
    faDesktop, 
    faBullhorn,
    faSync,
    faUserMd,
    faCog
} from '@fortawesome/free-solid-svg-icons';

// Import komponen
import Header from '../components/Header';
import Footer from '../components/Footer';

// Font Preloading
const fontPreload = () => {
    if (typeof window !== 'undefined' && 'fonts' in document) {
        const fonts = [
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2'
        ];
        
        fonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.href = fontUrl;
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
};

const PengaturanPoli = () => {
    const [polis, setPolis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingDokter, setLoadingDokter] = useState(false);
    const [error, setError] = useState(null);
    const [dokters, setDokters] = useState({});

    useEffect(() => {
        // Preload font untuk mengurangi CLS
        fontPreload();
        
        // Load data poli
        loadPolis();
    }, []);

    // Effect untuk load dokter setelah polis berhasil diambil
    useEffect(() => {
        if (polis.length > 0) {
            loadDokters();
        }
    }, [polis]);

    const loadPolis = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/poli');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Urutkan data poli
            const sortedData = data.sort((a, b) => {
                const matchA = a.kd_ruang_poli.match(/([A-Za-z]*)(\d+)/);
                const matchB = b.kd_ruang_poli.match(/([A-Za-z]*)(\d+)/);
                
                if (matchA && matchB) {
                    const prefixA = matchA[1];
                    const prefixB = matchB[1];
                    const numA = parseInt(matchA[2]);
                    const numB = parseInt(matchB[2]);
                    
                    if (numA === numB) {
                        return prefixA.localeCompare(prefixB);
                    }
                    return numA - numB;
                }
                
                return a.kd_ruang_poli.localeCompare(b.kd_ruang_poli);
            });
            
            setPolis(sortedData);
            setIsLoading(false);
            setError(null);
        } catch (error) {
            console.error('Error loading polis:', error);
            setError('Gagal memuat data poli. Silakan coba lagi nanti.');
            setIsLoading(false);
        }
    };

    const loadDokters = async () => {
        try {
            // Set loading state
            setLoadingDokter(true);
            
            // Inisialisasi objek untuk menyimpan dokter per poli
            const dokterByPoli = {};
            
            // Ambil data dokter untuk setiap poli
            for (const poli of polis) {
                try {
                    console.log(`Mengambil data dokter untuk poli: ${poli.kd_ruang_poli}`);
                    const response = await fetch(`/api/poli/dokter/${poli.kd_ruang_poli}`);
                    
                    if (!response.ok) {
                        console.error(`Error mengambil data dokter poli ${poli.kd_ruang_poli}: ${response.status}`);
                        continue; // Lanjutkan ke poli berikutnya jika ada error
                    }
                    
                    const data = await response.json();
                    console.log(`Data dokter poli ${poli.kd_ruang_poli}:`, data);
                    
                    if (data.status === 'success' && data.data && data.data.dokters) {
                        // Hapus duplikasi dokter dengan menggunakan Set dan kd_dokter sebagai kunci
                        const uniqueDokters = {};
                        data.data.dokters.forEach(dokter => {
                            if (dokter.kd_dokter) {
                                // Jika dokter belum ada di objek uniqueDokters, atau jika dokter ini memiliki nm_poli yang tidak null
                                // (preferensi untuk menyimpan dokter dengan informasi spesialis)
                                if (!uniqueDokters[dokter.kd_dokter] || dokter.nm_poli) {
                                    uniqueDokters[dokter.kd_dokter] = dokter;
                                }
                            }
                        });
                        
                        // Konversi kembali ke array
                        dokterByPoli[poli.kd_ruang_poli] = Object.values(uniqueDokters).map(dokter => ({
                            kd_dokter: dokter.kd_dokter || '-',
                            nm_dokter: dokter.nama_dokter,
                            spesialis: poli.nm_poli || 'Dokter Umum',
                            jk: dokter.jk,
                            nm_poli: dokter.nm_poli
                        }));
                    }
                } catch (err) {
                    console.error(`Error saat mengambil data dokter untuk poli ${poli.kd_ruang_poli}:`, err);
                }
            }
            
            console.log('Data dokter yang berhasil diambil:', dokterByPoli);
            setDokters(dokterByPoli);
        } catch (error) {
            console.error('Error umum saat loading dokters:', error);
        } finally {
            setLoadingDokter(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
            {/* Header */}
            <Header title="PENGATURAN POLI" icon={faCog} />

            {/* Main Content */}
            <div className="container mx-auto px-6 py-10">
                <div className="bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(34,197,94,0.2),0_8px_10px_-6px_rgba(34,197,94,0.2)] overflow-hidden mb-12">
                    <div className="bg-[#16a34a] text-white py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faListAlt} className="text-xl mr-3 text-green-200" />
                                <h2 className="text-xl font-semibold">Daftar Poli</h2>
                            </div>
                            {!isLoading && (
                                <button 
                                    onClick={() => {
                                        loadPolis();
                                        loadDokters();
                                    }} 
                                    className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-1 rounded transition-colors duration-300 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faSync} className="mr-1" />
                                    Refresh
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat data poli...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 bg-red-50 rounded-lg">
                                <FontAwesomeIcon icon={faSync} className="text-red-500 text-4xl mb-4" />
                                <p className="text-red-600 font-medium mb-4">{error}</p>
                                <button 
                                    onClick={() => {
                                        loadPolis();
                                        loadDokters();
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto max-h-[calc(100vh-300px)]">
                                {/* Struktur placeholder untuk mengurangi CLS - sama seperti tabel aktual */}
                                {loadingDokter && polis.length > 0 && (
                                    <div aria-hidden="true" className="min-h-[400px]">
                                        {/* Placeholder content yang menyerupai tabel sebenarnya */}
                                    </div>
                                )}
                                
                                <table className="min-w-full divide-y divide-gray-200 rounded-lg border-collapse border border-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50">Nama Ruang Poli</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50">Dokter</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50">Kode Display</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">Akses Cepat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {polis.map((poli) => (
                                            <tr key={poli.kd_ruang_poli} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <p className="text-sm font-medium text-gray-800">Poli {poli.kd_ruang_poli}</p>
                                                    <p className="text-xs text-gray-500">{poli.nm_poli || '-'}</p>
                                                </td>
                                                <td className="px-6 py-4 border-r border-gray-200 min-h-[80px]">
                                                    {loadingDokter ? (
                                                        <div className="text-center py-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mx-auto mb-2"></div>
                                                            <p className="text-xs text-gray-500">Memuat data dokter...</p>
                                                        </div>
                                                    ) : dokters[poli.kd_ruang_poli] && dokters[poli.kd_ruang_poli].length > 0 ? (
                                                        <div className="space-y-2 max-w-xs">
                                                            {dokters[poli.kd_ruang_poli].map((dokter, index) => (
                                                                <div key={index} className="flex items-start">
                                                                    <FontAwesomeIcon icon={faUserMd} className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                                                                    <div className="flex-grow min-w-0">
                                                                        <p className="text-sm font-medium text-gray-800 truncate">{dokter.nm_dokter}</p>
                                                                        <div className="flex items-center flex-wrap gap-1">
                                                                            {dokter.nm_poli ? (
                                                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                                                                                    {dokter.nm_poli}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-xs text-gray-500">
                                                                                    {dokter.spesialis || 'Dokter Umum'}
                                                                                </span>
                                                                            )}
                                                                            {dokter.jk && (
                                                                                <span className="bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                                                                                    {dokter.jk === 'L' ? 'Laki-laki' : dokter.jk === 'P' ? 'Perempuan' : dokter.jk}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">Belum ada dokter terdaftar</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                                    <span className="bg-green-50 text-green-700 py-1 px-2 rounded-md text-xs font-medium border border-green-200">
                                                        {poli.kd_display || 'DISPLAY1'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <a href={`/display/${poli.kd_display || 'DISPLAY1'}`} target="_blank" rel="noopener noreferrer" 
                                                       className="inline-flex items-center px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-xs transition-all duration-300 border border-green-200">
                                                        <FontAwesomeIcon icon={faDesktop} className="mr-1" /> Display
                                                    </a>
                                                    <a href={`/panggil/${poli.kd_ruang_poli}`} target="_blank" rel="noopener noreferrer"
                                                       className="inline-flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs transition-all duration-300 border border-blue-200">
                                                        <FontAwesomeIcon icon={faBullhorn} className="mr-1" /> Panggil
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer copyright="Pengaturan Poli Rumah Sakit Bumi Waras" author="Dhia Fahmi G" />
        </div>
    );
};

export default PengaturanPoli; 