const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    loginAdmin,
    getInfo,
    getLatestTransactions,
    createHotel,
    deleteHotel,
    updateHotel,
    getHotelById,
    getAllRooms,
    getRoomDetails,
    createRoom,
    deleteRoom,
    getAllTransactions,
    updateRoom,
    getRoomById,
    getAllUsers
} = require('../controller/adminController');

// PUBLIC
router.post('/login', loginAdmin);

// PROTECTED
router.get('/infoboard', protect, admin, getInfo);
router.get('/transactions/latest', protect, admin, getLatestTransactions);

// Users
router.get('/users', protect, admin, getAllUsers);

// HOTELS
router.post('/hotels', protect, admin, createHotel);
router.get('/hotels/:id', protect, admin, getHotelById);

router.put('/hotels/:id', protect, admin, updateHotel);
router.delete('/hotels/:id', protect, admin, deleteHotel);

// ROOMS
router.get('/rooms', protect, admin, getAllRooms);
router.get('/rooms/details', protect, admin, getRoomDetails);
router.get('/rooms/:id', protect, admin, getRoomById);
router.post('/rooms', protect, admin, createRoom);
router.put('/rooms/:id', protect, admin, updateRoom);
router.delete('/rooms/:id', protect, admin, deleteRoom);

// TRANSACTIONS
router.get('/transactions', protect, admin, getAllTransactions);

module.exports = router;