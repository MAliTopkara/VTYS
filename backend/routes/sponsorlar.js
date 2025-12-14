const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/sponsorlar - Tüm sponsorları listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM sponsorlar ORDER BY sponsor_adi'
        );

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Sponsorlar listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsorlar alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/sponsorlar/:id - Tek sponsor getir
router.get('/:id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM sponsorlar WHERE sponsor_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Sponsor getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/sponsorlar - Yeni sponsor ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const { sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama } = req.body;

        if (!sponsor_adi) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor adı gerekli!'
            });
        }

        const [result] = await pool.query(`
            INSERT INTO sponsorlar (sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama]);

        res.status(201).json({
            success: true,
            message: 'Sponsor başarıyla eklendi!',
            sponsor_id: result.insertId
        });
    } catch (error) {
        console.error('Sponsor ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor eklenirken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/sponsorlar/:id - Sponsor güncelle
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const { sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama } = req.body;

        const [result] = await pool.query(`
            UPDATE sponsorlar 
            SET sponsor_adi=?, iletisim_email=?, iletisim_telefon=?, 
                web_sitesi=?, sektor=?, aciklama=? 
            WHERE sponsor_id=?
        `, [sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Sponsor başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Sponsor güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/sponsorlar/:id - Sponsor sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM sponsorlar WHERE sponsor_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Sponsor başarıyla silindi!'
        });
    } catch (error) {
        console.error('Sponsor silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sponsor silinirken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
