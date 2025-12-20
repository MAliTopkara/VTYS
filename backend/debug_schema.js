const { pool } = require('./db');

async function debugSchema() {
    try {
        console.log('--- TABLES ---');
        const [tables] = await pool.query(`
            SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'etkinlik_yonetim' AND TABLE_NAME IN ('etkinlikler', 'kullanicilar')
            ORDER BY TABLE_NAME, COLUMN_NAME;
        `);
        console.log(JSON.stringify(tables, null, 2));

    } catch (error) {
        console.error('DB Hatası:', error);
    } finally {
        process.exit();
    }
}

debugSchema();
