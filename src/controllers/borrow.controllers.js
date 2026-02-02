const Borrow = require('../models/Borrow'); // Adjust path to match your structure
const Book = require('../models/Book');     // Need this to update stock

// --- 1. BORROW A BOOK ---
exports.borrowBook = async (req, res, next) => {
    try {
        // const userId = req.user._id;
        // const { bookId } = req.body;

        const userObj = req.user || {};
        const userId = userObj._id || userObj.id || userObj.userId;

        console.log("Debug - Extracted User ID:", userId); // Check your terminal for this!

        const { bookId } = req.body;

        // STOP if we can't find an ID
        if (!userId) {
            return res.status(401).json({ 
                message: "User Authentication Failed: No User ID found in request." 
            });
        }

        // 1. Check if Book Exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // 2. Check if Stock is Available
        if (book.stock < 1) {
            return res.status(400).json({ message: "Book is currently out of stock" });
        }

        // 3. Optional: Check if User already borrowed this specific book and hasn't returned it
        const existingBorrow = await Borrow.findOne({
            user: userId,
            book: bookId,
            status: 'borrowed'
        });

        if (existingBorrow) {
            return res.status(400).json({ message: "You have already borrowed this book. Please return it first." });
        }

        // 4. Calculate Due Date (e.g., 7 Days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Adds 7 days

        // 5. Create the Borrow Record
        const borrow = new Borrow({
            user: userId,
            book: bookId,
            status: 'borrowed',
            dueDate: dueDate
        });

        // 6. Decrease Book Stock
        book.stock -= 1;

        // 7. Save both updates (Using Promise.all for speed)
        await Promise.all([
            borrow.save(),
            book.save()
        ]);

        res.status(201).json({
            message: "Book borrowed successfully",
            dueDate: dueDate,
            borrowId: borrow._id
        });

    } catch (err) {
        console.error("Borrow Error:", err);
        next(err);
    }
};

// --- 2. RETURN A BOOK ---
exports.returnBook = async (req, res, next) => {
    try {
        const { borrowId } = req.body;

        // 1. Check if Auth Middleware worked
        console.log("---------------- DEBUG START ----------------");
        console.log("Logged in User Object:", req.user); // Is this undefined?

        const userId = req.user ? (req.user._id || req.user.id) : undefined;
        
        const borrowRecord = await Borrow.findById(borrowId);

        if (!borrowRecord) {
            console.log("Error: Borrow Record not found in DB");
            return res.status(404).json({ message: "Borrow record not found" });
        }

        console.log("Record found:", borrowRecord._id);
        console.log("Record Owner field:", borrowRecord.user); // Is this undefined?
        console.log("My User ID:", userId); // Is this undefined?

        // 2. SAFETY CHECK: Stop if data is missing
        if (!userId) {
            console.log("CRASH CAUSE: User ID is missing!");
            return res.status(401).json({ message: "User ID not found in token" });
        }
        if (!borrowRecord.user) {
            console.log("CRASH CAUSE: Borrow record has no owner!");
            return res.status(500).json({ message: "Corrupt data: This book has no owner" });
        }

        // 3. Compare (Now safe because we checked above)
        const isOwner = borrowRecord.user.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';

        console.log(`Match? ${isOwner} | Is Admin? ${isAdmin}`);
        console.log("---------------- DEBUG END ----------------");

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // ... (Rest of your logic: Check status, Pending, etc.) ...
        if (borrowRecord.status === 'returned') {
            return res.status(400).json({ message: "Book already returned" });
        }
        if (borrowRecord.status === 'pending') {
            return res.status(400).json({ message: "Return verification already pending" });
        }

        borrowRecord.status = 'pending';
        await borrowRecord.save();

        res.status(200).json({ message: "Return requested. Waiting for admin approval." });

    } catch (err) {
        next(err);
    }
};

// exports.confirmReturn = async (req, res, next) => {
//     try {
//         const { borrowId } = req.body;
        
//         const borrowRecord = await Borrow.findById(borrowId);
//         if (!borrowRecord) return res.status(404).json({ message: "Record not found" });

//         if (borrowRecord.status !== 'pending') {
//             return res.status(400).json({ message: "This record is not pending approval" });
//         }

//         // NOW we complete the return
//         borrowRecord.status = 'returned';

//         // AND increase the stock
//         const book = await Book.findById(borrowRecord.book);
//         if (book) {
//             book.stock += 1;
//             await book.save();
//         }

//         await borrowRecord.save();
//         res.status(200).json({ message: "Return approved and stock updated" });

//     } catch (err) {
//         next(err);
//     }
// }
exports.markBookReturned = async (req, res, next) => {
    try {
        // 1. GET ID FROM URL (Matches your frontend)
        const { id } = req.params; 
        
        const borrowRecord = await Borrow.findById(id);
        if (!borrowRecord) return res.status(404).json({ message: "Record not found" });

        // 2. CHECK IF ALREADY RETURNED
        if (borrowRecord.status === 'returned') {
            return res.status(400).json({ message: "Book is already returned" });
        }

        // 3. UPDATE STATUS (Force it to returned, even if it was 'overdue' or 'borrowed')
        borrowRecord.status = 'returned';
        
        // 4. INCREASE STOCK (The logic you liked from confirmReturn)
        const book = await Book.findById(borrowRecord.book);
        if (book) {
            book.stock += 1;
            await book.save();
        }

        await borrowRecord.save();
        res.status(200).json({ message: "Book returned and stock updated" });

    } catch (err) {
        next(err);
    }
}

exports.getMyBorrows = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        

        // QUERY 1: Try to find matches normally
        const myBorrows = await Borrow.find({ user: userId })
            .populate('book', 'title author cover')
            .sort({ createdAt: -1 })
        
        res.status(200).json(myBorrows);
    } catch (err) {
        next(err);
    }
};