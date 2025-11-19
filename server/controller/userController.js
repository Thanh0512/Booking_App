// controllers/userController.js
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === ĐĂNG KÝ ===
const registerUser = async(req, res) => {
    const email = req.body.email.toLowerCase();
    const { password } = req.body;

    try {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới (username sẽ tự sinh từ email trong model)
        const user = await User.create({
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng đăng nhập.',
            redirect: '/login',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// === ĐĂNG NHẬP ===
const loginUser = async(req, res) => {
     console.log("Received login request body:", req.body); 
     const email = req.body.email.toLowerCase();
    const { password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");
        console.log("Found user:", user);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
            });
        }


        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            redirect: '/',
        });
    } catch (error) {

        console.error("LOGIN ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// === ĐĂNG XUẤT ===
const logoutUser = (req, res) => {
    res.json({ success: true, message: 'Đăng xuất thành công' });
};
const getMe = async(req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
const getUsersList = async(req, res) => {
    try {

        const users = await User.find({}).select('-password');

        res.status(200).json(users);

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách Users.' });
    }
};
module.exports = { registerUser, loginUser, logoutUser, getMe, getUsersList };
