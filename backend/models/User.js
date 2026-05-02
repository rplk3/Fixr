const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        enum: ['customer', 'provider', 'admin'],
        default: ['customer'],
    },
    providerStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
    },
    phone: {
        type: String,
        default: '',
    },
    profileImage: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);