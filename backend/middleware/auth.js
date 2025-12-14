// Session tabanlı kimlik doğrulama middleware'leri

// Login kontrolü - oturum açmış mı?
const loginRequired = (req, res, next) => {
    if (!req.session || !req.session.kullanici_id) {
        return res.status(401).json({
            success: false,
            message: 'Bu işlem için giriş yapmalısınız!'
        });
    }
    next();
};

// Admin kontrolü - admin yetkisi var mı?
const adminRequired = (req, res, next) => {
    if (!req.session || !req.session.kullanici_id) {
        return res.status(401).json({
            success: false,
            message: 'Bu işlem için giriş yapmalısınız!'
        });
    }
    if (req.session.rol !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için yetkiniz yok!'
        });
    }
    next();
};

module.exports = { loginRequired, adminRequired };
