const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/borrow.controllers');

router.use(protect); 

router.post('/', ctrl.borrowBook);

router.put('/return', ctrl.returnBook);

router.get('/my-history', ctrl.getMyBorrows);

module.exports = router;