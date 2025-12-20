const { pool } = require('./db');

async function debugDB() {
    try {
        console.log('--- KULLANICILAR ---');
        const [users] = await pool.query('SELECT kullanici_id, email, rol FROM kullanicilar');
        console.log(JSON.stringify(users, null, 2));

        console.log('--- KATEGORILER ---');
        const [cats] = await pool.query('SELECT kategori_id, kategori_adi FROM kategoriler');
        console.log(JSON.stringify(cats, null, 2));

        console.log('--- MEKANLAR ---');
        const [venues] = await pool.query('SELECT mekan_id, mekan_adi FROM mekanlar');
        console.log(JSON.stringify(venues, null, 2));

    } catch (error) {
        console.error('DB Hatası:', error);
    } finally {
        process.exit();
    }
}

debugDB();
