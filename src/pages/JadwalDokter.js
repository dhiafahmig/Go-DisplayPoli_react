import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt,
    faUserMd,
    faSync,
    faClock,
    faPlus,
    faEdit,
    faTrash,
    faCheck,
    faTimes,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { jadwalDokterApi } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const JadwalDokter = () => {
    const [dokterList, setDokterList] = useState([]);
    const [poliList, setPoliList] = useState([]);
    const [selectedHari, setSelectedHari] = useState(new Date().toLocaleString('id-ID', { weekday: 'long' }).toUpperCase());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [formData, setFormData] = useState({
        kd_dokter: '',
        nm_dokter: '',
        hari_kerja: '',
        jam_mulai: '',
        jam_selesai: '',
        kd_poli: '',
        nm_poli: ''
    });
    const [formError, setFormError] = useState({});

    const hariList = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];    const fetchData = async () => {
        try {
            setIsLoading(true);
            const { data } = await jadwalDokterApi.getAll();
            
            if (!data || !data.DokterList) {
                throw new Error('Invalid response format from server');
            }

            // Filter schedules based on selected day
            const filteredSchedules = data.DokterList.filter(jadwal => 
                jadwal.hari_kerja.toUpperCase() === selectedHari
            );
            
            setDokterList(filteredSchedules);
            // Get unique poli list from the filtered schedules
            const uniquePoliList = Array.from(new Set(data.DokterList.map(item => JSON.stringify({
                kd_poli: item.kd_poli,
                nm_poli: item.nm_poli
            })))).map(str => JSON.parse(str)).filter(poli => poli.kd_poli && poli.nm_poli);
            
            setPoliList(uniquePoliList);
            setError(null);} catch (err) {
            const errorMessage = err.message || 'Terjadi kesalahan saat memuat data';
            setError(`Gagal memuat data: ${errorMessage}`);
            console.error('Error fetching data:', err);
            // Set empty arrays when there's an error to prevent undefined errors
            setDokterList([]);
            setPoliList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedHari]);

    const validateForm = () => {
        const errors = {};
        if (!formData.kd_dokter) errors.kd_dokter = 'Kode dokter harus diisi';
        if (!formData.nm_dokter) errors.nm_dokter = 'Nama dokter harus diisi';
        if (!formData.hari_kerja) errors.hari_kerja = 'Hari kerja harus dipilih';
        if (!formData.jam_mulai) errors.jam_mulai = 'Jam mulai harus diisi';
        if (!formData.jam_selesai) errors.jam_selesai = 'Jam selesai harus diisi';
        if (!formData.kd_poli) errors.kd_poli = 'Poli harus dipilih';
        setFormError(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const url = modalMode === 'add' ? '/api/jadwal/dokter' : `/api/jadwal/dokter/${selectedJadwal.id}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save schedule');
            }

            const data = await response.json();
            if (data.status === 'success') {
                alert(modalMode === 'add' ? 'Jadwal berhasil ditambahkan' : 'Jadwal berhasil diubah');
                setShowModal(false);
                fetchData();
            } else {
                throw new Error(data.message || 'Failed to save schedule');
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleTambahJadwal = async () => {
        try {
            await jadwalDokterApi.add(formData);
            alert('Jadwal berhasil ditambahkan');
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menambahkan jadwal: ' + err.message);
        }
    };

    const handleEditJadwal = async () => {
        try {
            await jadwalDokterApi.edit(formData, selectedJadwal);
            alert('Jadwal berhasil diubah');
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal mengubah jadwal: ' + err.message);
        }
    };

    const handleDelete = async (jadwal) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
            return;
        }

        try {
            await jadwalDokterApi.delete(jadwal);
            alert('Jadwal berhasil dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus jadwal: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            kd_dokter: '',
            nm_dokter: '',
            hari_kerja: selectedHari,
            jam_mulai: '',
            jam_selesai: '',
            kd_poli: '',
            nm_poli: ''
        });
        setFormError({});
    };    return (        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col min-h-screen transition-all duration-300 ml-0 md:ml-[90px]">
                {/* Header takes full width */}
                <Header title="PENGATURAN JADWAL DOKTER" icon={faCalendarAlt} />
                {/* Content with padding */}
                <div className="flex-1 container mx-auto px-6 py-8">
                {/* Filter Hari */}
                <div className="bg-white rounded-xl shadow-md mb-6 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Filter Hari</h3>
                        <button
                            onClick={() => {
                                setModalMode('add');
                                setSelectedJadwal(null);
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Tambah Jadwal
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hariList.map((hari) => (
                            <button
                                key={hari}
                                onClick={() => setSelectedHari(hari)}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                    selectedHari === hari
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {hari}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabel Jadwal */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 bg-green-500 text-white flex justify-between items-center">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-2" />
                            <h2 className="text-lg font-semibold">Jadwal Dokter: {selectedHari}</h2>
                        </div>
                        {!isLoading && (
                            <button
                                onClick={fetchData}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center text-sm transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faSync} className="mr-1" />
                                Refresh
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat data jadwal...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
                                <p className="text-red-600 font-medium mb-4">{error}</p>
                                <button
                                    onClick={fetchData}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dokter
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Poli
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jam Praktek
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dokterList.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                Tidak ada jadwal dokter untuk hari ini
                                            </td>
                                        </tr>
                                    ) : (
                                        dokterList.map((jadwal) => (
                                            <tr key={jadwal.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FontAwesomeIcon icon={faUserMd} className="text-green-500 mr-3" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {jadwal.nm_dokter}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {jadwal.kd_dokter}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {jadwal.nm_poli}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {jadwal.jam_mulai} - {jadwal.jam_selesai} WIB
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                    <button
                                                        onClick={() => {
                                                            setModalMode('edit');
                                                            setSelectedJadwal(jadwal);
                                                            setFormData({
                                                                ...jadwal,
                                                                hari_kerja: jadwal.hari
                                                            });
                                                            setShowModal(true);
                                                        }}
                                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-sm mr-2 transition-colors duration-200"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(jadwal)}
                                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-sm transition-colors duration-200"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            {modalMode === 'add' ? 'Tambah Jadwal Dokter' : 'Edit Jadwal Dokter'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Kode Dokter
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.kd_dokter}
                                                    onChange={(e) => setFormData({ ...formData, kd_dokter: e.target.value })}
                                                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                                        formError.kd_dokter ? 'border-red-500' : ''
                                                    }`}
                                                    required
                                                />
                                                {formError.kd_dokter && (
                                                    <p className="mt-1 text-sm text-red-600">{formError.kd_dokter}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nama Dokter
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.nm_dokter}
                                                    onChange={(e) => setFormData({ ...formData, nm_dokter: e.target.value })}
                                                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                                        formError.nm_dokter ? 'border-red-500' : ''
                                                    }`}
                                                    required
                                                />
                                                {formError.nm_dokter && (
                                                    <p className="mt-1 text-sm text-red-600">{formError.nm_dokter}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Hari
                                                </label>
                                                <select
                                                    value={formData.hari_kerja}
                                                    onChange={(e) => setFormData({ ...formData, hari_kerja: e.target.value })}
                                                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                                        formError.hari_kerja ? 'border-red-500' : ''
                                                    }`}
                                                    required
                                                >
                                                    <option value="">Pilih Hari</option>
                                                    {hariList.map((hari) => (
                                                        <option key={hari} value={hari}>
                                                            {hari}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formError.hari_kerja && (
                                                    <p className="mt-1 text-sm text-red-600">{formError.hari_kerja}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Jam Mulai
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.jam_mulai}
                                                        onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                                                        className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                                            formError.jam_mulai ? 'border-red-500' : ''
                                                        }`}
                                                        required
                                                    />
                                                    {formError.jam_mulai && (
                                                        <p className="mt-1 text-sm text-red-600">{formError.jam_mulai}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Jam Selesai
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.jam_selesai}
                                                        onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                                                        className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                                            formError.jam_selesai ? 'border-red-500' : ''
                                                        }`}
                                                        required
                                                    />
                                                    {formError.jam_selesai && (
                                                        <p className="mt-1 text-sm text-red-600">{formError.jam_selesai}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Poli
                                                </label>
                                                <select
                                                    value={formData.kd_poli}
                                                    onChange={(e) => {
                                                        const selectedPoli = poliList.find(p => p.kd_poli === e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            kd_poli: e.target.value,
                                                            nm_poli: selectedPoli ? selectedPoli.nm_poli : ''
                                                        });
                                                    }}
                                                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                                        formError.kd_poli ? 'border-red-500' : ''
                                                    }`}
                                                    required
                                                >
                                                    <option value="">Pilih Poli</option>
                                                    {poliList.map((poli) => (
                                                        <option key={poli.kd_poli} value={poli.kd_poli}>
                                                            {poli.nm_poli}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formError.kd_poli && (
                                                    <p className="mt-1 text-sm text-red-600">{formError.kd_poli}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        {modalMode === 'add' ? 'Simpan' : 'Update'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}            <Footer copyright="Jadwal Dokter Rumah Sakit Bumi Waras" />
            </div>
        </div>
    );
};

export default JadwalDokter;
