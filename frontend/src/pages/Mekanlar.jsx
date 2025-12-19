import { useState, useEffect } from 'react';
import { mekanService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Mekanlar = () => {
    const [mekanlar, setMekanlar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const { isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        mekan_adi: '',
        adres: '',
        sehir: '',
        kapasite: '',
        harita_link: '',
        iletisim_telefon: ''
    });

    useEffect(() => {
        fetchMekanlar();
    }, []);

    const fetchMekanlar = async () => {
        try {
            const response = await mekanService.getAll();
            if (response.data.success) {
                setMekanlar(response.data.data);
            }
        } catch (err) {
            setError('Mekanlar yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu mekanı silmek istediğinizden emin misiniz?')) return;

        try {
            await mekanService.delete(id);
            setMessage('Mekan başarıyla silindi!');
            setMekanlar(prev => prev.filter(m => m.mekan_id !== id));
        } catch (err) {
            setError('Mekan silinirken hata oluştu!');
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
            let response;
            if (editMode) {
                response = await mekanService.update(selectedId, formData);
            } else {
                response = await mekanService.create(formData);
            }

            if (response.data.success) {
                setMessage(editMode ? 'Mekan başarıyla güncellendi!' : 'Mekan başarıyla eklendi!');
                setShowModal(false);
                resetForm();
                fetchMekanlar();
            }
        } catch (err) {
            console.error('Mekan işlem hatası:', err);
            setError('Hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (mekan) => {
        setEditMode(true);
        setSelectedId(mekan.mekan_id);
        setFormData({
            mekan_adi: mekan.mekan_adi,
            adres: mekan.adres || '',
            sehir: mekan.sehir,
            kapasite: mekan.kapasite,
            harita_link: mekan.harita_link || '',
            iletisim_telefon: mekan.iletisim_telefon || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditMode(false);
        setSelectedId(null);
        setFormData({
            mekan_adi: '',
            adres: '',
            sehir: '',
            kapasite: '',
            harita_link: '',
            iletisim_telefon: ''
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
                        <i className="bi bi-geo-alt"></i> Mekanlar
                    </h1>
                    {isAdmin && (
                        <button onClick={openModal} className="btn btn-primary btn-lg">
                            <i className="bi bi-plus-circle"></i> Yeni Mekan Ekle
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
                                    <th>Mekan Adı</th>
                                    <th>Adres</th>
                                    <th>Şehir</th>
                                    <th>Kapasite</th>
                                    <th>İletişim Telefon</th>
                                    {isAdmin && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {mekanlar.map((mekan) => (
                                    <tr key={mekan.mekan_id}>
                                        <td>{mekan.mekan_id}</td>
                                        <td><strong>{mekan.mekan_adi}</strong></td>
                                        <td>{mekan.adres || '-'}</td>
                                        <td><i className="bi bi-geo-alt"></i> {mekan.sehir}</td>
                                        <td><span className="badge bg-info">{mekan.kapasite}</span></td>
                                        <td>{mekan.iletisim_telefon || '-'}</td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(mekan)}
                                                    className="btn btn-sm btn-warning me-2"
                                                >
                                                    <i className="bi bi-pencil"></i> Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(mekan.mekan_id)}
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
                        {mekanlar.length === 0 && (
                            <p className="text-center text-muted">Henüz mekan bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Mekan Ekleme Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className={`bi ${editMode ? 'bi-pencil-square' : 'bi-geo-alt'}`}></i> {editMode ? 'Mekanı Düzenle' : 'Yeni Mekan Ekle'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="mekan_adi" className="form-label">Mekan Adı *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="mekan_adi"
                                            name="mekan_adi"
                                            value={formData.mekan_adi}
                                            onChange={handleChange}
                                            required
                                            placeholder="Örn: Atatürk Kültür Merkezi"
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-8 mb-3">
                                            <label htmlFor="adres" className="form-label">Adres</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="adres"
                                                name="adres"
                                                value={formData.adres}
                                                onChange={handleChange}
                                                placeholder="Örn: İstiklal Caddesi No: 123"
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="sehir" className="form-label">Şehir *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="sehir"
                                                name="sehir"
                                                value={formData.sehir}
                                                onChange={handleChange}
                                                required
                                                placeholder="Örn: İstanbul"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="harita_link" className="form-label">Harita Linki</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="harita_link"
                                            name="harita_link"
                                            value={formData.harita_link}
                                            onChange={handleChange}
                                            placeholder="Google Maps linki..."
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="kapasite" className="form-label">Kapasite *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="kapasite"
                                                name="kapasite"
                                                value={formData.kapasite}
                                                onChange={handleChange}
                                                required
                                                min="1"
                                                placeholder="Örn: 500"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="iletisim_telefon" className="form-label">İletişim Telefonu</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="iletisim_telefon"
                                                name="iletisim_telefon"
                                                value={formData.iletisim_telefon}
                                                onChange={handleChange}
                                                placeholder="Örn: 0212 555 1234"
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

export default Mekanlar;
