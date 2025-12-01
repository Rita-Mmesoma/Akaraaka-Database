const router = require('express').Router()
const upload = require('../middleware/upload')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/roles')
const ctrl = require('../controllers/book.controllers')

router.get('/', protect, ctrl.getBooks)
router.get('/:id', ctrl.getBookById)
router.post('/', protect, isAdmin, upload.single('cover'), ctrl.createBook)
router.patch('/:id', protect, isAdmin, ctrl.updateBook)
router.delete('/:id', protect, isAdmin, ctrl.deleteBook)

module.exports = router