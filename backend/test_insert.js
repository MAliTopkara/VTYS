const { pool } = require('./db');

async function testInsert() {
    try {
        console.log('Test INSERT basliyor (Dynamik ID)...');

        // 1. Kullaniciyi dinamik al
        const [users] = await pool.query('SELECT kullanici_id FROM kullanicilar LIMIT 1');
        if (users.length === 0) {
            console.error('HATA: Hic kullanici yok!');
            return;
        }
        const userId = users[0].kullanici_id;
        console.log('Kullanici ID:', userId, 'Type:', typeof userId);

        // 2. Kategori dinamik al
        const [cats] = await pool.query('SELECT kategori_id FROM kategoriler LIMIT 1');
        if (cats.length === 0) { console.error('HATA: Kategori yok'); return; }
        const catId = cats[0].kategori_id;
        console.log('Kategori ID:', catId);

        // 3. Mekan dinamik al
        const [venues] = await pool.query('SELECT mekan_id FROM mekanlar LIMIT 1');
        if (venues.length === 0) { console.error('HATA: Mekan yok'); return; }
        const venueId = venues[0].mekan_id;
        console.log('Mekan ID:', venueId);

        // 4. Insert Dene
        console.log(`Insert deneniyor... User=${userId}, Cat=${catId}, Venue=${venueId}`);

        const [result] = await pool.query(`
            INSERT INTO etkinlikler 
            (etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan, 
             kategori_id, mekan_id, olusturan_kullanici_id, durum) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, ['Dynamik Test', 'Test Aciklama', '2025-10-10 10:00:00', '2025-10-10 12:00:00', 100,
            catId, venueId, userId, 'Planlanıyor']);

        console.log('BASARILI! Insert ID:', result.insertId);

    } catch (error) {
        console.error('INSERT HATASI:', error.code, error.sqlMessage);
        console.error('Full Error:', error);
    } finally {
        process.exit();
    }
}

testInsert();
