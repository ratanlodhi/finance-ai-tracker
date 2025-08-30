const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/verify', authController.verifyToken);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

module.exports = router;
