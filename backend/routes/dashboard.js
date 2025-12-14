const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired } = require('../middleware/auth');

// GET /api/dashboard - Ana sayfa istatistikleri
router.get('/', loginRequired, async (req, res) => {
    try {
        // Etkinlik sayısı
        const [etkinlikResult] = await pool.query(
            'SELECT COUNT(*) as total FROM etkinlikler'
        );

        // Katılımcı sayısı
        const [katilimciResult] = await pool.query(
            'SELECT COUNT(*) as total FROM katilimcilar'
        );

        // Kayıt sayısı
        const [kayitResult] = await pool.query(
            'SELECT COUNT(*) as total FROM kayitlar'
        );

        // Sponsor sayısı
        const [sponsorResult] = await pool.query(
            'SELECT COUNT(*) as total FROM sponsorlar'
        );

        // Mekan sayısı
        const [mekanResult] = await pool.query(
            'SELECT COUNT(*) as total FROM mekanlar'
        );

        // Kategori sayısı
        const [kategoriResult] = await pool.query(
            'SELECT COUNT(*) as total FROM kategoriler'
        );

        res.json({
            success: true,
            data: {
                etkinlik_sayisi: etkinlikResult[0].total,
                katilimci_sayisi: katilimciResult[0].total,
                kayit_sayisi: kayitResult[0].total,
                sponsor_sayisi: sponsorResult[0].total,
                mekan_sayisi: mekanResult[0].total,
                kategori_sayisi: kategoriResult[0].total
            }
        });
    } catch (error) {
        console.error('Dashboard istatistik hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler alınırken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
