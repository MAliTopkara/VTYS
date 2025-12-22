const { pool } = require('../db');

// Admin İstatistikleri
const getAdminStats = async (req, res) => {
    try {
        // 1. Toplam Katılımcılar
        const [participants] = await pool.query('SELECT COUNT(*) as count FROM katilimcilar');

        // 2. Toplam Etkinlikler
        const [events] = await pool.query('SELECT COUNT(*) as count FROM etkinlikler');

        // 3. Toplam Mekanlar
        const [venues] = await pool.query('SELECT COUNT(*) as count FROM mekanlar');

        // 4. Tarihi geçmiş ama hala 'Aktif' olan etkinlikler (Uyarı için)
        // Not: 'durum' sütunu Enum veya Varchar ise ve 'Aktif' değeri kullanılıyorsa:
        const [expiredActive] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM etkinlikler 
            WHERE bitis_tarihi < NOW() AND durum = 'Aktif'
        `);

        res.json({
            success: true,
            data: {
                totalParticipants: parseInt(participants[0].count),
                totalEvents: events[0].count,
                totalVenues: venues[0].count,
                expiredActiveCount: expiredActive[0].count
            }
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler alınırken hata oluştu.',
            error: error.message
        });
    }
};

// Kullanıcı Dashboard Verileri
const getUserDashboard = async (req, res) => {
    try {
        const userEmail = req.user.email; // Auth middleware'den gelir

        // 1. Kullanıcının Katıldığı Etkinlikler
        // Kullanıcı email'i üzerinden -> katilimcilar tablosu -> kayitlar tablosu -> etkinlikler tablosu
        const joinedEventsQuery = `
            SELECT e.*, k.durum as kayit_durumu, k.kayit_tarihi
            FROM etkinlikler e
            JOIN kayitlar k ON e.etkinlik_id = k.etkinlik_id
            JOIN katilimcilar p ON k.katilimci_id = p.katilimci_id
            WHERE p.email = ?
            ORDER BY e.baslangic_tarihi DESC
        `;
        const [joinedEvents] = await pool.query(joinedEventsQuery, [userEmail]);

        // 2. Yaklaşan Etkinlikler (Genel liste, tarihi geçmemiş)
        const upcomingEventsQuery = `
            SELECT * 
            FROM etkinlikler 
            WHERE baslangic_tarihi > NOW() AND durum = 'Aktif'
            ORDER BY baslangic_tarihi ASC
            LIMIT 5
        `;
        const [upcomingEvents] = await pool.query(upcomingEventsQuery);

        res.json({
            success: true,
            data: {
                joinedEvents,
                upcomingEvents
            }
        });

    } catch (error) {
        console.error('User Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Dashboard verileri alınırken hata oluştu.',
            error: error.message
        });
    }
};

module.exports = {
    getAdminStats,
    getUserDashboard
};
