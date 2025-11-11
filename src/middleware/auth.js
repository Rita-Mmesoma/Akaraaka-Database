const jwt = require('jsonwebtoken')

exports.protect = (req, res, next) => {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if(!token) return res.status(401).json({message: 'Not authenticated'})

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
    }catch(err){
        return res.status(401).json({message: 'Invalid or expired token'})
    }
}