import { useState, useEffect } from 'react';
import { kategoriService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Kategoriler = () => {
    const [kategoriler, setKategoriler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedKategori, setSelectedKategori] = useState(null);
    const { isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        kategori_adi: '',
        aciklama: ''
    });

    useEffect(() => {
        fetchKategoriler();
    }, []);

    const fetchKategoriler = async () => {
        try {
            const response = await kategoriService.getAll();
            if (response.data.success) {
                setKategoriler(response.data.data);
            }
        } catch (err) {
            setError('Kategoriler yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

        try {
            await kategoriService.delete(id);
            setMessage('Kategori başarıyla silindi!');
            setKategoriler(prev => prev.filter(k => k.kategori_id !== id));
        } catch (err) {
            setError('Kategori silinirken hata oluştu!');
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
                response = await kategoriService.update(selectedKategori.kategori_id, formData);
            } else {
                response = await kategoriService.create(formData);
            }

            if (response.data.success) {
                setMessage(editMode ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!');
                setShowModal(false);
                resetForm();
                fetchKategoriler();
            }
        } catch (err) {
            console.error('Kategori işlem hatası:', err);
            setError('Hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (kategori) => {
        setEditMode(true);
        setSelectedKategori(kategori);
        setFormData({
            kategori_adi: kategori.kategori_adi,
            aciklama: kategori.aciklama || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditMode(false);
        setSelectedKategori(null);
        setFormData({
            kategori_adi: '',
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
                        <i className="bi bi-tags"></i> Kategoriler
                    </h1>
                    {isAdmin && (
                        <button onClick={openModal} className="btn btn-primary btn-lg">
                            <i className="bi bi-plus-circle"></i> Yeni Kategori Ekle
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
                                    <th>Kategori Adı</th>
                                    <th>Açıklama</th>
                                    {isAdmin && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {kategoriler.map((kategori) => (
                                    <tr key={kategori.kategori_id}>
                                        <td>{kategori.kategori_id}</td>
                                        <td><strong>{kategori.kategori_adi}</strong></td>
                                        <td>{kategori.aciklama || '-'}</td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(kategori)}
                                                    className="btn btn-sm btn-warning me-2"
                                                >
                                                    <i className="bi bi-pencil"></i> Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(kategori.kategori_id)}
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
                        {kategoriler.length === 0 && (
                            <p className="text-center text-muted">Henüz kategori bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Kategori Ekleme Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className={`bi ${editMode ? 'bi-pencil-square' : 'bi-plus-circle'}`}></i> {editMode ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="kategori_adi" className="form-label">Kategori Adı *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="kategori_adi"
                                            name="kategori_adi"
                                            value={formData.kategori_adi}
                                            onChange={handleChange}
                                            required
                                            placeholder="Örn: Konser, Spor, Tiyatro..."
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
                                            placeholder="Kategori hakkında kısa bir açıklama..."
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

export default Kategoriler;
