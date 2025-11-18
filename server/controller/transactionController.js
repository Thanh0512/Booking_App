const Transaction = require('../model/transaction');
const Room = require('../model/room');

const createTransaction = async(req, res) => {
    console.log("Request tới /api/transactions");
    console.log("req.user:", req.user);

    // Lấy username an toàn (không dùng ?.)
    let user = null;
    if (req.user && req.user.username) {
        user = req.user.username;
    } else if (req.user && req.user.name) {
        user = req.user.name;
    }

    if (!user) {
        return res.status(401).json({ message: "Chưa đăng nhập." });
    }

    // Lấy body
    const { hotel, room: roomNumbersSelectedRaw, dateStart, dateEnd, price, payment } = req.body;

    if (!hotel || !roomNumbersSelectedRaw || !dateStart || !dateEnd || !payment) {
        return res.status(400).json({ message: "Thiếu tham số bắt buộc." });
    }

    // CHUẨN HÓA PAYMENT (không phân biệt hoa thường)
    let normalizedPayment = payment.trim();
    const lower = normalizedPayment.toLowerCase();
    if (lower.includes('paypal')) normalizedPayment = 'Paypal';
    else if (lower.includes('cash')) normalizedPayment = 'Cash';
    else if (lower.includes('credit')) normalizedPayment = 'Credit Card';
    else {
        return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    // Chuẩn hóa room numbers
    const roomNumbersSelected = Array.isArray(roomNumbersSelectedRaw) ?
        roomNumbersSelectedRaw.map(r => r.toString()) :
        [roomNumbersSelectedRaw.toString()];

    const roomTypeIds = [];

    try {
        // Tìm phòng
        const allRooms = await Room.find({
            'roomNumbers.number': { $in: roomNumbersSelected }
        });

        if (allRooms.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy phòng." });
        }

        // Kiểm tra trùng ngày
        for (let roomType of allRooms) {
            const selected = roomType.roomNumbers.filter(rn =>
                roomNumbersSelected.includes(rn.number.toString())
            );

            for (let numData of selected) {
                const unavailable = Array.isArray(numData.unavailableDates) ? numData.unavailableDates : [];
                const booked = unavailable.some(d => {
                    const check = new Date(d).getTime();
                    const start = new Date(dateStart).getTime();
                    const end = new Date(dateEnd).getTime();
                    return !isNaN(check) && !isNaN(start) && !isNaN(end) && check >= start && check <= end;
                });

                if (booked) {
                    return res.status(400).json({ message: `Phòng ${numData.number} đã được đặt.` });
                }

                if (roomTypeIds.indexOf(roomType._id.toString()) === -1) {
                    roomTypeIds.push(roomType._id);
                }
            }
        }

        // Tạo giao dịch
        const transaction = await Transaction.create({
            user,
            hotel,
            room: roomNumbersSelected,
            dateStart: new Date(dateStart),
            dateEnd: new Date(dateEnd),
            price,
            payment: normalizedPayment,
            status: 'Booked'
        });

        // Tạo danh sách ngày
        const dates = [];
        let cur = new Date(dateStart);
        const endDate = new Date(dateEnd);
        while (cur <= endDate) {
            dates.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
        }

        // Cập nhật phòng
        await Room.updateMany({ _id: { $in: roomTypeIds } }, { $push: { "roomNumbers.$[elem].unavailableDates": { $each: dates } } }, { arrayFilters: [{ "elem.number": { $in: roomNumbersSelected } }] });

        res.status(201).json(transaction);
    } catch (error) {
        console.error("LỖI CREATE:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

// GET MY TRANSACTIONS – KHÔNG DÙNG ?.
const getMyTransactions = async(req, res) => {
    try {
        // Lấy username an toàn
        let username = null;
        if (req.user && req.user.username) {
            username = req.user.username;
        }
        if (!username) {
            return res.status(401).json({ message: "Chưa đăng nhập." });
        }

        // Lấy dữ liệu + .lean()
        const transactions = await Transaction.find({ user: username })
            .populate('hotel', 'name')
            .lean()
            .sort({ createdAt: -1 });

        // Format thủ công (không dùng ?.)
        const formatted = transactions.map(t => {
            const hotelName = (t.hotel && t.hotel.name) ? t.hotel.name : 'Không rõ';
            const rooms = (Array.isArray(t.room)) ? t.room.join(', ') : (t.room || '—');
            const price = t.price || 0;
            const paymentMethod = t.payment || '—';
            const status = t.status || 'Booked';

            return {
                _id: t._id,
                hotelName,
                rooms,
                dateStart: t.dateStart, // TRẢ VỀ NGUYÊN
                dateEnd: t.dateEnd, // TRẢ VỀ NGUYÊN
                price,
                paymentMethod,
                status
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("LỖI GET:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

module.exports = { createTransaction, getMyTransactions };