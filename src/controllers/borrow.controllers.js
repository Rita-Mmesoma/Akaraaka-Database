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
        const { borrowId } = req.body; // Expecting { borrowId: "..." }
        const userId = req.user._id;

        // 1. Find the Borrow Record
        const borrowRecord = await Borrow.findById(borrowId);

        if (!borrowRecord) {
            return res.status(404).json({ message: "Borrow record not found" });
        }

        // Security: Ensure the logged-in user owns this borrow record (or is Admin)
        if (borrowRecord.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to return this book" });
        }

        if (borrowRecord.status === 'returned') {
            return res.status(400).json({ message: "This book has already been returned" });
        }

        // 2. Update Status to Returned
        borrowRecord.status = 'returned';
        // Optional: Record actual return date here if your schema supports it

        // 3. Find the Book and Increase Stock
        const book = await Book.findById(borrowRecord.book);
        if (book) {
            book.stock += 1;
            await book.save();
        }

        await borrowRecord.save();

        res.status(200).json({ message: "Book returned successfully" });

    } catch (err) {
        console.error("Return Error:", err);
        next(err);
    }
};

// --- 3. GET USER'S BORROW HISTORY ---
exports.getMyBorrows = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const borrows = await Borrow.find({ user: userId })
            .populate('book', 'title author cover') // Fetch book details nicely
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(borrows);
    } catch (err) {
        next(err);
    }
};