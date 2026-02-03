const User = require('../models/User');

exports.getAllUsers = async (req, res, next) => {
    try {
        const [users, activeCount, inactiveCount, suspendedCount] = await Promise.all([

            User.find().select('-password').sort({ createdAt: -1 }),
            
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ status: 'inactive' }),
            User.countDocuments({ status: 'suspended' })
        ]);

        res.status(200).json({
            stats: {
                active: activeCount,
                inactive: inactiveCount,
                suspended: suspendedCount,
                total: users.length
            },
            users: users
        });

    } catch (err) {
        console.error("Get All Users Error:", err);
        next(err);
    }
};