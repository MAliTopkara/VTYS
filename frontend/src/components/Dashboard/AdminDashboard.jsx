import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalParticipants: 0,
        totalEvents: 0,
        totalVenues: 0,
        expiredActiveCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/admin-stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (err) {
                console.error('Admin dashboard error:', err);
                setError('İstatistikler yüklenirken hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
        <div>
            {/* Uyarı Alanı */}
            {stats.expiredActiveCount > 0 && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2 fs-4"></i>
                    <div>
                        <strong>Dikkat!</strong> Süresi dolmuş ancak hala "Aktif" görünen <strong>{stats.expiredActiveCount}</strong> adet etkinlik var.
                        <br />
                        Lütfen etkinlikler sayfasından durumlarını güncelleyiniz.
                    </div>
                </div>
            )}

            {/* İstatistik Kartları */}
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card text-white bg-primary h-100 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Toplam Katılımcı</h6>
                                    <h2 className="display-4 fw-bold mb-0">
                                        {stats.totalParticipants !== undefined ? stats.totalParticipants : '...'}
                                    </h2>
                                </div>
                                <i className="bi bi-people fs-1 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card text-white bg-success h-100 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Toplam Etkinlik</h6>
                                    <h2 className="display-4 fw-bold mb-0">{stats.totalEvents}</h2>
                                </div>
                                <i className="bi bi-calendar-event fs-1 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card text-white bg-info h-100 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Toplam Mekan</h6>
                                    <h2 className="display-4 fw-bold mb-0">{stats.totalVenues}</h2>
                                </div>
                                <i className="bi bi-geo-alt fs-1 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
