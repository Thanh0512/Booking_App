// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../model/user');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_admin_secret_2025';

const protect = async(req, res, next) => {
    let token;


    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('TOKEN RECEIVED:', token);

            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('DECODED:', decoded);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) throw new Error('User not found');

            next();
        } catch (err) {
            console.error('TOKEN ERROR:', err.message);
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền Admin' });
    }
};

module.exports = { protect, admin };