const express = require('express');
const router = express.Router({ mergeParams: true });
const { createRoom, getRoomsByHotel } = require('../controller/roomController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, createRoom);

router.get('/', getRoomsByHotel);

module.exports = router;