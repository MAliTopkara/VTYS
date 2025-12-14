import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auth servisleri
export const authService = {
    login: (email, sifre) => api.post('/auth/login', { email, sifre }),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

// Dashboard servisi
export const dashboardService = {
    getStats: () => api.get('/dashboard')
};

// Etkinlik servisleri
export const etkinlikService = {
    getAll: () => api.get('/etkinlikler'),
    getById: (id) => api.get(`/etkinlikler/${id}`),
    create: (data) => api.post('/etkinlikler', data),
    update: (id, data) => api.put(`/etkinlikler/${id}`, data),
    delete: (id) => api.delete(`/etkinlikler/${id}`)
};

// Kategori servisleri
export const kategoriService = {
    getAll: () => api.get('/kategoriler'),
    getById: (id) => api.get(`/kategoriler/${id}`),
    create: (data) => api.post('/kategoriler', data),
    update: (id, data) => api.put(`/kategoriler/${id}`, data),
    delete: (id) => api.delete(`/kategoriler/${id}`)
};

// Katılımcı servisleri
export const katilimciService = {
    getAll: () => api.get('/katilimcilar'),
    getById: (id) => api.get(`/katilimcilar/${id}`),
    create: (data) => api.post('/katilimcilar', data),
    update: (id, data) => api.put(`/katilimcilar/${id}`, data),
    delete: (id) => api.delete(`/katilimcilar/${id}`)
};

// Mekan servisleri
export const mekanService = {
    getAll: () => api.get('/mekanlar'),
    getById: (id) => api.get(`/mekanlar/${id}`),
    create: (data) => api.post('/mekanlar', data),
    update: (id, data) => api.put(`/mekanlar/${id}`, data),
    delete: (id) => api.delete(`/mekanlar/${id}`)
};

// Sponsor servisleri
export const sponsorService = {
    getAll: () => api.get('/sponsorlar'),
    getById: (id) => api.get(`/sponsorlar/${id}`),
    create: (data) => api.post('/sponsorlar', data),
    update: (id, data) => api.put(`/sponsorlar/${id}`, data),
    delete: (id) => api.delete(`/sponsorlar/${id}`)
};

// Kayıt servisleri
export const kayitService = {
    getAll: () => api.get('/kayitlar'),
    getById: (id) => api.get(`/kayitlar/${id}`),
    create: (data) => api.post('/kayitlar', data),
    update: (id, data) => api.put(`/kayitlar/${id}`, data),
    delete: (id) => api.delete(`/kayitlar/${id}`)
};

export default api;
