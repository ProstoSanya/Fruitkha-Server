const Router = require('express')
const userController = require('../controllers/userController')

const router = new Router()

router.post('/', userController.create)
//router.get('/', userController.getAll)
//router.all('/search', userController.search)
router.post('/signin', userController.signin)
router.post('/checkauth', userController.checkauth)
router.get('/:id', userController.getOne)

module.exports = router