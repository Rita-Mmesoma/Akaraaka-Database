const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalBooks,
            totalUsers,
            totalBorrows,
            activeLoans,
            recentActivity,
            mostBorrowed
        ] = await Promise.all([
            Book.countDocuments(),

            User.countDocuments({ role: 'user' }),

            Borrow.countDocuments(),

            Borrow.countDocuments({ status: { $in: ['borrowed', 'overdue', 'pending'] } }),

            Borrow.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'username email') 
                .populate('book', 'title cover'),  

            Borrow.aggregate([
                {
                    $group: {
                        _id: "$book",       
                        count: { $sum: 1 }   
                    }
                },
                { $sort: { count: -1 } }, 
                { $limit: 5 },          
                {
                    $lookup: {             
                        from: "books",       
                        localField: "_id",
                        foreignField: "_id",
                        as: "bookDetails"
                    }
                },
                { $unwind: "$bookDetails" },
                {
                    $project: {             
                        title: "$bookDetails.title",
                        cover: "$bookDetails.cover",
                        author: "$bookDetails.author",
                        count: 1
                    }
                }
            ])
        ]);

        res.status(200).json({
            stats: {
                totalBooks,
                totalBorrows, 
                totalUsers,
                activeLoans  
            },
            recentActivity,  
            mostBorrowed
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
};