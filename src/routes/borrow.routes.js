const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/borrow.controllers');

router.use(protect); 

router.post('/', ctrl.borrowBook);

router.put('/return', ctrl.returnBook);

router.patch('/:id/return', protect, adminOnly, borrowController.markBookReturned);

router.get('/my-history', ctrl.getMyBorrows);

module.exports = router;