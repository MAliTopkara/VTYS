const { pool } = require('./db');
const bcrypt = require('bcrypt');

async function resetPassword() {
    try {
        // Önce tüm kullanıcıları listele
        const [users] = await pool.query("SELECT id, email, ad, soyad, rol FROM kullanicilar");
        console.log("=== Kayıtlı Kullanıcılar ===");
        console.log(users);

        // Şifreyi sıfırla (yeni şifre: 123456)
        const email = 'mehmetalitopkara080@gmail.com';
        const newPassword = '123456';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await pool.query(
            "UPDATE kullanicilar SET sifre = ? WHERE email = ?",
            [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
            console.log(`\n✅ Şifre sıfırlandı: ${email}`);
            console.log(`   Yeni Şifre: ${newPassword}`);
        } else {
            console.log(`\n⚠️ Kullanıcı bulunamadı: ${email}`);
        }

    } catch (err) {
        console.error("Hata:", err);
    } finally {
        process.exit();
    }
}

resetPassword();
