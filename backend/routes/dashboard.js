const express = require('express');
const router = express.Router();
const { getAdminStats, getUserDashboard } = require('../controllers/dashboardController');
const { loginRequired, adminRequired } = require('../middleware/auth');

// GET /api/dashboard/admin-stats
// Sadece Admin erişebilir
router.get('/admin-stats', adminRequired, getAdminStats);

// GET /api/dashboard/user-home
// Giriş yapmış herhangi bir kullanıcı erişebilir
router.get('/user-home', loginRequired, getUserDashboard);

module.exports = router;
