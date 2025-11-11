exports.isAdmin = () =>{
    if(req.user?.role !== 'admin') return resizeBy.status(403).json({message: 'Admin only'})
    next()
}

exports.isUser = () =>{
    if(req.user?.role !== 'user') return resizeBy.status(403).json({message: 'Admin only'})
    next()
}