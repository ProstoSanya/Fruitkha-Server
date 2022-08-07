const Router = require('express')
const shopController = require('../controllers/shopController')
const authMiddleware = require('../middleware/authMiddleware')

const router = new Router()

router.put('/', authMiddleware, shopController.put) // create & update
router.delete('/', authMiddleware, shopController.delete)
router.get('/', shopController.getAll)
router.get('/:id', shopController.getOne)

module.exports = router