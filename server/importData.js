const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Hotel = require("./model/hotel.js");
const Room = require("./model/room.js");
const hotels = require("./data/hotels.json");
const rooms = require("./data/rooms.json");

dotenv.config();
const importData = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Đã kết nối MongoDB");

        await Hotel.deleteMany();
        await Room.deleteMany();

        await Hotel.insertMany(hotels);
        await Room.insertMany(rooms);

        console.log("🎉 Đã import dữ liệu thành công!");
        process.exit();
    } catch (err) {
        console.error("❌ Lỗi import:", err);
        process.exit(1);
    }
};

importData();