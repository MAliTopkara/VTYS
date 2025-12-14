const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/kategoriler - Tüm kategorileri listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM kategoriler ORDER BY kategori_adi'
        );

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Kategoriler listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriler alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/kategoriler/:id - Tek kategori getir
router.get('/:id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM kategoriler WHERE kategori_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Kategori getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/kategoriler - Yeni kategori ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const { kategori_adi, aciklama } = req.body;

        if (!kategori_adi) {
            return res.status(400).json({
                success: false,
                message: 'Kategori adı gerekli!'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO kategoriler (kategori_adi, aciklama) VALUES (?, ?)',
            [kategori_adi, aciklama || '']
        );

        res.status(201).json({
            success: true,
            message: 'Kategori başarıyla eklendi!',
            kategori_id: result.insertId
        });
    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori eklenirken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/kategoriler/:id - Kategori güncelle
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const { kategori_adi, aciklama } = req.body;

        const [result] = await pool.query(
            'UPDATE kategoriler SET kategori_adi=?, aciklama=? WHERE kategori_id=?',
            [kategori_adi, aciklama, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Kategori başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/kategoriler/:id - Kategori sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM kategoriler WHERE kategori_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Kategori başarıyla silindi!'
        });
    } catch (error) {
        console.error('Kategori silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori silinirken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
