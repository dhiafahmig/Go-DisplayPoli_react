// Base API config
const handleResponse = async (response) => {
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return { data, status: 'success' };
};

// Jadwal Dokter APIs
export const jadwalDokterApi = {
    // Get all doctor schedules
    getAll: async () => {
        const response = await fetch('/api/jadwal/dokter/all');
        const dokterList = await response.json();
        return {
            data: {
                DokterList: dokterList,  // The entire array is the doctor list
                PoliList: Array.from(new Set(dokterList.map(item => ({
                    kd_poli: item.kd_poli,
                    nm_poli: item.nm_poli
                })))).filter(poli => poli.kd_poli && poli.nm_poli)  // Extract unique poli list
            },
            status: 'success'
        };    },

    // Add new schedule
    add: async (jadwalData) => {
        const response = await fetch('/api/jadwal/dokter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...jadwalData,
                jam_mulai: jadwalData.jam_mulai + ':00',
                jam_selesai: jadwalData.jam_selesai + ':00'
            }),
        });
        return handleResponse(response);
    },

    // Edit schedule
    edit: async (jadwalData, originalSchedule) => {
        const response = await fetch('/api/jadwal/dokter/ubah', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kd_dokter: jadwalData.kd_dokter,
                hari_kerja: jadwalData.hari_kerja,
                jam_mulai: originalSchedule.jam_mulai,
                jam_selesai: originalSchedule.jam_selesai,
                jam_mulai_baru: jadwalData.jam_mulai + ':00',
                jam_selesai_baru: jadwalData.jam_selesai + ':00',
                kd_poli: jadwalData.kd_poli            }),
        });
        return handleResponse(response);
    },

    // Delete schedule
    delete: async (jadwal) => {
        const response = await fetch('/api/jadwal/dokter/hapus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kd_dokter: jadwal.kd_dokter,
                hari_kerja: jadwal.hari_kerja,
                jam_mulai: jadwal.jam_mulai,
                jam_selesai: jadwal.jam_selesai
            }),
        }).then(handleResponse);
    }
};

// Poli APIs
export const poliApi = {
    // Get all poli
    getAll: () => {
        return fetch('/api/poli/list')
            .then(handleResponse);
    }
};

// Antrian APIs
export const antrianApi = {
    // Get queue for specific poli
    getByPoli: (kdRuangPoli) => {
        return fetch(`/api/antrian/poli/${kdRuangPoli}`)
            .then(handleResponse);
    },

    // Call next patient
    panggilPasien: (data) => {
        return fetch('/api/antrian/panggil', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(handleResponse);
    },

    // Update patient status
    updateStatus: (data) => {
        return fetch('/api/antrian/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(handleResponse);
    },

    // Reset patient status
    resetStatus: (noRawat) => {
        return fetch(`/api/antrian/log/reset/${noRawat}`, {
            method: 'POST',
        }).then(handleResponse);
    }
};

// Display APIs
export const displayApi = {
    // Get display data
    getByKode: (kdDisplay) => {
        return fetch(`/api/display/poli/${kdDisplay}`)
            .then(handleResponse);
    }
};
