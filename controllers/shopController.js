const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')
const { Product, Type, Country } = require('../models/models')
const sequelize = require('../db')
const ApiError = require('../error/ApiError')

const getTypeId = async (type) => {
	if(!type){
		return null
	}
	let typeId = parseInt(type)
	if(!typeId || isNaN(typeId)){
		//queryResult = await Type.findOne({where:{name: type}})
		const queryResult = await Type.findOne({
			where: sequelize.where(
				sequelize.fn('lower', sequelize.col('name')),
				sequelize.fn('lower', type)
			)
		})
		if(!queryResult || !queryResult.dataValues){
			return null
		}
		typeId = queryResult.dataValues.id
	}
	return typeId
}

const getCountryId = async (country) => {
	if(!country){
		return null
	}
	let countryId = parseInt(country)
	if(!countryId || isNaN(countryId)){
		//queryResult = await Country.findOne({where: {name: country}})
		const queryResult = await Country.findOne({
			where: sequelize.where(
				sequelize.fn('lower', sequelize.col('name')),
				sequelize.fn('lower', country)
			)
		})
		if(!queryResult || !queryResult.dataValues){
			return null
		}
		countryId = queryResult.dataValues.id
	}
	return countryId
}

const getImagePath = (filename) => path.resolve(__dirname, '..', 'public/img/products', filename)
const unlinkImg = (filename) => {
	const imgPath = getImagePath(filename)
	fs.exists(imgPath, (isExist) => {
		if(isExist){
			fs.unlink(imgPath, (err) => {
				if(err){
					console.log(err)
				}
			})
		}
	})
}

const shopController = {
	async put(req, res, next){ // create & update
		try{
			//console.log(' - put - ', req.body)
			let {id, name, type, country, description, price, clearImg} = req.body
			price = parseInt(price) || 0
			let product
			if('id' in req.body && req.body.id){ // update
				id = parseInt(id)
				if(!id || isNaN(id)){
					throw new Error(`Невалидный ID.`)
				}
				product = await Product.findOne({
					where: {id}
				})
				if(!product){
					throw new Error(`Запись с ID ${id} не найдена.`)
				}
				const newData = {
					//name,
					//description,
					//price,
					//typeId,
					//countryId
				}
				if(name){
					newData.name = name
				}
				if(description){
					newData.description = description
				}
				if(type){
					const typeId = await getTypeId(type)
					if(!typeId){
						throw new Error(`Не найден указанный тип (${type}).`)
					}
					newData.typeId = typeId
				}
				if(country){
					const countryId = await getCountryId(country)
					if(!countryId){
						throw new Error(`Не найдена указанная страна (${country}).`)
					}
					newData.countryId = countryId
				}
				if('price' in req.body){
					newData.price = price
				}
				if(clearImg && product.img){
					unlinkImg(product.img)
					newData.img = ''
				}
				if(Object.keys(newData).length){ // есть что обновлять
					product.set(newData)
					await product.save()
				}
			}
			else{ // create
				const typeId = await getTypeId(type)
				if(!typeId){
					throw new Error(`Не найден указанный тип (${type}).`)
				}
				const countryId = await getCountryId(country)
				if(!countryId){
					throw new Error(`Не найдена указанная страна (${country}).`)
				}
				product = await Product.create({name, typeId, countryId, description, price})
			}
			if(req.files && req.files.img){ // update img field
				if(product.img){
					unlinkImg(product.img)
				}
				//check mime type
				const {mimetype} = req.files.img
				if(mimetype.split('/')[0] == 'image'){
					const fileName = uuid.v4() + path.extname(req.files.img.name)
					req.files.img.mv(getImagePath(fileName))
					product.img = fileName
					await product.save()
				}
				else{
					console.log(`Невалидный mimetype (${mimetype})`)
				}
			}
			return res.json(product)
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}

	},

	async delete(req, res, next){
		try{
			const id = parseInt(req?.body?.id)
			if(!id || isNaN(id)){
				throw new Error(`Невалидный ID.`)
			}
			const product = await Product.findOne({
				where: {id}
			})
			if(!product){
				throw new Error(`Не найден товар с указанным ID (${id}).`)
			}
			if(product.img){
				unlinkImg(product.img)
			}
			await product.destroy()
			return res.json({deleted: 'deleted'})
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}
	},

	async getAll(req, res, next){
		try{
			let {type, country, page, limit, skip, random} = req.query
			let options = {}
			options.order = random ? sequelize.random() : [['createdAt', 'DESC']]

			limit = parseInt(limit) || 0
			page = parseInt(page) || 1
			if(!limit && page > 1){
				limit = 6
			}
			if(limit){
				options.limit = limit
				options.offset = page * limit - limit
			}

			const typeId = await getTypeId(type)
			const countryId = await getCountryId(country)

			if(typeId && countryId){
				options.where = {typeId, countryId}
			}
			else if(typeId && !countryId){
				options.where = {typeId}
			}
			else if(!typeId && countryId){
				options.where = {countryId}
			}

			if(skip){
				if(!Array.isArray(skip)){
					skip = skip.split(',')
				}
				skip = skip.filter(id => Number(id))
				if(skip.length){
					if(!('where' in options)){
						options.where = {}
					}
					options.where.id = {[Op.notIn]: skip}
				}
			}

			let products = await Product.findAndCountAll(options)
			return res.json(products)
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}
	},

	async getOne(req, res, next){
		try{
			const id = parseInt(req.params.id)
			if(!id || isNaN(id)){
				return next(ApiError.notFound(`Невалидный ID.`))
			}
			const product = await Product.findOne({
				where: {id},
				include: [Type, Country] //[{model: Type, as: 'type'}, {model: Country, as: 'country'}]
			})
			if(!product){
				return next(ApiError.notFound(`Не найден товар с указанным ID (${id}).`))
			}
			return res.json(product)
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}
	}
}

module.exports = shopController
