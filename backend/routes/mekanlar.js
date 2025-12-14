const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/mekanlar - Tüm mekanları listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM mekanlar ORDER BY sehir, mekan_adi'
        );

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Mekanlar listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mekanlar alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/mekanlar/:id - Tek mekan getir
router.get('/:id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM mekanlar WHERE mekan_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mekan bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Mekan getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mekan alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/mekanlar - Yeni mekan ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const { mekan_adi, adres, sehir, kapasite, iletisim_telefon } = req.body;

        if (!mekan_adi) {
            return res.status(400).json({
                success: false,
                message: 'Mekan adı gerekli!'
            });
        }

        const [result] = await pool.query(`
            INSERT INTO mekanlar (mekan_adi, adres, sehir, kapasite, iletisim_telefon) 
            VALUES (?, ?, ?, ?, ?)
        `, [mekan_adi, adres, sehir, kapasite, iletisim_telefon]);

        res.status(201).json({
            success: true,
            message: 'Mekan başarıyla eklendi!',
            mekan_id: result.insertId
        });
    } catch (error) {
        console.error('Mekan ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mekan eklenirken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/mekanlar/:id - Mekan güncelle
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const { mekan_adi, adres, sehir, kapasite, iletisim_telefon } = req.body;

        const [result] = await pool.query(`
            UPDATE mekanlar 
            SET mekan_adi=?, adres=?, sehir=?, kapasite=?, iletisim_telefon=? 
            WHERE mekan_id=?
        `, [mekan_adi, adres, sehir, kapasite, iletisim_telefon, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mekan bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Mekan başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Mekan güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mekan güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/mekanlar/:id - Mekan sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM mekanlar WHERE mekan_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mekan bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Mekan başarıyla silindi!'
        });
    } catch (error) {
        console.error('Mekan silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mekan silinirken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
