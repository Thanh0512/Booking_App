const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, getUsersList } = require('../controller/userController');
const { protect } = require('../middleware/auth')
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.get('/', getUsersList)
module.exports = router;