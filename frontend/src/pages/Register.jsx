import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        sifre: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // authService.register -> POST /api/auth/register
            await authService.register(formData);
            alert("Kayıt başarılı, giriş yapabilirsiniz.");
            navigate('/login');
        } catch (err) {
            console.error('Kayıt hatası:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Kayıt olurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="text-center mb-4 text-primary">
                        <i className="bi bi-person-plus-fill"></i> Kayıt Ol
                    </h2>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Ad</label>
                            <input
                                type="text"
                                name="ad"
                                className="form-control"
                                value={formData.ad}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Soyad</label>
                            <input
                                type="text"
                                name="soyad"
                                className="form-control"
                                value={formData.soyad}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Şifre</label>
                            <input
                                type="password"
                                name="sifre"
                                className="form-control"
                                value={formData.sifre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Kaydediliyor...
                                    </>
                                ) : 'Kayıt Ol'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-3">
                        <p className="mb-0">Zaten hesabın var mı? <Link to="/login" className="text-decoration-none">Giriş Yap</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
