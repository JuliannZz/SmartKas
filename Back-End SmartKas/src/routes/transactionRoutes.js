const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);

module.exports = router;
