import React, { useState, useEffect } from 'react';

const FullscreenButton = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(true);
  
  useEffect(() => {
    // Periksa apakah fullscreen didukung
    if (!(document.documentElement.requestFullscreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.msRequestFullscreen)) {
      setFullscreenSupported(false);
      console.warn("Fullscreen tidak didukung di browser ini");
    }
    
    // Mendeteksi perubahan mode fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || 
        document.mozFullScreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
      enterFullScreen();
    } else {
      exitFullScreen();
    }
  };
  
  const enterFullScreen = () => {
    try {
      const elem = document.getElementById('kioskContainer') || document.documentElement;
      
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Fullscreen error:", err);
      setFullscreenSupported(false);
    }
  };
  
  const exitFullScreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error("Exit fullscreen error:", err);
    }
  };
  
  if (!fullscreenSupported) {
    return null; // Jangan tampilkan tombol jika fullscreen tidak didukung
  }
  
  return (
    <div 
      id="fullscreenBtn" 
      className="fullscreen-btn" 
      title={isFullscreen ? "Keluar dari Mode Layar Penuh" : "Mode Layar Penuh"} 
      onClick={toggleFullScreen}
    >
      <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
    </div>
  );
};

export default FullscreenButton; 