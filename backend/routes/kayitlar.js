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
                k.katilim_durumu,
                kat.email
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

// POST /api/kayitlar - Yeni kayıt ekle (Admin veya Kullanıcı)
router.post('/', loginRequired, async (req, res) => {
    try {
        let { etkinlik_id, katilimci_id, durum } = req.body;
        const user = req.user;

        // Admin değilse ve başkası adına işlem yapmaya çalışıyorsa engelle
        if (katilimci_id && user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Başkası adına kayıt yapamazsınız!'
            });
        }

        // Eğer kullanıcı kendisi kayıt oluyorsa (katilimci_id yoksa)
        if (!katilimci_id) {
            // Önce bu email ile katılımcı var mı bak
            const [participants] = await pool.query('SELECT katilimci_id FROM katilimcilar WHERE email = ?', [user.email]);

            if (participants.length > 0) {
                katilimci_id = participants[0].katilimci_id;
            } else {
                // Katılımcı yoksa oluştur
                const [newPart] = await pool.query(
                    'INSERT INTO katilimcilar (ad_soyad, email) VALUES (?, ?)',
                    [`${user.ad || ''} ${user.soyad || ''}`.trim(), user.email]
                );
                katilimci_id = newPart.insertId;
            }
        }

        if (!etkinlik_id || !katilimci_id) {
            return res.status(400).json({
                success: false,
                message: 'Etkinlik ID gerekli!'
            });
        }

        // Mükerrer kayıt kontrolü
        const [existing] = await pool.query(
            'SELECT * FROM kayitlar WHERE etkinlik_id = ? AND katilimci_id = ?',
            [etkinlik_id, katilimci_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Zaten bu etkinliğe kaydınız var!'
            });
        }

        const [result] = await pool.query(`
            INSERT INTO kayitlar (etkinlik_id, katilimci_id, durum) 
            VALUES (?, ?, ?)
        `, [etkinlik_id, katilimci_id, durum || 'Beklemede']);

        res.status(201).json({
            success: true,
            message: 'Kayıt başarıyla oluşturuldu!',
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

// DELETE /api/kayitlar/:id - Kayıt sil (İptal)
router.delete('/:id', loginRequired, async (req, res) => {
    try {
        const kayitId = req.params.id;
        const user = req.user;

        // Önce kaydı bul
        const [registrations] = await pool.query(`
            SELECT k.*, p.email 
            FROM kayitlar k 
            JOIN katilimcilar p ON k.katilimci_id = p.katilimci_id 
            WHERE k.kayit_id = ?
        `, [kayitId]);

        if (registrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kayıt bulunamadı!'
            });
        }

        const registration = registrations[0];

        // Yetki kontrolü: Admin değilse ve kayıt kendine ait değilse
        if (user.rol !== 'admin' && registration.email !== user.email) {
            return res.status(403).json({
                success: false,
                message: 'Bu kaydı silme yetkiniz yok!'
            });
        }

        const [result] = await pool.query(
            'DELETE FROM kayitlar WHERE kayit_id = ?',
            [kayitId]
        );

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
