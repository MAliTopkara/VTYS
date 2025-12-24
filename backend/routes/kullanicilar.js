const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/kullanicilar - Tüm kullanıcıları listele (SADECE ADMIN)
router.get('/', adminRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                ad,
                soyad,
                email,
                rol,
                created_at
            FROM kullanicilar
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Kullanıcılar listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar alınırken hata oluştu!',
            error: error.message
        });
    }
});

// GET /api/kullanicilar/:id - Tek kullanıcı getir (SADECE ADMIN)
router.get('/:id', adminRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, ad, soyad, email, rol, created_at FROM kullanicilar WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı!'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Kullanıcı getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı alınırken hata oluştu!',
            error: error.message
        });
    }
});

// PUT /api/kullanicilar/:id/rol - Kullanıcı rolünü değiştir (SADECE ADMIN)
router.put('/:id/rol', adminRequired, async (req, res) => {
    try {
        const { rol } = req.body;

        // Validasyon
        if (!rol || !['admin', 'user'].includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir rol seçiniz! (admin veya user)'
            });
        }

        // Kullanıcı var mı kontrol et
        const [checkUser] = await pool.query(
            'SELECT id, email FROM kullanicilar WHERE id = ?',
            [req.params.id]
        );

        if (checkUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı!'
            });
        }

        // Kendi rolünü değiştirmeye çalışıyor mu?
        if (req.user && req.user.id === parseInt(req.params.id)) {
            return res.status(403).json({
                success: false,
                message: 'Kendi rolünüzü değiştiremezsiniz!'
            });
        }

        // Rol güncelle
        const [result] = await pool.query(
            'UPDATE kullanicilar SET rol = ? WHERE id = ?',
            [rol, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı güncellenemedi!'
            });
        }

        res.json({
            success: true,
            message: `Kullanıcı rolü "${rol}" olarak güncellendi!`
        });
    } catch (error) {
        console.error('Rol güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Rol güncellenirken hata oluştu!',
            error: error.message
        });
    }
});

// DELETE /api/kullanicilar/:id - Kullanıcı sil (SADECE ADMIN)
router.delete('/:id', adminRequired, async (req, res) => {
    try {
        // Önce kullanıcı bilgilerini kontrol et
        const [checkUser] = await pool.query(
            'SELECT id, email, kullanici_id FROM kullanicilar WHERE id = ?',
            [req.params.id]
        );

        if (checkUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı!'
            });
        }

        const userToDelete = checkUser[0];

        // Kendi kendini silmeye çalışıyor mu?
        const currentUserId = req.user?.id;
        if (currentUserId && currentUserId === parseInt(req.params.id)) {
            return res.status(403).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz!'
            });
        }

        // Bu kullanıcının oluşturduğu etkinlik var mı kontrol et
        const [etkinlikCheck] = await pool.query(
            'SELECT COUNT(*) as count FROM etkinlikler WHERE olusturan_kullanici_id = ?',
            [userToDelete.kullanici_id]
        );

        if (etkinlikCheck[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Bu kullanıcı ${etkinlikCheck[0].count} adet etkinlik oluşturmuş. Önce bu etkinlikleri silmelisiniz veya başka bir kullanıcıya atamalısınız.`
            });
        }

        // Kullanıcıyı sil
        const [result] = await pool.query(
            'DELETE FROM kullanicilar WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'Kullanıcı silinemedi!'
            });
        }

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi!'
        });
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        console.error('Hata detayı:', error.sqlMessage || error.message);

        // Foreign key hatası durumunda kullanıcıya anlamlı mesaj ver
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: 'Bu kullanıcı sistemde başka kayıtlarla ilişkili olduğu için silinemez. Önce ilgili kayıtları silmelisiniz.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinirken hata oluştu!',
            error: error.sqlMessage || error.message
        });
    }
});

module.exports = router;
