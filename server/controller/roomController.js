const Room = require('../model/room');
const Hotel = require('../model/hotel');

const createRoom = async(req, res) => {
    const hotelId = req.params.hotelId;
    try {
        const room = new Room(req.body);
        const savedRoom = await room.save();

        await Hotel.findByIdAndUpdate(hotelId, {
            $push: { rooms: savedRoom._id }
        });

        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRoomsByHotel = async(req, res) => {
    try {
        const rooms = await Room.find({ _id: { $in: req.hotel.rooms } });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createRoom, getRoomsByHotel };