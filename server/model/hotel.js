const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tên khách sạn là bắt buộc'],
        trim: true,
        minlength: [2, 'Tên khách sạn ít nhất 2 ký tự']
    },
    cheapestPrice: {
        type: Number,
        required: [true, 'Giá thấp nhất là bắt buộc'],
        min: [0, 'Giá không được âm'],
        default: 0
    },
    type: {
        type: String,
        required: [true, 'Loại khách sạn là bắt buộc'],
        lowercase: true,
        enum: {
            values: ['hotel', 'apartments', 'resorts', 'villas', 'cabins'],
            message: 'Loại khách sạn không hợp lệ. Chỉ được chọn: hotel, apartments, resorts, villas, cabins'
        }
    },
    city: {
        type: String,
        required: [true, 'Thành phố là bắt buộc'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Địa chỉ cụ thể là bắt buộc']
    },
    distance: {
        type: String,
        required: [true, 'Khoảng cách đến trung tâm là bắt buộc'],
        match: [/^\d+m$|^\d+\.\d+km$|^\d+km$|^\d+$/, 'Khoảng cách phải có định dạng: 500m, 2km, 1.5km hoặc chỉ là số']
    },
    photos: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|webp)($|\?.*$)/i.test(url));
            },
            message: 'Ảnh phải là URL hợp lệ (jpg, jpeg, png, webp)'
        }
    },
    desc: {
        type: String,
        required: [true, 'Mô tả khách sạn là bắt buộc'],
        minlength: [10, 'Mô tả ít nhất 10 ký tự']
    },
    rating: {
        type: Number,
        min: [0, 'Đánh giá không được âm'],
        max: [5, 'Đánh giá không quá 5'],
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    rooms: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room'
        }],
        set: (v) => {

            if (typeof v === 'string' && v.startsWith('[') && v.endsWith(']')) {
                try {

                    const cleanedString = v
                        .trim()
                        .replace(/[\[\]]/g, '')
                        .replace(/'/g, '')
                        .replace(/"/g, '');


                    const idArray = cleanedString
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id.length === 24);

                    return idArray;
                } catch (e) {
                    console.error("Lỗi xử lý chuỗi rooms:", e);
                    return [];
                }
            }
            return v;
        }
    }
}, {
    timestamps: true
});
hotelSchema.pre('insertMany', function(next, docs) {
    if (Array.isArray(docs)) {
        docs.forEach(doc => {
            // 1. Xử lý _id
            if (doc._id && typeof doc._id === 'object' && doc._id.$oid) {
                doc._id = doc._id.$oid;
            } else if (doc._id && typeof doc._id === 'object') {

                delete doc._id;
            }


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
module.exports = mongoose.model('Hotel', hotelSchema);