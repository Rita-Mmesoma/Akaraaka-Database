const mongoose = require('mongoose')

const connectDB = (uri) =>{
    return mongoose.connect(uri)
}
module.exports = connectDB

// module.exports = async function connectDB(uri){
//     mongoose.set('strictQuery', true)
//     await mongoose.connect(uri)
//     console.log('MongoDB connected')
// }