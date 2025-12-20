const { pool } = require('./db');
const bcrypt = require('bcrypt');

async function fixUser() {
    try {
        const email = 'mehmetalitopkara080@gmail.com';
        const newPassword = '123456';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Şifreyi ve rolü güncelle
        const [result] = await pool.query(
            "UPDATE kullanicilar SET sifre = ?, rol = 'admin' WHERE email = ?",
            [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
            console.log(`✅ Kullanıcı güncellendi: ${email}`);
            console.log(`   Yeni Şifre: ${newPassword}`);
            console.log(`   Rol: admin`);
        } else {
            console.log(`⚠️ Kullanıcı bulunamadı: ${email}`);
        }

        // Doğrulama
        const [users] = await pool.query("SELECT id, email, ad, soyad, rol FROM kullanicilar WHERE email = ?", [email]);
        console.log("\n=== Güncel Kullanıcı Bilgisi ===");
        console.log(users[0]);

    } catch (err) {
        console.error("Hata:", err);
    } finally {
        process.exit();
    }
}

fixUser();
