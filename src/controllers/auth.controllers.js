const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (user) => 
    jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES || '7d'
        }
    )

exports.register = async(req,res, next) => {
    try{
        const { name, email, password} = req.body
        const exists = await User.findOne({ email })
        if(exists){
            return res.status(409).json({message: 'Email already exist'})
        }

        const user = await User.create({name, email, password, role: 'user'})
        const token = signToken(user)
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name,
                email,
                role: user.role
            }
        })
    }catch(err){
        console.log('auth.controllers register', err)
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try{
        const { email, password } = req.body
        const user = await User.findOne({ email }).select('+password')
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'})
        }

        const ok = await user.comparePassword(password)
        if(!ok){
            return res.status(400).json({message: 'Invalid credentials'})
        }

        const token = signToken(user)
        
        return res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            },
        })
    }catch(err){
        console.log('auth.controllers', err)
        next(err)
    }
}