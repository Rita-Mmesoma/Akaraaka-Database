const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allows guests to search without being logged in
    },
    resultsCount: {
        type: Number, // use to know if users are searching for things you don't have
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);