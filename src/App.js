import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisplayPoli from './pages/DisplayPoli';
import PanggilPasien from './pages/PanggilPasien';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/display/:kdDisplay" element={<DisplayPoli />} />
        <Route path="/panggil/:kdPoli" element={<PanggilPasien />} />
        <Route path="*" element={<div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Display Poli - Rumah Sakit Bumi Waras</h1>
            <p className="text-gray-600 mb-6">Silakan akses halaman melalui URL yang sesuai</p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 inline-block mb-2">
              <p className="text-green-800 font-medium">/display/[kode_display]</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 inline-block">
              <p className="text-blue-800 font-medium">/panggil/[kode_poli]</p>
            </div>
          </div>
        </div>} />
      </Routes>
    </Router>
  );
}

export default App; 