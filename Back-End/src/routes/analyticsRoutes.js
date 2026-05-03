const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/report', analyticsController.getReport);
router.get('/monthly', analyticsController.getMonthlyReport);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/export/pdf', analyticsController.exportPdf);
router.get('/export/excel', analyticsController.exportExcel);

module.exports = router;
