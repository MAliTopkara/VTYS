import { useState, useEffect } from 'react';
import { kullaniciService } from '../services/api';

const Kullanicilar = () => {
    const [kullanicilar, setKullanicilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Kullanıcıları yükle
    const fetchKullanicilar = async () => {
        try {
            setLoading(true);
            const response = await kullaniciService.getAll();
            setKullanicilar(response.data.data);
            setError('');
        } catch (err) {
            console.error('Kullanıcılar yüklenirken hata:', err);
            setError('Kullanıcılar yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKullanicilar();
    }, []);

    // Rol değiştir
    const handleRoleChange = async (kullaniciId, yeniRol) => {
        if (!window.confirm(`Bu kullanıcının rolünü "${yeniRol}" olarak değiştirmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await kullaniciService.updateRole(kullaniciId, yeniRol);
            setSuccessMessage('Kullanıcı rolü başarıyla güncellendi!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchKullanicilar(); // Listeyi yenile
        } catch (err) {
            console.error('Rol güncelleme hatası:', err);
            setError(err.response?.data?.message || 'Rol güncellenirken hata oluştu!');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Kullanıcı sil
    const handleDelete = async (kullaniciId, email) => {
        if (!window.confirm(`${email} adresli kullanıcıyı silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await kullaniciService.delete(kullaniciId);
            setSuccessMessage('Kullanıcı başarıyla silindi!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchKullanicilar(); // Listeyi yenile
        } catch (err) {
            console.error('Kullanıcı silme hatası:', err);
            setError(err.response?.data?.message || 'Kullanıcı silinirken hata oluştu!');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-people-fill"></i> Kullanıcı Yönetimi</h2>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Ad Soyad</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Kayıt Tarihi</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kullanicilar.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            Henüz kullanıcı bulunmuyor.
                                        </td>
                                    </tr>
                                ) : (
                                    kullanicilar.map((kullanici) => (
                                        <tr key={kullanici.id}>
                                            <td>{kullanici.id}</td>
                                            <td>{kullanici.ad} {kullanici.soyad}</td>
                                            <td>{kullanici.email}</td>
                                            <td>
                                                <select
                                                    className={`form-select form-select-sm ${kullanici.rol === 'admin' ? 'bg-danger text-white' : 'bg-primary text-white'}`}
                                                    value={kullanici.rol}
                                                    onChange={(e) => handleRoleChange(kullanici.id, e.target.value)}
                                                    style={{ width: '120px' }}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td>{new Date(kullanici.created_at).toLocaleDateString('tr-TR')}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(kullanici.id, kullanici.email)}
                                                    title="Kullanıcıyı Sil"
                                                >
                                                    <i className="bi bi-trash"></i> Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3">
                        <p className="text-muted mb-0">
                            <i className="bi bi-info-circle"></i> Toplam {kullanicilar.length} kullanıcı
                        </p>
                    </div>
                </div>
            </div>

            <div className="alert alert-info mt-4">
                <h6><i className="bi bi-shield-check"></i> Güvenlik Notu:</h6>
                <ul className="mb-0">
                    <li>Kendi hesabınızın rolünü değiştiremezsiniz</li>
                    <li>Kendi hesabınızı silemezsiniz</li>
                    <li>Admin rolü tüm yetkilere sahiptir</li>
                    <li>User rolü sadece görüntüleme yetkisine sahiptir</li>
                </ul>
            </div>
        </div>
    );
};

export default Kullanicilar;
