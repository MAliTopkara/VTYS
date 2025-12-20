const { pool } = require('./db');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Önce var mı kontrol et
        const [existing] = await pool.query('SELECT * FROM kullanicilar WHERE email = ?', ['testuser@gmail.com']);
        if (existing.length > 0) {
            console.log('Test kullanicisi zaten var.');
            return;
        }

        const [result] = await pool.query(`
            INSERT INTO kullanicilar (ad, soyad, email, sifre, rol) 
            VALUES (?, ?, ?, ?, ?)
        `, ['Test', 'User', 'testuser@gmail.com', hashedPassword, 'user']);

        // ID eşitleme fixini burada da uygula
        await pool.query('UPDATE kullanicilar SET kullanici_id = id WHERE id = ?', [result.insertId]);

        console.log('Test kullanicisi olusturuldu: testuser@gmail.com / 123456');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        process.exit();
    }
}

createTestUser();
