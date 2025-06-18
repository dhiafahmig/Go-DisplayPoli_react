import React from 'react';

const PoliCard = ({ poli, layout = 'multi', isSmall = false }) => {
  // Tentukan class dan properties berdasarkan layout
  let cardClass = "bg-white rounded-lg custom-shadow overflow-hidden transform hover:scale-[1.02] transition-all duration-300";
  let headerClass = "gradient-header text-white py-3 px-4";
  let contentClass = "p-3 text-center card-gradient";
  let titleSize = "text-xl";
  let nameSize = "text-xl";
  let regSize = "text-4xl";
  let emptyIconSize = "text-4xl";
  let patientMargin = "mb-2";
  let regMargin = "mt-2";
  let doctorMargin = "mt-2";
  let emptyMargin = "py-6";

  // Sesuaikan tampilan berdasarkan jenis layout
  if (layout === 'single') {
    headerClass = "gradient-header text-white py-6 px-8";
    contentClass = "p-8 text-center card-gradient";
    titleSize = "text-3xl";
    nameSize = "text-3xl";
    regSize = "text-7xl";
    emptyIconSize = "text-7xl";
    patientMargin = "mb-6";
    regMargin = "mt-8";
    doctorMargin = "mt-8";
    emptyMargin = "py-20";
  }
  
  if (layout === 'double') {
    headerClass = "gradient-header text-white py-6 px-8";
    contentClass = "p-8 text-center card-gradient";
    titleSize = "text-3xl";
    nameSize = "text-3xl";
    regSize = "text-7xl";
    emptyIconSize = "text-7xl";
    patientMargin = "mb-6";
    regMargin = "mt-8";
    doctorMargin = "mt-8";
    emptyMargin = "py-20";
  }
  
  if (layout === 'triple' && isSmall) {
    cardClass += " poli-small";
    headerClass = "gradient-header text-white py-3 px-4";
    contentClass = "p-3 text-center card-gradient";
    titleSize = "text-xl";
    nameSize = "text-xl";
    regSize = "text-4xl";
    emptyIconSize = "text-4xl";
    patientMargin = "mb-2";
    regMargin = "mt-2";
    doctorMargin = "mt-2";
    emptyMargin = "py-8";
  }
  
  // Data pasien untuk tampilan
  const hasPatient = poli.getPasien && poli.getPasien.length > 0;
  const patient = hasPatient ? poli.getPasien[0] : null;
  // Render for single layout with separate cards
  if (layout === 'single') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-28 max-w-7xl mx-auto">
        {/* Patient Card */}
        <div className={cardClass}>
          <div className={headerClass}>
            <div className="flex items-center justify-center">
              <i className="fas fa-stethoscope text-2xl mr-3 text-green-200"></i>
              <h2 className={`${titleSize} font-semibold`}>{poli.nama_ruang_poli}</h2>
            </div>
          </div>
          
          <div className={contentClass}>
            {hasPatient ? (
              <>
                <div className={patientMargin}>
                  <div className="flex items-center justify-center mb-3">
                    <i className="fas fa-user-alt text-primary-500 mr-2 text-xl"></i>
                    <p className="text-gray-700 text-xl font-bold">Pasien:</p>
                  </div>
                  <div className="bg-white rounded-lg py-4 px-6 shadow-inner border-2 border-green-100">
                    <p className={`text-gray-800 ${nameSize} font-bold`}>
                      {patient.nm_pasien}
                    </p>
                  </div>
                </div>
                
                <div className={regMargin}>
                  <div className="flex items-center justify-center mb-3">
                    <i className="fas fa-ticket-alt text-primary-500 mr-2 text-xl"></i>
                    <p className="text-gray-700 text-xl font-bold">No. Antrian:</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg py-6 px-6 shadow-inner border-2 border-primary-200">
                    <p className={`text-primary-600 ${regSize} font-extrabold blink text-center`}>
                      {patient.no_reg}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className={`${emptyMargin} flex flex-col items-center`}>
                <i className={`far fa-calendar-times ${emptyIconSize} text-gray-300 mb-4 animate-pulse-slow`}></i>
                <p className="text-xl text-gray-500 font-bold">Tidak ada pasien</p>
                <p className="text-lg text-gray-400 mt-2 font-medium">Silakan menunggu antrian berikutnya</p>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Card */}
        <div className={`${cardClass} bg-gradient-to-br from-white to-gray-50`}>          <div className={headerClass}>
            <div className="flex items-center justify-center">
              <i className="fas fa-user-md text-2xl mr-3 text-green-200"></i>
              <h2 className={`${titleSize} font-semibold`}>Informasi Dokter</h2>
            </div>
          </div>
          
          <div className={contentClass}>
            {hasPatient ? (
              <>
                <div className="mb-6">
                  <img 
                    src={patient?.foto_dokter || '/assets/images/logo.jpg'} 
                    alt="Foto Dokter"
                    className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-primary-100 shadow-xl"
                    onError={(e) => e.target.src = '/assets/images/logo.jpg'}
                  />
                </div>
                <div className="text-center">
                  <h3 className={`${nameSize} font-bold text-gray-800 mb-2`}>
                    {patient.nama_dokter}
                  </h3>                  <div className="bg-primary-50 rounded-lg py-4 px-5 shadow-inner border-2 border-primary-200 w-full">
                    <div className="flex items-center justify-center mb-2">
                      <i className="far fa-clock text-primary-500 mr-2 text-xl"></i>
                      <p className="text-gray-700 text-xl font-bold">Jam Praktek</p>
                    </div>
                    <p className="text-primary-600 text-4xl font-extrabold text-center">{patient.jam_mulai} WIB</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <i className="fas fa-user-md text-6xl text-gray-300 mb-4 animate-pulse-slow"></i>
                <p className="text-xl text-gray-500 font-bold">Tidak ada dokter praktek</p>
                <p className="text-lg text-gray-400 mt-2 font-medium">Silakan cek jadwal praktek</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default render for other layouts
  return (
    <div id={`poli-card-${poli.kd_ruang_poli}`} className={cardClass}>
      <div className={headerClass}>
        <div className="flex items-center justify-center">
          <i className="fas fa-stethoscope text-xl mr-3 text-green-200"></i>
          <h2 className={`${titleSize} font-semibold`}>{poli.nama_ruang_poli}</h2>
        </div>
      </div>
      
      <div className={contentClass}>
        {hasPatient ? (
          <>
            <div className={patientMargin}>
              <div className="flex items-center justify-center mb-2">
                <i className="fas fa-user-alt text-primary-500 mr-2"></i>
                <p className="text-gray-700 text-lg font-bold">Pasien:</p>
              </div>
              <div className="bg-white rounded-lg py-3 px-4 shadow-inner border border-green-100">
                <p className={`text-gray-800 ${nameSize} font-bold truncate-content`}>{patient.nm_pasien}</p>
              </div>
            </div>
            
            <div className={`${regMargin} float`}>
              <div className="flex items-center justify-center mb-2">
                <i className="fas fa-ticket-alt text-primary-500 mr-2"></i>
                <p className="text-gray-700 text-lg font-bold">No. Antrian:</p>
              </div>
              <div className="bg-primary-50 rounded-lg py-3 shadow-inner border border-primary-200">
                <p className={`text-primary-600 ${regSize} font-extrabold blink`}>{patient.no_reg}</p>
              </div>
            </div>
            
            <div className={`${doctorMargin} bg-white/80 rounded-lg p-3 border border-green-100 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-user-md text-primary-500 mr-2 text-xl"></i>
                  <div className="text-left">
                    <p className="text-gray-500 text-xs font-semibold">Dokter</p>
                    <p className="text-gray-800 font-bold truncate-content">{patient.nama_dokter}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="far fa-clock text-primary-500 mr-2 text-xl"></i>
                  <div className="text-left">
                    <p className="text-gray-500 text-xs font-semibold">Jam Praktek</p>
                    <p className="text-gray-800 font-bold">{patient.jam_mulai} WIB</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={`${emptyMargin} flex flex-col items-center`}>
            <i className={`far fa-calendar-times ${emptyIconSize} text-gray-300 mb-4 animate-pulse-slow`}></i>
            <p className="text-xl text-gray-500 font-bold">Tidak ada pasien</p>
            <p className="text-sm text-gray-400 mt-2 font-medium">Silakan menunggu antrian berikutnya</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliCard;