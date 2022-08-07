const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')

const authMiddleware = (req, res, next) => {
	try{
		const bearerHeader = req.header('authorization')
		if(!bearerHeader){
			const error = ApiError.unauthorized(`Укажите валидный заголовок Authorization.`)
			return next(error)
		}
		const token = bearerHeader.split(' ')[1]
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
		if(Date.now() > decoded.exp * 1000){
			const error = ApiError.unauthorized(`Срок действия токена истек.`)
			return next(error)
		}
		next()
	}
	catch(err){
		console.log(err.message)
		next(ApiError.badRequest(err.message))
	}
}

module.exports = authMiddleware