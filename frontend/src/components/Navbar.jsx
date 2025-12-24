import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = async () => {
        try {
            await logout(); // Backend session destroy
        } catch (error) {
            console.error('Logout failed:', error);
        }
        // Client side cleanup
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    if (!isAuthenticated) return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <i className="bi bi-calendar-event"></i> Etkinlik Yönetim Sistemi
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/')}`} to="/">
                                <i className="bi bi-house"></i> Ana Sayfa
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/etkinlikler')}`} to="/etkinlikler">
                                <i className="bi bi-calendar-event"></i> Etkinlikler
                            </Link>
                        </li>
                        {user?.rol === 'admin' && (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/kategoriler')}`} to="/kategoriler">
                                        <i className="bi bi-tags"></i> Kategoriler
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/katilimcilar')}`} to="/katilimcilar">
                                        <i className="bi bi-people"></i> Katılımcılar
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/mekanlar')}`} to="/mekanlar">
                                        <i className="bi bi-geo-alt"></i> Mekanlar
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/sponsorlar')}`} to="/sponsorlar">
                                        <i className="bi bi-star"></i> Sponsorlar
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/kayitlar')}`} to="/kayitlar">
                                        <i className="bi bi-clipboard-check"></i> Kayıtlar
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/kullanicilar')}`} to="/kullanicilar">
                                        <i className="bi bi-people-fill"></i> Kullanıcılar
                                    </Link>
                                </li>
                            </>
                        )}
                        <li className="nav-item dropdown">
                            <button
                                className="btn btn-light dropdown-toggle ms-2"
                                type="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-person-circle"></i> {user?.ad_soyad}
                                <span className="badge bg-primary ms-1">{user?.rol}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li>
                                    <h6 className="dropdown-header">
                                        <i className="bi bi-person"></i> {user?.ad_soyad}
                                    </h6>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right"></i> Çıkış Yap
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
