import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import UserDashboard from '../components/Dashboard/UserDashboard';

const Dashboard = () => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4">
                Hoş Geldiniz, <span className="text-primary">{user?.ad_soyad}</span>
            </h2>

            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>
    );
};

export default Dashboard;
