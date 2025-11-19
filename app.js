const express = require('express')
// const morgan = require('morgan')
const cors = require('cors')
// const helmet = require('helmet')
require('dotenv').config()

const connectDB = require('./src/db/connect')
const authRoutes = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const bookRoutes = require('./src/routes/book.routes');

const app = express()

app.use(cors({
  origin: ["http://localhost:3000", "https://akaraaka.vercel.app"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))
//Handle preflight requests
// app.options("*", cors());

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/books', bookRoutes)

app.use((req, res)=> {
    res.status(404).json({ message: 'Not found'})
})

app.use((err, req, res, next) => {
    console.log('appcbbbg', err)
    res.status(err.statuCode || 500).json({ message: err.message || 'Server error'})
})

const port = process.env.PORT
const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI)
        app.listen(port, ()=>{
        console.log(`Server is listening on https://localhost:${port}/`)
})
    }catch(err){
        console.log(err)
    }
}
start()
