const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');

// MD5 hash fonksiyonu
const md5Hash = (text) => {
    return crypto.createHash('md5').update(text).digest('hex');
};

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
        const hashedPassword = md5Hash(sifre);

        if (kullanici.sifre !== hashedPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email veya şifre hatalı!'
            });
        }

        // Session'a kullanıcı bilgilerini kaydet
        req.session.kullanici_id = kullanici.kullanici_id;
        req.session.email = kullanici.email;
        req.session.ad_soyad = kullanici.ad_soyad;
        req.session.rol = kullanici.rol;

        res.json({
            success: true,
            message: `Hoş geldiniz, ${kullanici.ad_soyad}!`,
            user: {
                kullanici_id: kullanici.kullanici_id,
                email: kullanici.email,
                ad_soyad: kullanici.ad_soyad,
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

// POST /api/auth/register - Kayıt
router.post('/register', async (req, res) => {
    try {
        const { ad_soyad, email, telefon, sifre, sifre_tekrar, dogum_tarihi, sehir } = req.body;

        // Gerekli alan kontrolü
        if (!ad_soyad || !email || !sifre || !sifre_tekrar) {
            return res.status(400).json({
                success: false,
                message: 'Ad soyad, email ve şifre alanları zorunludur!'
            });
        }

        // Şifre eşleşme kontrolü
        if (sifre !== sifre_tekrar) {
            return res.status(400).json({
                success: false,
                message: 'Şifreler eşleşmiyor!'
            });
        }

        // Email benzersizlik kontrolü
        const [existingUser] = await pool.query(
            'SELECT * FROM kullanicilar WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor!'
            });
        }

        // Şifreyi MD5 ile hashle
        const hashedPassword = md5Hash(sifre);

        // Kullanıcıyı veritabanına ekle
        const [result] = await pool.query(
            `INSERT INTO kullanicilar (ad_soyad, email, sifre, rol) 
             VALUES (?, ?, ?, 'Kullanici')`,
            [ad_soyad, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Kayıt başarılı! Giriş yapabilirsiniz.',
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

// POST /api/auth/logout - Çıkış
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Çıkış yapılırken hata oluştu!'
            });
        }
        res.json({
            success: true,
            message: 'Başarıyla çıkış yaptınız!'
        });
    });
});

// GET /api/auth/me - Mevcut kullanıcı bilgisi
router.get('/me', (req, res) => {
    if (!req.session || !req.session.kullanici_id) {
        return res.status(401).json({
            success: false,
            message: 'Oturum açılmamış!'
        });
    }

    res.json({
        success: true,
        user: {
            kullanici_id: req.session.kullanici_id,
            email: req.session.email,
            ad_soyad: req.session.ad_soyad,
            rol: req.session.rol
        }
    });
});

module.exports = router;
