const mysql = require('mysql2/promise');
require('dotenv').config();

// Veritabanı bağlantı havuzu (connection pool) oluştur
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Bağlantıyı test eden fonksiyon
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Veritabanı bağlantısı başarılı!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Veritabanı bağlantı hatası:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
