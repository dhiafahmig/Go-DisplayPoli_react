import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import rsLogo from '../assets/images/rs.png';
import bpjsLogo from '../assets/images/bpjs.png';

const Header = ({ title = "ANTRIAN POLI", icon }) => {
  const [currentTime, setCurrentTime] = useState('--:--:--');
  
  // Preload gambar
  useEffect(() => {
    const preloadImage = (src) => {
      const img = new Image();
      img.src = src;
    };
    
    preloadImage(rsLogo);
    preloadImage(bpjsLogo);
  }, []);
  
  // Preload font
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.as = 'style';
    document.head.appendChild(link);
    
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, []);
  
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
    <div className="bg-[#16a34a] text-white shadow-lg py-6 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex items-center mr-5">
              <div className="bg-white p-3 rounded-lg shadow-md h-24 flex items-center mr-4">
                <img src={rsLogo} alt="Bumi Waras Logo" className="h-20 w-auto" />
              </div>
              {icon && <FontAwesomeIcon icon={icon} className="text-4xl mr-4 text-green-100" />}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">{title}</h1>
              <p className="text-green-200 text-sm mt-1 font-semibold">Rumah Sakit Bumi Waras</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-green-700/30 px-5 py-2 rounded-full border border-green-400/30 backdrop-blur-sm mr-4 transition-all duration-500 hover:scale-105">
              <h3 className="text-xl font-light">{currentTime}</h3>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-md h-28 w-84 flex items-center justify-center">
              <img src={bpjsLogo} alt="BPJS Logo" className="h-24 w-80 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 