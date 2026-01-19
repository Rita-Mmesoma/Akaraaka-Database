const mongoose = require('mongoose')

const borrowSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
        status: {
            type: String,
            enum: ['borrowed', 'returned', 'overdue'],
        },
        dueDate: {
            type: Date,
            required: true
        },
    },
    {
        timestamps: true   
    }
)

module.exports = mongoose.model('Borrow', borrowSchema)