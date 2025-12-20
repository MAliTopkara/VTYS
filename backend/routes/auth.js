const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// POST /api/auth/register - Kayıt
router.post('/register', async (req, res) => {
    try {
        const { ad, soyad, email, sifre } = req.body;

        // Validasyon
        if (!ad || !soyad || !email || !sifre) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanlar (ad, soyad, email, şifre) zorunludur!'
            });
        }

        // Email kontrolü
        const [existingUser] = await pool.query(
            'SELECT * FROM kullanicilar WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor!'
            });
        }

        // Şifreleme (Bcrypt)
        const hashedPassword = await bcrypt.hash(sifre, 10);

        // Kayıt
        const [result] = await pool.query(
            'INSERT INTO kullanicilar (ad, soyad, email, sifre, rol) VALUES (?, ?, ?, ?, ?)',
            [ad, soyad, email, hashedPassword, 'user']
        );

        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu.',
            kullanici_id: result.insertId
        });

    } catch (error) {
        console.error('Register hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası!',
            error: error.message
        });
    }
});

// POST /api/auth/login - Giriş
router.post('/login', async (req, res) => {
    try {
        const { email, sifre } = req.body;

        if (!email || !sifre) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre gerekli!'
            });
        }

        const [rows] = await pool.query(
            'SELECT * FROM kullanicilar WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email veya şifre hatalı!'
            });
        }

        const kullanici = rows[0];

        // Şifre kontrolü (Bcrypt)
        const validPassword = await bcrypt.compare(sifre, kullanici.sifre);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email veya şifre hatalı!'
            });
        }

        // Token oluşturma
        const token = jwt.sign(
            {
                id: kullanici.id,
                email: kullanici.email,
                rol: kullanici.rol
            },
            process.env.JWT_SECRET || 'gizli_anahtar_123',
            { expiresIn: '24h' }
        );

        // Session güncelleme (Geriye dönük uyumluluk için)
        if (req.session) {
            req.session.kullanici_id = kullanici.id;
            req.session.rol = kullanici.rol;
        }

        res.json({
            success: true,
            message: 'Giriş başarılı!',
            token: token,
            user: {
                id: kullanici.id,
                ad: kullanici.ad,
                soyad: kullanici.soyad,
                email: kullanici.email,
                rol: kullanici.rol
            }
        });

    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası!',
            error: error.message
        });
    }
});

// GET /api/auth/me - Profil
router.get('/me', async (req, res) => {
    try {
        // Token'ı header'dan al
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token bulunamadı.' });
        }

        const token = authHeader.split(' ')[1];

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar_123');

        // Kullanıcı bilgilerini veritabanından al
        const [rows] = await pool.query(
            'SELECT id, ad, soyad, email, rol FROM kullanicilar WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        res.json({
            success: true,
            user: rows[0]
        });

    } catch (error) {
        console.error('Me endpoint hatası:', error);
        return res.status(401).json({ success: false, message: 'Geçersiz token.' });
    }
});

// POST /api/auth/logout - Çıkış
router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Çıkış yapılamadı.' });
            }
            res.clearCookie('connect.sid'); // Session cookie adını temizle
            res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
        });
    } else {
        res.json({ success: true, message: 'Zaten giriş yapılmamış.' });
    }
});

module.exports = router;
