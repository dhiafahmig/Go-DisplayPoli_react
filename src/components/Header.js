import React, { useState, useEffect } from 'react';
import rsLogo from '../assets/images/rs.png';
import bpjsLogo from '../assets/images/bpjs.png';

const Header = () => {
  const [currentTime, setCurrentTime] = useState('--:--:--');
  
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };
    
    const interval = setInterval(updateClock, 1000);
    updateClock(); // panggil sekali saat komponen mount
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="gradient-header text-white shadow-lg py-4 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="flex items-center mr-4">
              {/* Logo RS - Diperbesar */}
              <div className="bg-white p-3 rounded-lg shadow-md h-24 flex items-center mr-4">
                <img src={rsLogo} alt="Bumi Waras Logo" className="h-20 w-auto" />
              </div>
              <i className="fas fa-hospital-alt text-4xl mr-3 text-green-100"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase">ANTRIAN POLI</h1>
              <p className="text-green-200 text-sm mt-1 font-semibold">Rumah Sakit Bumi Waras</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-right md:ml-8 text-lg font-medium clock-animation mr-4">
              <i className="far fa-clock text-green-100 mr-2"></i>
              <span id="jam">{currentTime}</span>
            </div>
            {/* Logo BPJS */}
            <div className="bg-white p-2 rounded-lg shadow-md h-20 flex items-center">
              <img src={bpjsLogo} alt="BPJS Logo" className="h-16 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 