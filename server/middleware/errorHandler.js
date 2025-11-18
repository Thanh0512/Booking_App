const errorHandler = (err, req, res, next) => {
    // Xác định status code
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose: CastError (ObjectId sai)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Không tìm thấy tài nguyên';
    }

    // Mongoose: ValidationError
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(val => val.message)
            .join(', ');
    }

    // Mongoose: Duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} đã tồn tại`;
    }

    // JWT: Token hết hạn
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Phiên đăng nhập hết hạn';
    }

    // JWT: Token sai
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token không hợp lệ';
    }

    // Gửi phản hồi
    res.status(statusCode).json({
        success: false,
        message,
        // Chỉ hiện stack trace khi dev
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;