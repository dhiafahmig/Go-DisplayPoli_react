import React, { useState, useEffect } from 'react';

const MissedPatientsList = ({ poli, layout }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const patients = poli.missedPatients || [];

  useEffect(() => {
    if (patients.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % patients.length);
    }, 5000); // Ganti setiap 5 detik

    return () => clearInterval(timer);
  }, [patients.length]);

  if (!patients || patients.length === 0) return null;

  const getContainerClasses = () => {
    switch (layout) {
      case 'single':
        return 'max-w-7xl mx-auto mt-6';
      case 'double':
        return 'w-full mt-4';
      case 'triple':
        return 'w-full mt-4';
      case 'multi':
        return 'w-full mt-4';
      default:
        return 'w-full mt-4';
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-red-500">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
              <span>Pasien Terlewat - {poli.nama_ruang_poli}</span>
            </div>
            <span className="text-sm font-normal text-red-500">
              {currentIndex + 1} dari {patients.length}
            </span>
          </h3>
        </div>
        <div className="relative">
          <div className="p-4 transition-all duration-500 ease-in-out transform">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">{patients[currentIndex].no_reg}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{patients[currentIndex].nm_pasien}</h4>
                  <p className="text-sm text-gray-600">
                    <i className="fas fa-user-md mr-2"></i>
                    {patients[currentIndex].nama_dokter}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Jam Praktek</div>
                <div className="text-lg font-bold text-red-600">{patients[currentIndex].jam_mulai} WIB</div>
              </div>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-red-100">
          <div 
            className="h-1 bg-red-500 transition-all duration-500 ease-linear"
            style={{ 
              width: `${((currentIndex + 1) / patients.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MissedPatientsList;
