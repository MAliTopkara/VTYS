import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UserDashboard = () => {
    const [stats, setStats] = useState({
        joinedEvents: [],
        upcomingEvents: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard/user-home');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (err) {
                console.error('Dashboard error:', err);
                setError('Veriler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="row g-4">
            {/* Sol Taraf: Katıldığım Etkinlikler */}
            <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0"><i className="bi bi-calendar-check me-2"></i>Katıldığım Etkinlikler</h5>
                    </div>
                    <ul className="list-group list-group-flush">
                        {stats.joinedEvents.length > 0 ? (
                            stats.joinedEvents.map((event) => (
                                <li key={event.etkinlik_id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{event.etkinlik_adi}</strong>
                                        <div className="small text-muted">
                                            <i className="bi bi-clock me-1"></i>{formatDate(event.baslangic_tarihi)}
                                        </div>
                                    </div>
                                    <span className={`badge ${event.kayit_durumu === 'Onaylandı' ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                                        {event.kayit_durumu}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-center text-muted py-4">
                                <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                                Henüz bir etkinliğe katılmadınız.
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Sağ Taraf: Yaklaşan Etkinlikler */}
            <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0"><i className="bi bi-megaphone me-2"></i>Yaklaşan Etkinlikler</h5>
                    </div>
                    <div className="card-body">
                        {stats.upcomingEvents.length > 0 ? (
                            <div className="row g-3">
                                {stats.upcomingEvents.map((event) => (
                                    <div key={event.etkinlik_id} className="col-12">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="card-title mb-1">{event.etkinlik_adi}</h6>
                                                    <p className="card-text small text-muted mb-0">
                                                        <i className="bi bi-geo-alt me-1"></i>{event.mekan_adi}
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge bg-primary mb-1">{event.kategori_adi}</span>
                                                    <div className="small text-muted">{formatDate(event.baslangic_tarihi)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-4">
                                <p>Şu an planlanan etkinlik bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
