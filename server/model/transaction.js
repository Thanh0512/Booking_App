const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    user: {
        type: String,
        required: [true, 'Username người đặt là bắt buộc'],
        trim: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: [true, 'Khách sạn là bắt buộc']
    },
    room: [{
        type: String,
        required: [true, 'Phòng là bắt buộc']
    }],
    dateStart: {
        type: Date,
        required: [true, 'Ngày nhận phòng là bắt buộc']
    },
    dateEnd: {
        type: Date,
        required: [true, 'Ngày trả phòng là bắt buộc']
    },
    price: {
        type: Number,
        required: [true, 'Chi phí là bắt buộc'],
        min: [0, 'Chi phí không được âm']
    },
    payment: {
        type: String,
        required: [true, 'Hình thức thanh toán là bắt buộc'],
        enum: {
            values: ['Credit Card', 'Paypal', 'Cash'],
            message: 'Hình thức thanh toán chỉ được chọn: Credit Card hoặc Paypal hoặc Cash'
        }
    },
    status: {
        type: String,
        enum: ['Booked', 'Checkin', 'Checkout'],
        default: 'Booked'
    }
}, {
    timestamps: true
});
transactionSchema.pre('save', function(next) {
    if (this.dateEnd <= this.dateStart) {
        next(new Error('Ngày trả phòng phải sau ngày nhận phòng'));
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);