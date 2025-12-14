const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const { pool, testConnection } = require('./db');

// Route dosyalarını import et
const authRoutes = require('./routes/auth');
const etkinliklerRoutes = require('./routes/etkinlikler');
const kategorilerRoutes = require('./routes/kategoriler');
const katilimcilarRoutes = require('./routes/katilimcilar');
const mekanlarRoutes = require('./routes/mekanlar');
const sponsorlarRoutes = require('./routes/sponsorlar');
const kayitlarRoutes = require('./routes/kayitlar');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'etkinlik_yonetim_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Production'da true yapılmalı (HTTPS için)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));

// Ana route - API durumunu kontrol et
app.get('/', (req, res) => {
    res.json({
        message: 'Etkinlik Yönetim API çalışıyor!',
        status: 'active',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            etkinlikler: '/api/etkinlikler',
            kategoriler: '/api/kategoriler',
            katilimcilar: '/api/katilimcilar',
            mekanlar: '/api/mekanlar',
            sponsorlar: '/api/sponsorlar',
            kayitlar: '/api/kayitlar',
            dashboard: '/api/dashboard'
        }
    });
});

// Veritabanı bağlantısını test eden route
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as test');
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// API Route'ları tanımla
app.use('/api/auth', authRoutes);
app.use('/api/etkinlikler', etkinliklerRoutes);
app.use('/api/kategoriler', kategorilerRoutes);
app.use('/api/katilimcilar', katilimcilarRoutes);
app.use('/api/mekanlar', mekanlarRoutes);
app.use('/api/sponsorlar', sponsorlarRoutes);
app.use('/api/kayitlar', kayitlarRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı!',
        requestedUrl: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası!',
        error: err.message
    });
});

// Sunucuyu başlat
async function startServer() {
    // Önce veritabanı bağlantısını test et
    const dbConnected = await testConnection();

    if (dbConnected) {
        app.listen(PORT, () => {
            console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
            console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
            console.log('');
            console.log('📌 Mevcut API Endpoint\'leri:');
            console.log('   - POST /api/auth/login');
            console.log('   - POST /api/auth/register');
            console.log('   - POST /api/auth/logout');
            console.log('   - GET  /api/dashboard');
            console.log('   - GET  /api/etkinlikler');
            console.log('   - GET  /api/kategoriler');
            console.log('   - GET  /api/katilimcilar');
            console.log('   - GET  /api/mekanlar');
            console.log('   - GET  /api/sponsorlar');
            console.log('   - GET  /api/kayitlar');
        });
    } else {
        console.log('⚠️  Veritabanı bağlantısı kurulamadı, ancak sunucu yine de başlatılıyor...');
        app.listen(PORT, () => {
            console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor (DB bağlantısı yok)`);
        });
    }
}

startServer();
