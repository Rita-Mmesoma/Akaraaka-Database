const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type:String,
            default: '',
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        cover: {
            type: String,
            default: '',
        },
        file: {
            type: String,
            default: '',
        },
        published: {
            type: Boolean,
            default: true,
        },
        stock: {
            type: Number,
            default: 1,
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Book', bookSchema)