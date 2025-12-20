const { pool } = require('./db');
const fs = require('fs');

async function debugRelations() {
    try {
        const [tables] = await pool.query(`
            SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY, EXTRA 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'etkinlik_yonetim' 
            AND TABLE_NAME IN ('kullanicilar', 'katilimcilar', 'kayitlar')
            ORDER BY TABLE_NAME, COLUMN_NAME;
        `);

        fs.writeFileSync('debug_relations_output.txt', JSON.stringify(tables, null, 2));
        console.log('Output written to debug_relations_output.txt');

    } catch (error) {
        console.error('DB Hatası:', error);
    } finally {
        process.exit();
    }
}

debugRelations();
