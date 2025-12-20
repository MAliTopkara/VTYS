const { pool } = require('./db');

async function updateRole() {
    try {
        console.log("Updating user role...");
        const [result] = await pool.query("UPDATE kullanicilar SET rol = 'admin' WHERE email = 'mehmetalitopkara080@gmail.com'");
        console.log("Update Result:", result);
        if (result.affectedRows > 0) {
            console.log("✅ Successfully updated role to admin for mehmetalitopkara080@gmail.com");
        } else {
            console.log("⚠️ User not found or role didn't change (maybe already admin).");
        }
    } catch (err) {
        console.error("❌ Error updating role:", err);
    } finally {
        process.exit();
    }
}

updateRole();
