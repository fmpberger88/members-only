const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Text is required'],
        trim: true,
        minlength: [1, 'Text must be at least 3 characters'],
    },
    added: {
        type: Date,
        default: Date.now,
        required: [true, 'Text is required']
    },
    user: {
        type: Schema.Types.ObjectId, ref: "User"
    }
});

module.exports = mongoose.model('Message', messageSchema);