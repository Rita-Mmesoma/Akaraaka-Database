require('dotenv').config()
const connectDB = require('./src/db/connect')
const User = require('./src/models/User')

async function createAdmin(){
    try{
        await connectDB(process.env.MONGO_URI)

        const adminExists = await User.findOne({ role: 'admin' })

        if(adminExists){
            console.log('Admin already exists:', adminExists.email)
            process.exit(0)
        }

        const admin = await User.create({
            name: 'Super Admin',
            email: 'ritammesoma357@gmail.com',
            password: 'admin12345',
            role: 'admin',
        })
        console.log('Admin created:', admin)
        process.exit(0)
    }catch(err){
        console.error(err)
        process.exit(1)
    }
}

createAdmin()