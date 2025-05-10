import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load komponen halaman
const DisplayPoli = lazy(() => import('./pages/DisplayPoli'));
const PanggilPasien = lazy(() => import('./pages/PanggilPasien'));
const PengaturanPoli = lazy(() => import('./pages/PengaturanPoli'));

// Komponen loading
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Memuat halaman...</p>
    </div>
  </div>
);

// Komponen halaman tidak ditemukan
const NotFound = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Display Poli - Rumah Sakit Bumi Waras</h1>
      <p className="text-gray-600 mb-6">Silakan akses halaman melalui URL yang sesuai</p>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 inline-block mb-2">
        <p className="text-green-800 font-medium">/display/[kode_display]</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 inline-block">
        <p className="text-blue-800 font-medium">/panggil/[kode_ruang_poli]</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<PengaturanPoli />} />
          <Route path="/display/:kdDisplay" element={<DisplayPoli />} />
          <Route path="/panggil/:kd_ruang_poli" element={<PanggilPasien />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 