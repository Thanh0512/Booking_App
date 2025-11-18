const express = require('express');
const router = express.Router();
const { createTransaction, getMyTransactions } = require('../controller/transactionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTransaction);
console.log(typeof createTransaction)
router.get('/me', protect, getMyTransactions);

module.exports = router;