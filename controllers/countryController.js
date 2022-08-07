const uuid = require('uuid')
const path = require('path');
const { Country, Product } = require('../models/models')
//const sequelize = require('../db')
const ApiError = require('../error/ApiError');

const countryController = {
    async create(req, res, next){
        try{
            const name = req.body.name.trim()
            const country = await Country.create({name})
            return res.json(country)
        }
		catch(err){
            next(ApiError.badRequest(err.message))
        }

    },
    async getAll(req, res){
		let countries = {}
		if(req.query.involved){
			const distinct = await Product.aggregate('countryId', 'DISTINCT', {plain: false})
			if(distinct.length){
				const ids = distinct.map(d => d.DISTINCT)
				countries = await Country.findAll({where: {id: ids}})
				return res.json(countries)
			}
		}
		countries = await Country.findAll()
        return res.json(countries)
    }
}

module.exports = countryController