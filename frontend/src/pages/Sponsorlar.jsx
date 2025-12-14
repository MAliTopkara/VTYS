import { useState, useEffect } from 'react';
import { sponsorService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Sponsorlar = () => {
    const [sponsorlar, setSponsorlar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const { isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        sponsor_adi: '',
        iletisim_email: '',
        iletisim_telefon: '',
        web_sitesi: '',
        sektor: '',
        aciklama: ''
    });

    useEffect(() => {
        fetchSponsorlar();
    }, []);

    const fetchSponsorlar = async () => {
        try {
            const response = await sponsorService.getAll();
            if (response.data.success) {
                setSponsorlar(response.data.data);
            }
        } catch (err) {
            setError('Sponsorlar yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu sponsoru silmek istediğinizden emin misiniz?')) return;

        try {
            await sponsorService.delete(id);
            setMessage('Sponsor başarıyla silindi!');
            setSponsorlar(prev => prev.filter(s => s.sponsor_id !== id));
        } catch (err) {
            setError('Sponsor silinirken hata oluştu!');
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
            const response = await sponsorService.create(formData);
            if (response.data.success) {
                setMessage('Sponsor başarıyla eklendi!');
                setShowModal(false);
                resetForm();
                fetchSponsorlar();
            }
        } catch (err) {
            console.error('Sponsor ekleme hatası:', err);
            setError('Hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            sponsor_adi: '',
            iletisim_email: '',
            iletisim_telefon: '',
            web_sitesi: '',
            sektor: '',
            aciklama: ''
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
                        <i className="bi bi-star"></i> Sponsorlar
                    </h1>
                    {isAdmin && (
                        <button onClick={openModal} className="btn btn-primary btn-lg">
                            <i className="bi bi-plus-circle"></i> Yeni Sponsor Ekle
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
                                    <th>Sponsor Adı</th>
                                    <th>Email</th>
                                    <th>Telefon</th>
                                    <th>Web Sitesi</th>
                                    <th>Sektör</th>
                                    {isAdmin && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {sponsorlar.map((sponsor) => (
                                    <tr key={sponsor.sponsor_id}>
                                        <td>{sponsor.sponsor_id}</td>
                                        <td><strong>{sponsor.sponsor_adi}</strong></td>
                                        <td>{sponsor.iletisim_email || '-'}</td>
                                        <td>{sponsor.iletisim_telefon || '-'}</td>
                                        <td>
                                            {sponsor.web_sitesi ? (
                                                <a href={sponsor.web_sitesi} target="_blank" rel="noopener noreferrer">
                                                    <i className="bi bi-link-45deg"></i> {sponsor.web_sitesi}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td><span className="badge bg-secondary">{sponsor.sektor || '-'}</span></td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(sponsor.sponsor_id)}
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
                        {sponsorlar.length === 0 && (
                            <p className="text-center text-muted">Henüz sponsor bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sponsor Ekleme Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-star"></i> Yeni Sponsor Ekle
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="sponsor_adi" className="form-label">Sponsor Adı *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="sponsor_adi"
                                                name="sponsor_adi"
                                                value={formData.sponsor_adi}
                                                onChange={handleChange}
                                                required
                                                placeholder="Örn: ABC Teknoloji A.Ş."
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="sektor" className="form-label">Sektör</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="sektor"
                                                name="sektor"
                                                value={formData.sektor}
                                                onChange={handleChange}
                                                placeholder="Örn: Teknoloji, Finans, Sağlık..."
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="iletisim_email" className="form-label">İletişim Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="iletisim_email"
                                                name="iletisim_email"
                                                value={formData.iletisim_email}
                                                onChange={handleChange}
                                                placeholder="Örn: sponsor@firma.com"
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

                                    <div className="mb-3">
                                        <label htmlFor="web_sitesi" className="form-label">Web Sitesi</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            id="web_sitesi"
                                            name="web_sitesi"
                                            value={formData.web_sitesi}
                                            onChange={handleChange}
                                            placeholder="Örn: https://www.firma.com"
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
                                            placeholder="Sponsor hakkında kısa bir açıklama..."
                                        ></textarea>
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

export default Sponsorlar;
