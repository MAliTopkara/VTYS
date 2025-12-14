import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, sifre);
            if (response.data.success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş yapılırken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-5">
                    <div className="card shadow-lg">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#667eea' }}></i>
                                <h2 className="mt-3">Giriş Yap</h2>
                                <p className="text-muted">Etkinlik Yönetim Sistemine Hoş Geldiniz</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    <strong>{error}</strong>
                                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        <i className="bi bi-envelope"></i> Email Adresi
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="ornek@email.com"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="sifre" className="form-label">
                                        <i className="bi bi-lock"></i> Şifre
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        id="sifre"
                                        value={sifre}
                                        onChange={(e) => setSifre(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Giriş yapılıyor...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right"></i> Giriş Yap
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center">
                                <p className="text-muted mb-2">
                                    Hesabınız yok mu?{' '}
                                    <Link to="/register" className="text-decoration-none fw-bold">
                                        Kayıt Ol
                                    </Link>
                                </p>
                                <small className="text-muted">
                                    <i className="bi bi-info-circle"></i>{' '}
                                    Kullanıcılar tablosundaki email ve şifre ile giriş yapabilirsiniz.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
