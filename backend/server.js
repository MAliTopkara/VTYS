const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
const etkinlikSponsorlarRoutes = require('./routes/etkinlik_sponsorlar');

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

// GEÇİCİ VERİTABANI DÜZELTME ENDPOINT'İ (ÖNCELİKLİ)
console.log('--- Registering /api/fix-db route ---');
app.get('/api/fix-db', async (req, res) => {
    console.log('Request received for /api/fix-db');

    const dropSql = "DROP TABLE IF EXISTS kullanicilar";
    const createSql = `
        CREATE TABLE kullanicilar (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kullanici_id INT,
            ad VARCHAR(50) NOT NULL,
            soyad VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            sifre VARCHAR(255) NOT NULL,
            rol ENUM('admin', 'user') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_kullanici_id (kullanici_id)
        )
    `;

    try {
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query(dropSql);
        await pool.query(createSql);
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        res.send("<h1>BAŞARILI! Tablo sıfırlandı ve 'ad/soyad' sütunları eklendi. Şimdi kayıt olabilirsiniz.</h1>");
    } catch (err) {
        console.error("DB Fix Error:", err);
        res.send("Hata oluştu: " + err.message);
    }
});

// GEÇİCİ ADMIN YAPMA ENDPOINT'İ
app.get('/api/make-admin', async (req, res) => {
    const email = req.query.email || 'mehmetalitopkara080@gmail.com';

    try {
        const [result] = await pool.query(
            "UPDATE kullanicilar SET rol = 'admin' WHERE email = ?",
            [email]
        );

        if (result.affectedRows > 0) {
            res.send(`<h1>✅ BAŞARILI! ${email} admin yapıldı.</h1>`);
        } else {
            res.send(`<h1>❌ HATA! ${email} bulunamadı. Önce kayıt olun.</h1>`);
        }
    } catch (err) {
        console.error("Make Admin Error:", err);
        res.send("Hata oluştu: " + err.message);
    }
});

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
app.use('/api/etkinlik-sponsorlar', etkinlikSponsorlarRoutes);
app.use('/api/dashboard', dashboardRoutes);




// KAYIT OL (Register) Endpoint
app.post('/api/auth/register', async (req, res) => {
    const { ad, soyad, email, sifre } = req.body;

    // Basit Validasyon
    if (!email || !sifre) return res.status(400).json({ error: "Email ve şifre zorunlu." });

    try {
        // 1. Email Kontrolü
        const [results] = await pool.query("SELECT * FROM kullanicilar WHERE email = ?", [email]);
        if (results.length > 0) return res.status(409).json({ error: "Bu email zaten kayıtlı." });

        // 2. Şifreleme (Hashing)
        const hashedPassword = await bcrypt.hash(sifre, 10);

        // 3. Kullanıcıyı Kaydet (Varsayılan rol: 'user')
        const sql = "INSERT INTO kullanicilar (ad, soyad, email, sifre, rol) VALUES (?, ?, ?, ?, 'user')";
        await pool.query(sql, [ad, soyad, email, hashedPassword]);

        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu." });
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ error: "Veritabanı veya Kayıt hatası" });
    }
});


// GİRİŞ YAP (Login) Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, sifre } = req.body;

    try {
        // 1. Kullanıcıyı Bul
        const [results] = await pool.query("SELECT * FROM kullanicilar WHERE email = ?", [email]);
        if (results.length === 0) return res.status(401).json({ error: "Kullanıcı bulunamadı." });

        const user = results[0];

        // 2. Şifreyi Kontrol Et
        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) return res.status(401).json({ error: "Hatalı şifre." });

        // 3. Token Üret (Şimdilik basit bir secret key kullanalım)
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            'gizli-anahtar-123',
            { expiresIn: '2h' }
        );

        // 4. Başarılı Cevap
        res.json({
            message: "Giriş başarılı",
            token,
            user: { id: user.id, ad: user.ad, rol: user.rol }
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: "Sunucu hatası" });
    }
});





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
