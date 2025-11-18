// controllers/adminController.js
const User = require('../model/user');
const Room = require('../model/room');
const Hotel = require('../model/hotel')
const Transaction = require('../model/transaction');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_admin_secret_2025';


const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const loginAdmin = async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Nhập email và mật khẩu!' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });
        }

        const isMatch = user.matchPassword ? await user.matchPassword(password) : false;
        if (!isMatch) {
            return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Không phải Admin' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name || user.username || 'Admin',
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


const getInfo = async(req, res) => {
    try {
        const [totalUsers, totalOrders, earnings] = await Promise.all([
            User.countDocuments(),
            Transaction.countDocuments(),
            Transaction.aggregate([
                { $match: { status: { $in: ['Checkin', 'Checkout'] } } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ])
        ]);

        const totalEarnings = earnings && earnings.length > 0 ? earnings[0].total : 0;

        res.json({
            users: totalUsers,
            orders: totalOrders,
            earnings: `$${totalEarnings}`,
            balance: `$${totalEarnings}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi InfoBoard' });
    }
};


const getLatestTransactions = async(req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('user', 'username')
            .populate('hotel', 'name')
            .lean();

        const result = transactions.map(t => {

            const userName = t.user && t.user.username ? t.user.username : 'Unknown';
            const hotelName = t.hotel && t.hotel.name ? t.hotel.name : 'Unknown Hotel';
            const roomNumbers = Array.isArray(t.room) ?
                t.room.join(', ') :
                (t.room ? '—' : '—');

            return {
                _id: t._id,
                user: userName,
                hotel: hotelName,
                room: roomNumbers,
                date: `${formatDate(t.dateStart)} - ${formatDate(t.dateEnd)}`,
                price: `$${t.price || 0}`,
                payment: t.payment || 'Credit Card',
                status: t.status || 'Booked'
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi lấy giao dịch' });
    }
};
const createHotel = async(req, res) => {
    try {
        const hotel = new Hotel(req.body);
        const savedHotel = await hotel.save();
        res.status(201).json(savedHotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteHotel = async(req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
        }
        res.json({ message: 'Xóa khách sạn thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllRooms = async(req, res) => {
    try {
        const rooms = await Room.find()
            .select('_id title')
            .sort({ title: 1 });

        res.json(rooms);
    } catch (error) {
        console.error('Lỗi lấy danh sách phòng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phòng' });
    }
};
const getRoomDetails = async(req, res) => {
    try {
        const rooms = await Room.find()
            .select('_id title price maxPeople desc roomNumbers hotel');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
const createRoom = async(req, res) => {
    try {
        const { title, price, maxPeople, desc, hotel, roomNumbers } = req.body;

        if (!hotel) return res.status(400).json({ message: 'Chọn khách sạn' });

        const room = new Room({
            title,
            price,
            maxPeople,
            desc,
            hotel,
            roomNumbers
        });

        const savedRoom = await room.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteRoom = async(req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        }
        res.json({ message: 'Xóa phòng thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllTransactions = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const [total, transactions] = await Promise.all([
            Transaction.countDocuments(),
            Transaction.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .populate('hotel', 'name')
            .populate('room', 'roomNumbers')
            .lean()
        ]);

        const formatted = transactions.map(t => ({
            _id: t._id,
            user: t.user,
            hotel: t.hotel,
            room: t.room,
            dateStart: t.dateStart,
            dateEnd: t.dateEnd,
            price: t.price,
            payment: t.payment,
            status: t.status
        }));

        res.json({
            transactions: formatted,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi lấy giao dịch' });
    }
};
const updateHotel = async(req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true, runValidators: true }
        );
        if (!hotel) return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
        res.json(hotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRoom = async(req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true, runValidators: true }
        );
        if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
        res.json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getHotelById = async(req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getRoomById = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getAllUsers = async(req, res) => {
    try {
        const users = await User.find()
            .select('fullName email username phoneNumber isAdmin createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const result = users.map(user => ({
            _id: user._id,
            fullName: user.fullName || 'Chưa đặt tên',
            email: user.email,
            username: user.username || '—',
            phoneNumber: user.phoneNumber || '—',
            role: user.isAdmin ? 'Admin' : 'Người dùng',
            createdAt: formatDate(user.createdAt)
        }));

        res.json(result);
    } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
    }
};

module.exports = {
    loginAdmin,
    createHotel,
    deleteHotel,
    getInfo,
    getLatestTransactions,
    getAllRooms,
    getRoomDetails,
    createRoom,
    deleteRoom,
    getAllTransactions,
    updateHotel,
    updateRoom,
    getHotelById,
    getRoomById,
    getAllUsers
};