const router = require('express').Router()
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/roles')
const ctrl = require('../controllers/category.controllers')

router.get('/', ctrl.getCategories)
router.post('/',protect, isAdmin, ctrl.createCategory)
router.patch('/:id', protect, isAdmin, ctrl.updateCategories)
router.delete('/:id', protect, isAdmin, ctrl.deleteCategory)

module.exports = router