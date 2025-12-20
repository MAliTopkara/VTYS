const { pool } = require('../db');

async function resetTable() {
    try {
        console.log("⚠️  'kullanicilar' tablosu siliniyor (FK kontrolü devre dışı)...");

        // FK kontrolünü kapat
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');

        await pool.query('DROP TABLE IF EXISTS kullanicilar');

        const query = `
            CREATE TABLE kullanicilar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ad VARCHAR(50) NOT NULL,
                soyad VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                sifre VARCHAR(255) NOT NULL,
                rol ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log("🛠️  Yeni 'kullanicilar' tablosu oluşturuluyor...");
        await pool.query(query);

        // FK kontrolünü aç
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("✅ Tablo başarıyla yenilendi (Ad, Soyad, Rol destekli).");
    } catch (error) {
        console.error("❌ Hata:", error);
    } finally {
        process.exit();
    }
}

resetTable();
