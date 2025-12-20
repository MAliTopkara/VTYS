import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth eklendi

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Context'ten login fonksiyonunu al
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault(); // Event varsa preventDefault
        setLoading(true);
        setError('');
        console.log('Login: handleSubmit triggered', { email, sifre });

        try {
            // Context login fonksiyonunu kullan (State'i güncellesin diye)
            console.log('Login: Calling context.login');
            const response = await login(email, sifre);
            console.log('Login: context.login response:', response);

            if (response.data.success || response.data.token) {
                // Token ve Kullanıcı bilgilerini kaydet
                const token = response.data.token;
                const user = response.data.user;

                console.log('Login: Success. Saving to localStorage', { token, user });
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Yönlendir
                console.log('Login: Navigating to /etkinlikler');
                navigate('/etkinlikler');
            } else {
                console.warn('Login: Response success is false', response.data);
                setError('Giriş başarısız, lütfen tekrar deneyin.');
            }

        } catch (err) {
            console.error('Login: Error caught', err);
            // Hata detaylarını da yazdıralım
            if (err.response) {
                console.error('Login: Error response data:', err.response.data);
                console.error('Login: Error response status:', err.response.status);
            }
            setError(err.response?.data?.error || err.response?.data?.message || 'Hatalı email veya şifre.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="text-center mb-4 text-primary">
                        <i className="bi bi-box-arrow-in-right"></i> Giriş Yap
                    </h2>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Şifre</label>
                            <input
                                type="password"
                                className="form-control"
                                value={sifre}
                                onChange={(e) => setSifre(e.target.value)}
                                required
                            />
                        </div>

                        <div className="d-grid mt-4">
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                onClick={handleSubmit}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Giriş Yapılıyor...
                                    </>
                                ) : 'Giriş Yap'}
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-3">
                        <p className="mb-0">Hesabın yok mu? <Link to="/register" className="text-decoration-none">Kayıt Ol</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
