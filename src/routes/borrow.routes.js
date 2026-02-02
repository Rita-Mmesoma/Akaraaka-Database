const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/borrow.controllers');

router.use(protect); 

router.post('/', ctrl.borrowBook);

router.put('/return', ctrl.returnBook);

router.patch('/:id/return', protect, adminOnly, ctrl.markBookReturned);

router.get('/my-history', ctrl.getMyBorrows);

router.get('/', protect, adminOnly, ctrl.getAllBorrows);

module.exports = router;