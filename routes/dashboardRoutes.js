const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Dashboard routes require authentication
router.use(protect);

// Analyst, Admin: read + analytics
router.get('/summary', authorize('Analyst', 'Admin'), getDashboardSummary);

module.exports = router;
