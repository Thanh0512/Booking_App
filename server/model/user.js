const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const userSchema = new Schema({
    username: {
        type: String,
        default: function() {

            return this.email ? this.email.split('@')[0] : 'user';
        },
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    fullName: {
        type: String,
        default: '',
    },
    phoneNumber: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);