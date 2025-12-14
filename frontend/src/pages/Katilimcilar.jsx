import { useState, useEffect } from 'react';
import { katilimciService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Katilimcilar = () => {
    const [katilimcilar, setKatilimcilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const { isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        ad_soyad: '',
        email: '',
        telefon: '',
        sehir: ''
    });

    useEffect(() => {
        fetchKatilimcilar();
    }, []);

    const fetchKatilimcilar = async () => {
        try {
            const response = await katilimciService.getAll();
            if (response.data.success) {
                setKatilimcilar(response.data.data);
            }
        } catch (err) {
            setError('Katılımcılar yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu katılımcıyı silmek istediğinizden emin misiniz?')) return;

        try {
            await katilimciService.delete(id);
            setMessage('Katılımcı başarıyla silindi!');
            setKatilimcilar(prev => prev.filter(k => k.katilimci_id !== id));
        } catch (err) {
            setError('Katılımcı silinirken hata oluştu!');
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
            const response = await katilimciService.create(formData);
            if (response.data.success) {
                setMessage('Katılımcı başarıyla eklendi!');
                setShowModal(false);
                resetForm();
                fetchKatilimcilar();
            }
        } catch (err) {
            console.error('Katılımcı ekleme hatası:', err);
            setError('Hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            ad_soyad: '',
            email: '',
            telefon: '',
            sehir: ''
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
                        <i className="bi bi-people"></i> Katılımcılar
                    </h1>
                    {isAdmin && (
                        <button onClick={openModal} className="btn btn-primary btn-lg">
                            <i className="bi bi-person-plus"></i> Yeni Katılımcı Ekle
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
                                    <th>Ad Soyad</th>
                                    <th>Email</th>
                                    <th>Telefon</th>
                                    <th>Şehir</th>
                                    {isAdmin && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {katilimcilar.map((katilimci) => (
                                    <tr key={katilimci.katilimci_id}>
                                        <td>{katilimci.katilimci_id}</td>
                                        <td><strong>{katilimci.ad_soyad}</strong></td>
                                        <td>{katilimci.email || '-'}</td>
                                        <td>{katilimci.telefon || '-'}</td>
                                        <td>{katilimci.sehir || '-'}</td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(katilimci.katilimci_id)}
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
                        {katilimcilar.length === 0 && (
                            <p className="text-center text-muted">Henüz katılımcı bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Katılımcı Ekleme Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-person-plus"></i> Yeni Katılımcı Ekle
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="ad_soyad" className="form-label">Ad Soyad *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="ad_soyad"
                                            name="ad_soyad"
                                            value={formData.ad_soyad}
                                            onChange={handleChange}
                                            required
                                            placeholder="Örn: Ahmet Yılmaz"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="Örn: ahmet@email.com"
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="telefon" className="form-label">Telefon</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="telefon"
                                                name="telefon"
                                                value={formData.telefon}
                                                onChange={handleChange}
                                                placeholder="Örn: 0532 123 4567"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="sehir" className="form-label">Şehir</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="sehir"
                                                name="sehir"
                                                value={formData.sehir}
                                                onChange={handleChange}
                                                placeholder="Örn: İstanbul"
                                            />
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
        </div>
    );
};

export default Katilimcilar;
