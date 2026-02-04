const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');

exports.getDashboardReports = async (req, res, next) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const [
            totalBooks,
            borrowedThisMonth,
            activeBorrowers,
            popularDayStats,
            categoryStats,
            userStatusStats
        ] = await Promise.all([
            Book.countDocuments(),

            Borrow.countDocuments({ 
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            }),

            Borrow.distinct('user', { 
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            }),

            Borrow.aggregate([
                {
                    $group: {
                        _id: { $dayOfWeek: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]),

            Borrow.aggregate([
                {
                    $lookup: {
                        from: "books", 
                        localField: "book",
                        foreignField: "_id",
                        as: "bookInfo"
                    }
                },
                { $unwind: "$bookInfo" },
                {
                    $group: {
                        _id: "$bookInfo.category",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 } 
            ]),

            User.aggregate([
                {
                    $group: {
                        _id: "$status", 
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const days = ["Unknown", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const popularDayName = popularDayStats.length > 0 ? days[popularDayStats[0]._id] : "N/A";

        res.status(200).json({
            summary: {
                totalBooks,
                activeUsersThisMonth: activeBorrowers.length,
                mostPopularDay: popularDayName,
                borrowedBooksThisMonth: borrowedThisMonth
            },
            charts: {
                mostBorrowedCategories: categoryStats.map(item => ({
                    name: item._id || "Uncategorized", 
                    value: item.count
                })),
                userActivity: userStatusStats.map(item => ({
                    name: item._id || "Unknown",
                    value: item.count
                }))
            }
        });

    } catch (err) {
        console.error("Report Error:", err);
        next(err);
    }
};