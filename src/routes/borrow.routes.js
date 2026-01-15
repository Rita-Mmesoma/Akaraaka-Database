const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/borrow.controller');

// All borrow routes should be protected (User must be logged in)
router.use(protect); 

// POST /api/v1/borrows - Borrow a book
router.post('/', ctrl.borrowBook);

// PUT /api/v1/borrows/return - Return a book
router.put('/return', ctrl.returnBook);

// GET /api/v1/borrows/my-history - See what I borrowed
router.get('/my-history', ctrl.getMyBorrows);

module.exports = router;