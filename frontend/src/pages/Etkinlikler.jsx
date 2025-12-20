import { useState, useEffect } from 'react';
import { etkinlikService, kategoriService, mekanService, kayitService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Etkinlikler = () => {
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [kategoriler, setKategoriler] = useState([]);
    const [mekanlar, setMekanlar] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEtkinlik, setSelectedEtkinlik] = useState(null);
    const { isAdmin, user } = useAuth();

    const [formData, setFormData] = useState({
        etkinlik_adi: '',
        aciklama: '',
        baslangic_tarihi: '',
        bitis_tarihi: '',
        kontenjan: '',
        kategori_id: '',
        mekan_id: '',
        durum: 'Planlanıyor'
    });

    useEffect(() => {
        fetchEtkinlikler();
        fetchKategoriler();
        fetchMekanlar();
        if (user) {
            fetchRegistrations();
        }
    }, [user]);

    const fetchRegistrations = async () => {
        try {
            const response = await kayitService.getAll();
            if (response.data.success) {
                // Sadece kendime ait kayıtları filtrele
                const myRegs = response.data.data.filter(r => r.email === user.email);
                setMyRegistrations(myRegs);
            }
        } catch (err) {
            console.error('Kayıtlar alınamadı:', err);
        }
    };



    const fetchEtkinlikler = async () => {
        try {
            const response = await etkinlikService.getAll();
            if (response.data.success) {
                setEtkinlikler(response.data.data);
            }
        } catch (err) {
            setError('Etkinlikler yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const fetchKategoriler = async () => {
        try {
            const response = await kategoriService.getAll();
            if (response.data.success) {
                setKategoriler(response.data.data);
            }
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err);
        }
    };

    const fetchMekanlar = async () => {
        try {
            const response = await mekanService.getAll();
            if (response.data.success) {
                setMekanlar(response.data.data);
            }
        } catch (err) {
            console.error('Mekanlar yüklenemedi:', err);
        }
    };

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        variant: 'primary',
        confirmText: 'Evet'
    });

    const openConfirmModal = (title, message, onConfirm, variant = 'primary', confirmText = 'Evet') => {
        setConfirmModal({
            show: true,
            title,
            message,
            onConfirm,
            variant,
            confirmText
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
    };

    const handleConfirm = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        closeConfirmModal();
    };

    const handleDelete = (id) => {
        openConfirmModal(
            'Etkinlik Sil',
            'Bu etkinliği silmek istediğinizden emin misiniz?',
            async () => {
                try {
                    await etkinlikService.delete(id);
                    setMessage('Etkinlik başarıyla silindi!');
                    fetchEtkinlikler();
                } catch (err) {
                    setError('Etkinlik silinirken hata oluştu!');
                }
            },
            'danger',
            'Sil'
        );
    };

    const handleChange = (e) => {
        // ... (existing handleChange)
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Note: handleSubmit logic remains similar but alert uses might need change. 
    // For now dealing with confirms as requested.

    const handleJoin = (etkinlikId) => {
        openConfirmModal(
            'Etkinliğe Katıl',
            'Bu etkinliğe katılmak istiyor musunuz?',
            async () => {
                try {
                    await kayitService.create({
                        etkinlik_id: etkinlikId,
                        durum: 'Beklemede'
                    });
                    setMessage('Etkinliğe katılım isteğiniz alındı!');
                    fetchRegistrations();
                } catch (err) {
                    setError('Katılım başarısız: ' + (err.response?.data?.message || err.message));
                }
            },
            'success',
            'Katıl'
        );
    };

    const handleCancel = (etkinlikId) => {
        openConfirmModal(
            'Kaydı İptal Et',
            'Kaydınızı iptal etmek istediğinize emin misiniz?',
            async () => {
                const reg = myRegistrations.find(r => r.etkinlik_id === etkinlikId);
                if (!reg) return;

                try {
                    await kayitService.delete(reg.kayit_id);
                    setMessage('Kaydınız iptal edildi.');
                    fetchRegistrations();
                } catch (err) {
                    setError('İptal işlemi başarısız: ' + (err.response?.data?.message || err.message));
                }
            },
            'danger',
            'İptal Et'
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            let response;
            if (editMode) {
                response = await etkinlikService.update(selectedEtkinlik.etkinlik_id, formData);
            } else {
                response = await etkinlikService.create(formData);
            }

            if (response.data.success) {
                setMessage(editMode ? 'Etkinlik başarıyla güncellendi!' : 'Etkinlik başarıyla eklendi!');
                setShowModal(false);
                resetForm();
                fetchEtkinlikler();
            }
        } catch (err) {
            const serverError = err.response?.data;
            let errorMessage = 'Hata oluştu: ' + (err.message);

            if (serverError) {
                errorMessage = `Sunucu Hatası:\nMesaj: ${serverError.message}\nDetay: ${serverError.error}\nSQL Mesajı: ${serverError.sqlMessage || 'Yok'}`;
            }

            alert(errorMessage);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (etkinlik) => {
        setEditMode(true);
        setSelectedEtkinlik(etkinlik);

        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            date.setHours(date.getHours() + 3);
            return date.toISOString().slice(0, 16);
        };

        setFormData({
            etkinlik_adi: etkinlik.etkinlik_adi,
            aciklama: etkinlik.aciklama || '',
            baslangic_tarihi: formatDateForInput(etkinlik.baslangic_tarihi),
            bitis_tarihi: formatDateForInput(etkinlik.bitis_tarihi),
            kontenjan: etkinlik.kontenjan,
            kategori_id: etkinlik.kategori_id,
            mekan_id: etkinlik.mekan_id,
            durum: etkinlik.durum
        });

        setShowModal(true);
    };

    const resetForm = () => {
        setEditMode(false);
        setSelectedEtkinlik(null);
        setFormData({
            etkinlik_adi: '',
            aciklama: '',
            baslangic_tarihi: '',
            bitis_tarihi: '',
            kontenjan: '',
            kategori_id: '',
            mekan_id: '',
            durum: 'Planlanıyor'
        });
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDurumBadge = (durum) => {
        switch (durum) {
            case 'Aktif': return 'bg-success';
            case 'Planlanıyor': return 'bg-warning';
            case 'Tamamlandı': return 'bg-secondary';
            default: return 'bg-danger';
        }
    };

    // ... existing render ...
    // Need to insert modal JSX before closing div

    return (
        <div className="container">
            {/* ... existing JSX ... */}

            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <h1 className="display-5">
                        <i className="bi bi-calendar-event"></i> Etkinlikler
                    </h1>
                    {isAdmin && (
                        <button onClick={openModal} className="btn btn-primary btn-lg">
                            <i className="bi bi-calendar-plus"></i> Yeni Etkinlik Ekle
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="alert alert-danger alert-dismissible fade show">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>}
            {message && <div className="alert alert-success alert-dismissible fade show">
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
            </div>}

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Etkinlik Adı</th>
                                    <th>Kategori</th>
                                    <th>Mekan</th>
                                    <th>Tarih</th>
                                    <th>Kontenjan</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {etkinlikler.map((etkinlik) => (
                                    <tr key={etkinlik.etkinlik_id}>
                                        <td>{etkinlik.etkinlik_id}</td>
                                        <td><strong>{etkinlik.etkinlik_adi}</strong></td>
                                        <td><span className="badge bg-info">{etkinlik.kategori_adi}</span></td>
                                        <td><i className="bi bi-geo-alt"></i> {etkinlik.mekan_adi}</td>
                                        <td>{formatDate(etkinlik.baslangic_tarihi)}</td>
                                        <td><span className="badge bg-secondary">{etkinlik.kontenjan}</span></td>
                                        <td>
                                            <span className={`badge ${getDurumBadge(etkinlik.durum)}`}>
                                                {etkinlik.durum}
                                            </span>
                                        </td>
                                        {isAdmin ? (
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(etkinlik)}
                                                    className="btn btn-sm btn-warning me-2"
                                                >
                                                    <i className="bi bi-pencil"></i> Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(etkinlik.etkinlik_id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    <i className="bi bi-trash"></i> Sil
                                                </button>
                                            </td>
                                        ) : (
                                            <td>
                                                {myRegistrations.some(r => r.etkinlik_id === etkinlik.etkinlik_id) ? (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleCancel(etkinlik.etkinlik_id)}
                                                    >
                                                        <i className="bi bi-x-circle"></i> İptal Et
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleJoin(etkinlik.etkinlik_id)}
                                                        disabled={etkinlik.durum !== 'Aktif' && etkinlik.durum !== 'Planlanıyor'}
                                                    >
                                                        <i className="bi bi-person-plus"></i> Katıl
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {etkinlikler.length === 0 && (
                            <p className="text-center text-muted">Henüz etkinlik bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Etkinlik Ekleme Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className={`bi ${editMode ? 'bi-pencil-square' : 'bi-calendar-plus'}`}></i> {editMode ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="etkinlik_adi" className="form-label">Etkinlik Adı *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="etkinlik_adi"
                                            name="etkinlik_adi"
                                            value={formData.etkinlik_adi}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="aciklama" className="form-label">Açıklama</label>
                                        <textarea
                                            className="form-control"
                                            id="aciklama"
                                            name="aciklama"
                                            rows="3"
                                            value={formData.aciklama}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="baslangic_tarihi" className="form-label">Başlangıç Tarihi *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="baslangic_tarihi"
                                                name="baslangic_tarihi"
                                                value={formData.baslangic_tarihi}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="bitis_tarihi" className="form-label">Bitiş Tarihi *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="bitis_tarihi"
                                                name="bitis_tarihi"
                                                value={formData.bitis_tarihi}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="kategori_id" className="form-label">Kategori *</label>
                                            <select
                                                className="form-select"
                                                id="kategori_id"
                                                name="kategori_id"
                                                value={formData.kategori_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Kategori Seçin</option>
                                                {kategoriler.map(k => (
                                                    <option key={k.kategori_id} value={k.kategori_id}>
                                                        {k.kategori_adi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="mekan_id" className="form-label">Mekan *</label>
                                            <select
                                                className="form-select"
                                                id="mekan_id"
                                                name="mekan_id"
                                                value={formData.mekan_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Mekan Seçin</option>
                                                {mekanlar.map(m => (
                                                    <option key={m.mekan_id} value={m.mekan_id}>
                                                        {m.mekan_adi} - {m.sehir}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="kontenjan" className="form-label">Kontenjan *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="kontenjan"
                                                name="kontenjan"
                                                value={formData.kontenjan}
                                                onChange={handleChange}
                                                required
                                                min="1"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="durum" className="form-label">Durum</label>
                                            <select
                                                className="form-select"
                                                id="durum"
                                                name="durum"
                                                value={formData.durum}
                                                onChange={handleChange}
                                            >
                                                <option value="Planlanıyor">Planlanıyor</option>
                                                <option value="Aktif">Aktif</option>
                                                <option value="Tamamlandı">Tamamlandı</option>
                                                <option value="İptal">İptal</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        <i className="bi bi-x-circle"></i> İptal
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                        {formLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle"></i> Kaydet
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{confirmModal.title}</h5>
                                <button type="button" className="btn-close" onClick={closeConfirmModal}></button>
                            </div>
                            <div className="modal-body">
                                <p>{confirmModal.message}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeConfirmModal}>
                                    İptal
                                </button>
                                <button type="button" className={`btn btn-${confirmModal.variant}`} onClick={handleConfirm}>
                                    {confirmModal.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Etkinlikler;
