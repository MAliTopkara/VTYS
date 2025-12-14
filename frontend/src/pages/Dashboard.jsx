import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        etkinlik_sayisi: 0,
        katilimci_sayisi: 0,
        kayit_sayisi: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardService.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            setError('İstatistikler yüklenirken hata oluştu!');
        } finally {
            setLoading(false);
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
                <div className="col-12">
                    <h1 className="display-4">
                        <i className="bi bi-speedometer2"></i> Dashboard
                    </h1>
                    <p className="lead">Etkinlik Yönetim Sistemi - Genel Bakış</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {/* İstatistik Kartları */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card stat-card bg-gradient">
                        <div className="card-body">
                            <i className="bi bi-calendar-event stat-number text-primary"></i>
                            <h2 className="stat-number">{stats.etkinlik_sayisi}</h2>
                            <p className="text-muted mb-0">Toplam Etkinlik</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card stat-card">
                        <div className="card-body">
                            <i className="bi bi-people stat-number text-success"></i>
                            <h2 className="stat-number text-success">{stats.katilimci_sayisi}</h2>
                            <p className="text-muted mb-0">Toplam Katılımcı</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card stat-card">
                        <div className="card-body">
                            <i className="bi bi-check-circle stat-number text-info"></i>
                            <h2 className="stat-number text-info">{stats.kayit_sayisi}</h2>
                            <p className="text-muted mb-0">Toplam Kayıt</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hızlı Erişim */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title"><i className="bi bi-calendar-event"></i> Etkinlikler</h5>
                            <p className="card-text">Tüm etkinlikleri görüntüleyin, yeni etkinlik ekleyin.</p>
                            <Link to="/etkinlikler" className="btn btn-primary">
                                <i className="bi bi-arrow-right"></i> Etkinliklere Git
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title"><i className="bi bi-people"></i> Katılımcılar</h5>
                            <p className="card-text">Katılımcı listesini görüntüleyin ve yönetin.</p>
                            <Link to="/katilimcilar" className="btn btn-success">
                                <i className="bi bi-arrow-right"></i> Katılımcılara Git
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
