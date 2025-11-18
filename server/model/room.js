const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const roomNumberSchema = new Schema({
    number: {
        type: Number,
        required: [true, 'Số phòng là bắt buộc'],
        min: [1, 'Số phòng phải lớn hơn 0']
    },
    unavailableDates: {
        type: [Date],
        default: []
    }
}, { _id: false });

const roomSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Tên loại phòng là bắt buộc'],
        trim: true,
        minlength: [2, 'Tên loại phòng ít nhất 2 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Giá phòng là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    maxPeople: {
        type: Number,
        required: [true, 'Số người tối đa là bắt buộc'],
        min: [1, 'Phải cho phép ít nhất 1 người'],
        max: [10, 'Tối đa 10 người/phòng']
    },
    desc: {
        type: String,
        required: [true, 'Mô tả phòng là bắt buộc'],
        minlength: [10, 'Mô tả ít nhất 10 ký tự']
    },
    roomNumbers: {
        type: [roomNumberSchema],
        required: [true, 'Danh sách số phòng là bắt buộc'],
        // Thêm Setter để chuyển đổi mảng số thành mảng đối tượng nhúng
        set: (v) => {
            if (v && Array.isArray(v) && typeof v[0] === 'number') {
                // Nếu là mảng số, chuyển đổi thành mảng đối tượng
                return v.map(num => ({ number: num, unavailableDates: [] }));
            }
            return v;
        },
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: 'Phải có ít nhất 1 số phòng'
        }
    }
}, {
    timestamps: true
});

// Middleware xử lý lỗi _id Extended JSON cho Room
roomSchema.pre('insertMany', function(next, docs) {
    if (Array.isArray(docs)) {
        docs.forEach(doc => {
            // 1. Xử lý _id
            if (doc._id && typeof doc._id === 'object' && doc._id.$oid) {
                doc._id = doc._id.$oid;
            } else if (doc._id && typeof doc._id === 'object') {
                // Nếu _id là object không có $oid (thường là lỗi khác), nên xóa
                delete doc._id;
            }

            // 2. Xử lý createdAt và updatedAt (Lỗi $date)
            if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.$date) {
                doc.createdAt = doc.createdAt.$date;
            }
            if (doc.updatedAt && typeof doc.updatedAt === 'object' && doc.updatedAt.$date) {
                doc.updatedAt = doc.updatedAt.$date;
            }

            // 3. Xử lý __v (Version key)
            if ('__v' in doc) {
                delete doc.__v;
            }
        });
    }
    next();
});

module.exports = mongoose.model('Room', roomSchema);