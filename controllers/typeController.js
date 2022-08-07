const uuid = require('uuid')
const path = require('path');
const { Type, Product } = require('../models/models')
const ApiError = require('../error/ApiError');

const typeController = {
    async create(req, res, next){
        try{
            const name = req.body.name.trim()
            const type = await Type.create({name})
            return res.json(type)
        }
		catch(err){
            next(ApiError.badRequest(err.message))
        }

    },
    async getAll(req, res){
		let types = {}
		if(req.query.involved){
			const distinct = await Product.aggregate('typeId', 'DISTINCT', {plain: false})
			if(distinct.length){
				const ids = distinct.map(d => d.DISTINCT)
				types = await Type.findAll({where: {id: ids}})
				return res.json(types)
			}
		}
		types = await Type.findAll()
        return res.json(types)
    }
}

module.exports = typeController