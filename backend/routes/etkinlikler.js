const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/etkinlikler - Tüm etkinlikleri listele
router.get('/', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.etkinlik_id,
                e.etkinlik_adi,
                e.aciklama,
                k.kategori_adi,
                k.kategori_id,
                m.mekan_adi,
                m.mekan_id,
                m.sehir,
                e.baslangic_tarihi,
                e.bitis_tarihi,
                e.kontenjan,
                e.durum
            FROM etkinlikler e
            INNER JOIN kategoriler k ON e.kategori_id = k.kategori_id
            INNER JOIN mekanlar m ON e.mekan_id = m.mekan_id
            ORDER BY e.baslangic_tarihi DESC
        `);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Etkinlikler listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlikler alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/etkinlikler/:id - Tek etkinlik getir
router.get('/:id', loginRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM etkinlikler WHERE etkinlik_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Etkinlik bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Etkinlik getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlik alınırken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/etkinlikler - Yeni etkinlik ekle
router.post('/', adminRequired, async (req, res) => {
    try {
        const {
            etkinlik_adi,
            aciklama,
            baslangic_tarihi,
            bitis_tarihi,
            kontenjan,
            kategori_id,
            mekan_id,
            durum
        } = req.body;

        const olusturan_kullanici_id = (req.user && req.user.id) || (req.session && req.session.kullanici_id) || 1;

        console.log('DEBUG INSERT:', {
            olusturan_kullanici_id,
            req_user: req.user,
            type: typeof olusturan_kullanici_id
        });

        const [result] = await pool.query(`
            INSERT INTO etkinlikler 
            (etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan, 
             kategori_id, mekan_id, olusturan_kullanici_id, durum) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan,
            kategori_id, mekan_id, olusturan_kullanici_id, durum]);

        res.status(201).json({
            success: true,
            message: 'Etkinlik başarıyla eklendi!',
            etkinlik_id: result.insertId
        });
    } catch (error) {
        console.error('SERVER ERROR LOG:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('SQL State:', error.sqlState);
        console.error('SQL Message:', error.sqlMessage);

        console.error('Etkinlik ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlik eklenirken hata oluştu!',
            error: error.message,
            sqlMessage: error.sqlMessage,
            code: error.code
        });
    }
});

// PUT /api/etkinlikler/:id - Etkinlik güncelle
router.put('/:id', adminRequired, async (req, res) => {
    try {
        const {
            etkinlik_adi,
            aciklama,
            baslangic_tarihi,
            bitis_tarihi,
            kontenjan,
            kategori_id,
            mekan_id,
            durum
        } = req.body;

        const [result] = await pool.query(`
            UPDATE etkinlikler 
            SET etkinlik_adi=?, aciklama=?, baslangic_tarihi=?, bitis_tarihi=?,
                kontenjan=?, kategori_id=?, mekan_id=?, durum=? 
            WHERE etkinlik_id=?
        `, [etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan,
            kategori_id, mekan_id, durum, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Etkinlik bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Etkinlik başarıyla güncellendi!'
        });
    } catch (error) {
        console.error('Etkinlik güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlik güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/etkinlikler/:id - Etkinlik sil
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM etkinlikler WHERE etkinlik_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Etkinlik bulunamadı!'
            });
        }

        res.json({
            success: true,
            message: 'Etkinlik başarıyla silindi!'
        });
    } catch (error) {
        console.error('Etkinlik silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Etkinlik silinirken hata oluştu!',
            error: error.message
        });
    }
});

// POST /api/etkinlikler/:id/katil - Etkinliğe katıl
router.post('/:id/katil', loginRequired, async (req, res) => {
    const connection = await pool.getConnection(); // Transaction için connection al
    try {
        await connection.beginTransaction();

        const etkinlikId = req.params.id;
        const userId = req.user.id; // Token'dan gelen user ID

        // 1. Kullanıcı bilgilerini al
        const [users] = await connection.query(
            'SELECT ad, soyad, email FROM kullanicilar WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            throw new Error('Kullanıcı bulunamadı!');
        }

        const user = users[0];
        let katilimciId;

        // 2. Katılımcı tablosunda bu email var mı?
        const [existingParticipants] = await connection.query(
            'SELECT katilimci_id FROM katilimcilar WHERE email = ?',
            [user.email]
        );

        if (existingParticipants.length > 0) {
            katilimciId = existingParticipants[0].katilimci_id;
        } else {
            // 3. Yoksa ekle (Ad ve Soyad ayrı sütunlar)
            // Not: Kullanıcılar tablosunda telefon olmadığı için buraya boş geçiyoruz veya null
            const [newParticipant] = await connection.query(
                'INSERT INTO katilimcilar (ad, soyad, email, telefon) VALUES (?, ?, ?, ?)',
                [user.ad, user.soyad, user.email, '']
            );
            katilimciId = newParticipant.insertId;
        }

        // 4. Zaten kayıtlı mı?
        const [existingRegistration] = await connection.query(
            'SELECT kayit_id FROM kayitlar WHERE etkinlik_id = ? AND katilimci_id = ?',
            [etkinlikId, katilimciId]
        );

        if (existingRegistration.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Zaten bu etkinliğe katıldınız!'
            });
        }

        // 5. Kayıtlar tablosuna ekle
        await connection.query(
            'INSERT INTO kayitlar (etkinlik_id, katilimci_id, durum, katilim_durumu) VALUES (?, ?, ?, ?)',
            [etkinlikId, katilimciId, 'Onaylandı', 'Katılacak']
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Etkinliğe başarıyla katıldınız!'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Etkinliğe katılma hatası:', error);

        // Sütun hatası kontrolü (Ad/Soyad vs Ad_Soyad karmaşası için ipucu)
        let errorMessage = 'İşlem sırasında bir hata oluştu.';
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Veritabanı sütun uyuşmazlığı (ad/soyad). Lütfen yöneticiye bildirin.';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
