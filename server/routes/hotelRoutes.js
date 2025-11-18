const express = require('express');
const router = express.Router();
const { getHotels, countByCity, countByType, getTopRated, searchHotels, getHotelById, checkRoomAvailability } = require('../controller/hotelController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getHotels);

router.get('/countByCity', countByCity);

router.get('/countByType', countByType);

router.get('/topRated', getTopRated);

router.get('/search', searchHotels)

router.get('/:id', getHotelById);

router.get("/room/checkAvailable", checkRoomAvailability);


module.exports = router;