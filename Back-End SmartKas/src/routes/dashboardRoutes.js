const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/stats', dashboardController.getStats);
router.get('/stock-stats', dashboardController.getStockStats);
router.get('/sales-chart', dashboardController.getSalesChart);
router.get('/profit-chart', dashboardController.getProfitChart);
router.get('/recent-transactions', dashboardController.getRecentTransactions);

module.exports = router;
