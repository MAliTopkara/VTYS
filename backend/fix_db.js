const { pool } = require('./db');

async function fixDB() {
    try {
        console.log('--- DB FIX BASLIYOR ---');

        // kullanici_id'si NULL olanlarda id değerini kullanici_id'ye kopyala
        const [result] = await pool.query('UPDATE kullanicilar SET kullanici_id = id WHERE kullanici_id IS NULL');
        console.log('Guncellenen satir sayisi:', result.affectedRows);

        // Kontrol et
        const [users] = await pool.query('SELECT * FROM kullanicilar');
        console.log('Guncel Kullanicilar:', JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('DB Hatası:', error);
    } finally {
        process.exit();
    }
}

fixDB();
