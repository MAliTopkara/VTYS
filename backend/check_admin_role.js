const { pool } = require('./db');

async function checkRole() {
    try {
        const [rows] = await pool.query("SELECT email, rol FROM kullanicilar WHERE email = 'mehmetalitopkara080@gmail.com'");
        console.log("User Info:", rows);
    } catch (err) {
        console.error("Error checking role:", err);
    } finally {
        process.exit();
    }
}

checkRole();
