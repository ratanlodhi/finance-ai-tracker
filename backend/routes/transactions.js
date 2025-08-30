const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/auth');

router.post('/parse', authenticateToken, transactionController.parseTransaction);
router.post('/', authenticateToken, transactionController.createTransaction);
router.get('/', authenticateToken, transactionController.getTransactions);
router.put('/:id', authenticateToken, transactionController.updateTransaction);
router.delete('/:id', authenticateToken, transactionController.deleteTransaction);

module.exports = router;
