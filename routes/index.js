const Router = require('express')
const router = new Router()
const shopRouter = require('./shopRouter')
const typeRouter = require('./typeRouter')
const countryRouter = require('./countryRouter')
const userRouter = require('./userRouter')
const orderRouter = require('./orderRouter')

router.use('/shop', shopRouter)
router.use('/type', typeRouter)
router.use('/country', countryRouter)
router.use('/user', userRouter)
router.use('/order', orderRouter)

module.exports = router