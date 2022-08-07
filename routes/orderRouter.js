const Router = require('express')
const orderController = require('../controllers/orderController')
const authMiddleware = require('../middleware/authMiddleware')

const router = new Router()

router.post('/', orderController.create)
router.put('/', authMiddleware, orderController.update)
router.get('/', authMiddleware, orderController.getAll)
//router.get('/:id', authMiddleware, orderController.getOne)

module.exports = router