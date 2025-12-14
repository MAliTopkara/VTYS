import { useState, useEffect } from 'react';
import { kayitService, etkinlikService, katilimciService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Kayitlar = () => {
    const [kayitlar, setKayitlar] = useState([]);
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [katilimcilar, setKatilimcilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const { isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        etkinlik_id: '',
        katilimci_id: '',
        durum: 'Beklemede'
    });

    useEffect(() => {
        fetchKayitlar();
        fetchEtkinlikler();
        fetchKatilimcilar();
    }, []);

    const fetchKayitlar = async () => {
        try {
            const response = await kayitService.getAll();
            if (response.data.success) {
                setKayitlar(response.data.data);
            }
        } catch (err) {
            setError('Kayıtlar yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const fetchEtkinlikler = async () => {
        try {
            const response = await etkinlikService.getAll();
            if (response.data.success) {
                setEtkinlikler(response.data.data);
            }
        } catch (err) {
            console.error('Etkinlikler yüklenemedi:', err);
        }
    };

    const fetchKatilimcilar = async () => {
        try {
            const response = await katilimciService.getAll();
            if (response.data.success) {
                setKatilimcilar(response.data.data);
            }
        } catch (err) {
            console.error('Katılımcılar yüklenemedi:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

        try {
            await kayitService.delete(id);
            setMessage('Kayıt başarıyla silindi!');
            setKayitlar(prev => prev.filter(k => k.kayit_id !== id));
        } catch (err) {
            setError('Kayıt silinirken hata oluştu!');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const response = await kayitService.create(formData);
            if (response.data.success) {
                setMessage('Kayıt başarıyla eklendi!');
                setShowModal(false);
                resetForm();
                fetchKayitlar();
            }
        } catch (err) {
            console.error('Kayıt ekleme hatası:', err);
            setError('Hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            etkinlik_id: '',
            katilimci_id: '',
            durum: 'Beklemede'
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
            case 'Onaylandı': return 'bg-success';
            case 'Beklemede': return 'bg-warning';
            case 'İptal': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <h1 className="display-5">
                        <i className="bi bi-ticket-perforated"></i> Etkinlik Kayıtları
                    </h1>
                    {isAdmin && (
                        <button onClick={openModal} className="btn btn-primary btn-lg">
                            <i className="bi bi-plus-circle"></i> Yeni Kayıt Ekle
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
                                    <th>Kayıt ID</th>
                                    <th>Etkinlik Adı</th>
                                    <th>Katılımcı</th>
                                    <th>Kayıt Tarihi</th>
                                    <th>Durum</th>
                                    <th>Katılım</th>
                                    {isAdmin && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {kayitlar.map((kayit) => (
                                    <tr key={kayit.kayit_id}>
                                        <td>{kayit.kayit_id}</td>
                                        <td><strong>{kayit.etkinlik_adi}</strong></td>
                                        <td><i className="bi bi-person"></i> {kayit.ad_soyad}</td>
                                        <td>{formatDate(kayit.kayit_tarihi)}</td>
                                        <td>
                                            <span className={`badge ${getDurumBadge(kayit.durum)}`}>
                                                {kayit.durum}
                                            </span>
                                        </td>
                                        <td>
                                            {kayit.katilim_durumu ? (
                                                <span className="badge bg-success">Katıldı</span>
                                            ) : (
                                                <span className="badge bg-secondary">Katılmadı</span>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(kayit.kayit_id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    <i className="bi bi-trash"></i> Sil
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {kayitlar.length === 0 && (
                            <p className="text-center text-muted">Henüz kayıt bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Kayıt Ekleme Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-ticket-perforated"></i> Yeni Kayıt Ekle
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="etkinlik_id" className="form-label">Etkinlik Seçin *</label>
                                        <select
                                            className="form-select"
                                            id="etkinlik_id"
                                            name="etkinlik_id"
                                            value={formData.etkinlik_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Etkinlik Seçin --</option>
                                            {etkinlikler.map(e => (
                                                <option key={e.etkinlik_id} value={e.etkinlik_id}>
                                                    {e.etkinlik_adi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="katilimci_id" className="form-label">Katılımcı Seçin *</label>
                                        <select
                                            className="form-select"
                                            id="katilimci_id"
                                            name="katilimci_id"
                                            value={formData.katilimci_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Katılımcı Seçin --</option>
                                            {katilimcilar.map(k => (
                                                <option key={k.katilimci_id} value={k.katilimci_id}>
                                                    {k.ad_soyad} ({k.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="durum" className="form-label">Kayıt Durumu</label>
                                        <select
                                            className="form-select"
                                            id="durum"
                                            name="durum"
                                            value={formData.durum}
                                            onChange={handleChange}
                                        >
                                            <option value="Beklemede">Beklemede</option>
                                            <option value="Onaylandı">Onaylandı</option>
                                            <option value="İptal">İptal</option>
                                        </select>
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
        </div>
    );
};

export default Kayitlar;
