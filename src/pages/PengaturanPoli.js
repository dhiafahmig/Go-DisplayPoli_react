import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCog, 
    faListAlt, 
    faDesktop, 
    faBullhorn, 
    faPlayCircle 
} from '@fortawesome/free-solid-svg-icons';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';

// Import gambar
import rsLogo from '../assets/images/rs.png';
import bpjsLogo from '../assets/images/bpjs.png';

const PengaturanPoli = () => {
    const [polis, setPolis] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update jam setiap detik
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Load data poli
        loadPolis();

        return () => clearInterval(timer);
    }, []);

    const loadPolis = async () => {
        try {
            const response = await fetch('/api/poli');
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
        } catch (error) {
            console.error('Error loading polis:', error);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
            {/* Header */}
            <div className="bg-[#16a34a] text-white shadow-lg py-6 sticky top-0 z-50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="flex items-center mr-5">
                                <div className="bg-white p-3 rounded-lg shadow-md h-24 flex items-center mr-4">
                                    <img src={rsLogo} alt="Bumi Waras Logo" className="h-20 w-auto" />
                                </div>
                                <FontAwesomeIcon icon={faCog} className="text-4xl mr-4 text-green-100" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight uppercase">PENGATURAN POLI</h1>
                                <p className="text-green-200 text-sm mt-1 font-semibold">Rumah Sakit Bumi Waras</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-green-700/30 px-5 py-2 rounded-full border border-green-400/30 backdrop-blur-sm mr-4 transition-all duration-500 hover:scale-105">
                                <h3 className="text-xl font-light">{formatDateTime(currentTime)}</h3>
                            </div>
                            <div className="bg-white p-2 rounded-lg shadow-md h-20 flex items-center">
                                <img src={bpjsLogo} alt="BPJS Logo" className="h-16 w-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-10">
                <div className="bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(34,197,94,0.2),0_8px_10px_-6px_rgba(34,197,94,0.2)] overflow-hidden mb-12">
                    <div className="bg-[#16a34a] text-white py-4 px-6">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faListAlt} className="text-xl mr-3 text-green-200" />
                            <h2 className="text-xl font-semibold">Daftar Poli</h2>
                        </div>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ruang Poli</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Display</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akses Cepat</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {polis.map((poli) => (
                                    <tr key={poli.kd_ruang_poli} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Poli {poli.kd_ruang_poli}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{poli.kd_display}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <a href={`/display/${poli.kd_display}`} target="_blank" rel="noopener noreferrer" 
                                               className="inline-flex items-center px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-xs transition-all duration-300 border border-green-200">
                                                <FontAwesomeIcon icon={faDesktop} className="mr-1" /> Display
                                            </a>
                                            <a href={`http://localhost:8080/panggilpoli/${poli.kd_ruang_poli}/DISPLAY1`} target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs transition-all duration-300 border border-blue-200">
                                                <FontAwesomeIcon icon={faBullhorn} className="mr-1" /> Panggil
                                            </a>
                                            <a href={`/autorun/${poli.kd_display}`} target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-xs transition-all duration-300 border border-purple-200">
                                                <FontAwesomeIcon icon={faPlayCircle} className="mr-1" /> Auto
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white py-6 text-center text-gray-600 shadow-md border-t border-gray-100">
                <div className="container mx-auto">
                    <div className="flex items-center justify-center">
                        <FontAwesomeIcon icon={faCopyright} className="mr-2" />
                        <p>2025 Pengaturan Poli Rumah Sakit Bumi Waras</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Dhia Fahmi G</p>
                </div>
            </footer>
        </div>
    );
};

export default PengaturanPoli; 