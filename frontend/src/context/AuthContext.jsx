import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('AuthContext: checkAuth triggered');
        try {
            // Önce localStorage'da token var mı kontrol et
            const token = localStorage.getItem('token');
            console.log('AuthContext: localStorage token:', token);

            if (!token) {
                console.log('AuthContext: No token, setting user null');
                setUser(null);
                setLoading(false);
                return;
            }

            // Token varsa API'den kullanıcı bilgilerini al
            console.log('AuthContext: Calling authService.getMe');
            const response = await authService.getMe();
            console.log('AuthContext: getMe response:', response);

            if (response.data.success) {
                console.log('AuthContext: getMe success, setting user', response.data.user);
                setUser(response.data.user);
            } else {
                console.warn('AuthContext: getMe failed', response.data);
                setUser(null);
            }
        } catch (error) {
            console.error('AuthContext: checkAuth error', error);
            // Token geçersizse temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, sifre) => {
        console.log('AuthContext: login triggered');
        const response = await authService.login(email, sifre);
        if (response.data.success) {
            console.log('AuthContext: login success, setting user', response.data.user);
            setUser(response.data.user);
        }
        return response;
    };

    const logout = async () => {
        console.log('AuthContext: logout triggered');
        await authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.rol?.toLowerCase() === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
