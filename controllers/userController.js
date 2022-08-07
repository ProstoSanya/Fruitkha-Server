const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models/models')
const ApiError = require('../error/ApiError')

const createToken = (data, expiresIn = '6h') => {
	return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn })
}

const userController = {
    async create(req, res, next){
        try{
            let {username, email, password, role} = req.body
			if(!username || !email || !password){
				throw new Error(`Ошибка. Укажите все данные.`)
			}
			const queryResult = await User.findOne({
				where: {
					[Op.or]: {email, username}
				}
			})
			if(queryResult && queryResult.dataValues){
				throw new Error(`Ошибка. Такой пользователь уже существует.`)
			}
			const hash = bcrypt.hashSync(password, 6)
			let params = {username, email, password: hash}
			if(role){
				params.role = role.toUpperCase()
			}
            const user = await User.create(params)
            return res.json(user)
        }
		catch(err){
            next(ApiError.badRequest(err.message))
        }
    },
    async getOne(req, res, next){
		try{
			const id = parseInt(req.params.id)
			if(!id || isNaN(id)){
				throw new Error(`Ошибка. Невалидный ID.`)
			}
			const user = await User.findOne({
				where: {id}
			})
			return res.json(user)
		}
		catch(err){
            next(ApiError.badRequest(err.message))
        }
    },
    /*async search(req, res, next){
		try{
			let {username, email} = req.query
			if(!username && !email){
				throw new Error(`Ошибка. Укажите данные для поиска.`)
			}
			let obj = {}
			if(username){
				obj.username = username
			}
			if(email){
				obj.email = email
			}
			const users = await User.findAndCountAll({
				where: {
					[Op.or]: obj
				}
			})
			return res.json(users)
		}
		catch(e){
            next(ApiError.badRequest(e.message))
        }
    },*/
	async signin(req, res, next){
		try{
			let {username, email, password} = req.body
			if((!username && !email) || !password){
				throw new Error(`Укажите все данные.`)
			}
			let obj = {}
			if(username){
				obj.username = username
			}
			if(email){
				obj.email = email
			}
			const user = await User.findOne({
				where: {
					[Op.or]: obj,
					role: 'ADMIN'
				}
			})
			if(!user){
				throw new Error(`Пользователь не найден.`)
			}
			if(!bcrypt.compareSync(password, user.password)){
				throw new Error(`Неверный пароль.`)
			}
			const expiredAt = Math.floor(Date.now() / 1000) + (60 * 60 * 6) // 6 hours
			const data = {
				id: user.id,
				username: user.username,
				exp: expiredAt
			}
			const token = jwt.sign(data, process.env.TOKEN_SECRET) //, { expiresIn: '6h' }
			return res.json({
				...data,
				token
			})
		}
		catch(err){
            return next(ApiError.badRequest(err.message))
        }
    },
	async checkauth(req, res, next){
		try{
			let {token} = req.body
			if(!token){
				throw new Error(`Укажите все данные.`)
			}
			
			const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
			console.log('decoded =', decoded)
			
			if(Date.now() > decoded.exp * 1000){
				throw new Error(`Срок действия токена истек.`)
			}
			/*const user = await User.findOne({
				where: {
					id: decoded.id,
					username: decoded.username
				}
			})
			if(!user){
				throw new Error(`Пользователь не найден.`)
			}*/
			//token = createToken({id: user.id, username: user.username})
			return res.json({token: 'OK'})
		}
		catch(err){
            return next(ApiError.badRequest(err.message))
        }
    }
}

module.exports = userController