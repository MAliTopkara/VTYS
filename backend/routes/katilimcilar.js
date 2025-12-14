const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/katilimcilar - Tüm katılımcıları listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM katilimcilar ORDER BY ad_soyad'
        );

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Katılımcılar listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Katılımcılar alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/katilimcilar/:id - Tek katılımcı getir
router.get('/:id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM katilimcilar WHERE katilimci_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Katılımcı bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Katılımcı getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Katılımcı alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/katilimcilar - Yeni katılımcı ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const { ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir } = req.body;

        if (!ad_soyad || !email) {
            return res.status(400).json({
                success: false,
                message: 'Ad soyad ve email gerekli!'
            });
        }

        const [result] = await pool.query(`
            INSERT INTO katilimcilar (ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir]);

        res.status(201).json({
            success: true,
            message: 'Katılımcı başarıyla eklendi!',
            katilimci_id: result.insertId
        });
    } catch (error) {
        console.error('Katılımcı ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Katılımcı eklenirken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/katilimcilar/:id - Katılımcı güncelle
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const { ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir } = req.body;

        const [result] = await pool.query(`
            UPDATE katilimcilar 
            SET ad_soyad=?, email=?, telefon=?, dogum_tarihi=?, cinsiyet=?, sehir=? 
            WHERE katilimci_id=?
        `, [ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Katılımcı bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Katılımcı başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Katılımcı güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Katılımcı güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/katilimcilar/:id - Katılımcı sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM katilimcilar WHERE katilimci_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Katılımcı bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Katılımcı başarıyla silindi!'
        });
    } catch (error) {
        console.error('Katılımcı silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Katılımcı silinirken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
