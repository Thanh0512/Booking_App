const Hotel = require('../model/hotel');

const removeVietnameseTones = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

const getHotels = async(req, res) => {
    try {
        const { city, type, min, max } = req.query;
        let query = {};

        if (city) query.city = new RegExp(city, 'i');
        if (type) query.type = type;
        if (min || max) {
            query.price = {};
            if (min) query.price.$gte = Number(min);
            if (max) query.price.$lte = Number(max);
        }

        const hotels = await Hotel.find(query).populate('rooms');
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const countByCity = async(req, res, next) => {
    const citiesToQuery = ["Ha Noi", "Ho Chi Minh", "Da Nang"];
    const citiesToReturn = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"];
    try {
        const counts = await Promise.all(
            citiesToQuery.map(city => Hotel.countDocuments({ city: city }))
        );
        const result = citiesToReturn.map((city, index) => ({
            city: city,
            count: counts[index]
        }));
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

const countByType = async(req, res, next) => {
    try {
        const counts = await Hotel.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $project: { _id: 0, type: "$_id", count: 1 } }
        ]);
        res.status(200).json(counts);
    } catch (err) {
        next(err);
    }
};

const getTopRated = async(req, res, next) => {
    try {
        const topHotels = await Hotel.find({})
            .sort({ rating: -1 })
            .limit(3)
            .select('name city photos rating cheapestPrice desc');
        res.status(200).json(topHotels);
    } catch (err) {
        next(err);
    }
};

const searchHotels = async(req, res, next) => {
    const { city, startDate, endDate, rooms = 1, adults = 1, children = 0 } = req.query;

    try {

        if (!city || !startDate || !endDate) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc: thành phố, ngày bắt đầu/kết thúc."
            });
        }

        const requestedRooms = parseInt(rooms, 10);
        const totalPeople = parseInt(adults, 10) + parseInt(children, 10);

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return res.status(400).json({ message: "Ngày không hợp lệ" });
        }

        const normalizedInput = removeVietnameseTones(city).trim();
        const regex = new RegExp(normalizedInput, 'i');


        const hotels = await Hotel.find().populate('rooms');
        const availableHotels = [];

        for (const hotel of hotels) {
            const hotelCity = removeVietnameseTones(hotel.city || "").trim();
            if (!regex.test(hotelCity)) continue;

            const availableRoomTypes = [];


            for (const roomType of hotel.rooms || []) {
                if (!roomType || !Array.isArray(roomType.roomNumbers)) continue;

                const availableCount = roomType.roomNumbers.filter(roomNum => {
                    if (!roomNum || !Array.isArray(roomNum.unavailableDates)) return true;
                    return !roomNum.unavailableDates.some(dateStr => {
                        const bookedDate = new Date(dateStr);
                        return bookedDate >= start && bookedDate <= end;
                    });
                }).length;

                if (availableCount > 0) {
                    availableRoomTypes.push({
                        maxPeople: roomType.maxPeople,
                        availableCount,
                    });
                }
            }


            let totalAvailableRooms = availableRoomTypes.reduce((sum, r) => sum + r.availableCount, 0);
            let totalCapacity = availableRoomTypes.reduce((sum, r) => sum + (r.maxPeople * r.availableCount), 0);

            let isSuitable = false;

            if (requestedRooms === 1) {

                isSuitable = availableRoomTypes.some(rt => rt.maxPeople >= totalPeople);
            } else {

                const allCapacities = [];
                availableRoomTypes.forEach(rt => {
                    for (let i = 0; i < rt.availableCount; i++) {
                        allCapacities.push(rt.maxPeople);
                    }
                });
                allCapacities.sort((a, b) => b - a);
                const chosen = allCapacities.slice(0, requestedRooms);
                const totalChosenCapacity = chosen.reduce((a, b) => a + b, 0);

                isSuitable = (chosen.length === requestedRooms) && (totalChosenCapacity >= totalPeople);
            }

            if (isSuitable) {
                availableHotels.push({
                    ...hotel.toObject(),
                    availabilityInfo: {
                        totalAvailableRooms,
                        totalCapacity,
                        requestedRooms,
                        totalPeople
                    }
                });
            }
        }

        res.json({
            query: { city, startDate, endDate, adults, children, rooms: requestedRooms, totalPeople },
            total: availableHotels.length,
            results: availableHotels
        });

    } catch (err) {
        console.error("Lỗi searchHotels:", err);
        next(err);
    }
};

const getHotelById = async(req, res, next) => {
    const hotelId = req.params.id;

    try {
        const hotel = await Hotel.findById(hotelId).populate('rooms');
        if (!hotel) {
            return res.status(404).json({ message: "Không tìm thấy khách sạn." });
        }
        res.status(200).json(hotel);
    } catch (err) {
        next(err);
    }
};
const checkRoomAvailability = async(req, res, next) => {
    const { hotelId, startDate, endDate } = req.query;

    try {

        if (!hotelId || !startDate || !endDate) {
            return res.status(400).json({ message: "Thiếu hotelId, startDate hoặc endDate" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end) || start >= end) {
            return res.status(400).json({ message: "Ngày không hợp lệ" });
        }

        // --- LẤY HOTEL + POPULATE ROOMS ---
        const hotel = await Hotel.findById(hotelId).populate('rooms');
        if (!hotel) {
            return res.status(404).json({ message: "Không tìm thấy khách sạn" });
        }

        const availableRoomTypes = [];

        // --- DUYỆT TỪNG LOẠI PHÒNG ---
        for (const roomType of hotel.rooms || []) {
            if (!roomType || !Array.isArray(roomType.roomNumbers)) continue;

            const availableRooms = roomType.roomNumbers.filter(roomNum => {
                if (!roomNum || !Array.isArray(roomNum.unavailableDates)) return true;

                return !roomNum.unavailableDates.some(dateStr => {
                    const bookedDate = new Date(dateStr);
                    // Phòng bị đặt nếu có ngày nào nằm trong [start, end)
                    return bookedDate >= start && bookedDate < end;
                });
            });

            if (availableRooms.length > 0) {
                availableRoomTypes.push({
                    _id: roomType._id,
                    title: roomType.title,
                    desc: roomType.desc,
                    price: roomType.price,
                    maxPeople: roomType.maxPeople,
                    roomNumbers: availableRooms.map(r => ({
                        number: r.number
                    }))
                });
            }
        }

        res.status(200).json(availableRoomTypes);

    } catch (err) {
        console.error("Lỗi checkRoomAvailability:", err);
        next(err);
    }
};


module.exports = {
    getHotels,
    countByCity,
    countByType,
    getTopRated,
    searchHotels,
    getHotelById,
    checkRoomAvailability
};