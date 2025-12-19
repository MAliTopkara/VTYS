const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/kayitlar - Tüm kayıtları listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                k.kayit_id,
                k.etkinlik_id,
                k.katilimci_id,
                e.etkinlik_adi,
                kat.ad_soyad,
                k.kayit_tarihi,
                k.durum,
                k.katilim_durumu
            FROM kayitlar k
            INNER JOIN etkinlikler e ON k.etkinlik_id = e.etkinlik_id
            INNER JOIN katilimcilar kat ON k.katilimci_id = kat.katilimci_id
            ORDER BY k.kayit_tarihi DESC
        `);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Kayıtlar listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıtlar alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/kayitlar/:id - Tek kayıt getir
router.get('/:id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM kayitlar WHERE kayit_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kayıt bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Kayıt getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/kayitlar - Yeni kayıt ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const { etkinlik_id, katilimci_id, durum } = req.body;

        if (!etkinlik_id || !katilimci_id) {
            return res.status(400).json({
                success: false,
                message: 'Etkinlik ve katılımcı ID gerekli!'
            });
        }

        const [result] = await pool.query(`
            INSERT INTO kayitlar (etkinlik_id, katilimci_id, durum) 
            VALUES (?, ?, ?)
        `, [etkinlik_id, katilimci_id, durum || 'Beklemede']);

        res.status(201).json({
            success: true,
            message: 'Kayıt başarıyla eklendi!',
            kayit_id: result.insertId
        });
    } catch (error) {
        console.error('Kayıt ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt eklenirken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/kayitlar/:id - Kayıt güncelle  
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const { etkinlik_id, katilimci_id, durum, katilim_durumu } = req.body;

        const [result] = await pool.query(`
            UPDATE kayitlar 
            SET etkinlik_id=?, katilimci_id=?, durum=?, katilim_durumu=? 
            WHERE kayit_id=?
        `, [etkinlik_id, katilimci_id, durum, katilim_durumu, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kayıt bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Kayıt başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Kayıt güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/kayitlar/:id - Kayıt sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM kayitlar WHERE kayit_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kayıt bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Kayıt başarıyla silindi!'
        });
    } catch (error) {
        console.error('Kayıt silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt silinirken hata oluştu!',
            error: error.message
        });
    }
});

module.exports = router;
