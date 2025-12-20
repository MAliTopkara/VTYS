const jwt = require('jsonwebtoken');

// Token doğrulama ve kullanıcı bilgisini request'e ekleme
const verifyToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar_123');
            req.user = decoded; // req.user'a ekle (session yerine)
            return true;
        } catch (err) {
            return false;
        }
    }
    // Geriye dönük uyumluluk (Session)
    if (req.session && req.session.kullanici_id) {
        req.user = {
            id: req.session.kullanici_id,
            rol: req.session.rol
        };
        return true;
    }
    return false;
};

// Login kontrolü
const loginRequired = (req, res, next) => {
    if (!verifyToken(req)) {
        return res.status(401).json({
            success: false,
            message: 'Bu işlem için giriş yapmalısınız!'
        });
    }
    next();
};

// Admin kontrolü
const adminRequired = (req, res, next) => {
    // Önce giriş yapmış mı bak
    if (!verifyToken(req)) {
        return res.status(401).json({
            success: false,
            message: 'Bu işlem için giriş yapmalısınız!'
        });
    }

    // Rol kontrolü (Büyük/küçük harf duyarsız)
    const userRole = req.user.rol ? req.user.rol.toLowerCase() : '';
    if (userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için yetkiniz yok!'
        });
    }
    next();
};

module.exports = { loginRequired, adminRequired };
