const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/etkinlik-sponsorlar - Tüm etkinlik-sponsor ilişkilerini listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                es.id,
                es.etkinlik_id,
                es.sponsor_id,
                e.etkinlik_adi,
                s.sponsor_adi,
                s.sektor,
                es.katki_miktari,
                es.katki_turu,
                es.created_at
            FROM etkinlik_sponsorlar es
            INNER JOIN etkinlikler e ON es.etkinlik_id = e.etkinlik_id
            INNER JOIN sponsorlar s ON es.sponsor_id = s.sponsor_id
            ORDER BY es.created_at DESC
        `);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Etkinlik-Sponsor listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlik-Sponsor ilişkileri alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/etkinlik-sponsorlar/etkinlik/:etkinlik_id - Bir etkinliğin sponsorlarını getir
router.get('/etkinlik/:etkinlik_id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                es.id,
                es.sponsor_id,
                s.sponsor_adi,
                s.sektor,
                s.iletisim_email,
                es.katki_miktari,
                es.katki_turu
            FROM etkinlik_sponsorlar es
            INNER JOIN sponsorlar s ON es.sponsor_id = s.sponsor_id
            WHERE es.etkinlik_id = ?
        `, [req.params.etkinlik_id]);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Etkinlik sponsorları getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlik sponsorları alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/etkinlik-sponsorlar/sponsor/:sponsor_id - Bir sponsorun desteklediği etkinlikleri getir
router.get('/sponsor/:sponsor_id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                es.id,
                es.etkinlik_id,
                e.etkinlik_adi,
                e.baslangic_tarihi,
                e.durum,
                es.katki_miktari,
                es.katki_turu
            FROM etkinlik_sponsorlar es
            INNER JOIN etkinlikler e ON es.etkinlik_id = e.etkinlik_id
            WHERE es.sponsor_id = ?
        `, [req.params.sponsor_id]);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Sponsor etkinlikleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor etkinlikleri alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/etkinlik-sponsorlar - Yeni etkinlik-sponsor ilişkisi ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const { etkinlik_id, sponsor_id, katki_miktari, katki_turu } = req.body;

        // Validasyon
        if (!etkinlik_id || !sponsor_id) {
            return res.status(400).json({
                success: false,
                message: 'Etkinlik ve sponsor seçimi zorunludur!'
            });
        }

        // Etkinlik var mı kontrol et
        const [etkinlikCheck] = await pool.query(
            'SELECT * FROM etkinlikler WHERE etkinlik_id = ?',
            [etkinlik_id]
        );
        if (etkinlikCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Etkinlik bulunamadı!'
            });
        }

        // Sponsor var mı kontrol et
        const [sponsorCheck] = await pool.query(
            'SELECT * FROM sponsorlar WHERE sponsor_id = ?',
            [sponsor_id]
        );
        if (sponsorCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor bulunamadı!'
            });
        }

        // Daha önce eklenmiş mi kontrol et
        const [existingCheck] = await pool.query(
            'SELECT * FROM etkinlik_sponsorlar WHERE etkinlik_id = ? AND sponsor_id = ?',
            [etkinlik_id, sponsor_id]
        );
        if (existingCheck.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Bu sponsor zaten bu etkinliğe eklenmiş!'
            });
        }

        // Ekle
        const [result] = await pool.query(
            'INSERT INTO etkinlik_sponsorlar (etkinlik_id, sponsor_id, katki_miktari, katki_turu) VALUES (?, ?, ?, ?)',
            [etkinlik_id, sponsor_id, katki_miktari || 0, katki_turu || 'Maddi']
        );

        res.status(201).json({
            success: true,
            message: 'Sponsor başarıyla etkinliğe eklendi!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Etkinlik-Sponsor ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor eklenirken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/etkinlik-sponsorlar/:id - Etkinlik-sponsor ilişkisini güncelle
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const { katki_miktari, katki_turu } = req.body;

        const [result] = await pool.query(
            'UPDATE etkinlik_sponsorlar SET katki_miktari = ?, katki_turu = ? WHERE id = ?',
            [katki_miktari, katki_turu, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Etkinlik-Sponsor ilişkisi bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Sponsor bilgisi başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Etkinlik-Sponsor güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/etkinlik-sponsorlar/:id - Etkinlik-sponsor ilişkisini sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM etkinlik_sponsorlar WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Etkinlik-Sponsor ilişkisi bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Sponsor başarıyla etkinlikten kaldırıldı!'
        });
    } catch (error) {
        console.error('Etkinlik-Sponsor silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor silinirken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
