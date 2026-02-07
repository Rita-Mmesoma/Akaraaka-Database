const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const SearchLog = require('../models/SearchLog'); // <--- Make sure this is imported

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
            activeUsersCount,  
            totalBorrowsCount, 
            totalSearchesCount  
        ] = await Promise.all([
            // Query 1: Total Books
            Book.countDocuments(),

            // Query 2: Borrowed This Month
            Borrow.countDocuments({ 
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            }),

            // Query 3: Active Borrowers This Month
            Borrow.distinct('user', { 
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            }),

            // Query 4: Popular Day
            Borrow.aggregate([
                { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]),

            // Query 5: Category Stats
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
                    $lookup: {
                        from: "categories", 
                        localField: "bookInfo.category",
                        foreignField: "_id",
                        as: "categoryInfo"
                    }
                },
                { 
                    $unwind: {
                        path: "$categoryInfo",
                        preserveNullAndEmptyArrays: true 
                    } 
                },
                {
                    $group: {
                        _id: { $ifNull: ["$categoryInfo.name", "$bookInfo.category"] }, 
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
            ]),

            // Query 6: Active Users (Represents "Logins")
            User.countDocuments({ status: 'active' }),

            // Query 7: Total Borrows
            Borrow.countDocuments({}),

            // Query 8: Total Searches 
            SearchLog.countDocuments({})
        ]);

        // Helper for Day Name
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
                // Bar Chart Data
                mostBorrowedCategories: categoryStats.map(item => ({
                    name: item._id || "Uncategorized", 
                    value: item.count
                })),
                
                // 👇 Pie Chart Data (Manually constructed from the counts)
                userActivity: [
                    { name: "logins", value: activeUsersCount },
                    { name: "borrows", value: totalBorrowsCount },
                    { name: "searches", value: totalSearchesCount }
                ]
            }
        });

    } catch (err) {
        console.error("Report Error:", err);
        next(err);
    }
};