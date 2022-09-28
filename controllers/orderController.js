const { Product, Order, OrderProduct } = require('../models/models')
const ApiError = require('../error/ApiError')

const checkField = (name, value) => {
  value = value ? value.toString().trim() : ''
	if(name !== 'comment'){
    if(value.length < 3){
      return false
    }
    if(name == 'email' || name == 'address'){
      if(value.length > 35){
        return false
      }
    }
    else if(value.length > 25){
      return false
    }
	}
  else if(value.length > 150){
    return false
  }
	let result = true
	if(name === 'email'){
		result = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
  }
	else if(name === 'phone'){
		result = value.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
	}
  //if(!result){console.log('name', name, 'value', value, 'result', result)}
	return result
}

const orderController = {
	async create(req, res, next){
		try{
			const requiredFields = ['name', 'email', 'address', 'phone']
			const data = {}
			for(let i in requiredFields){
				const fieldName = requiredFields[i]
				if(!checkField(fieldName, req.body[fieldName])){
					throw new Error(`Невалидные данные (${fieldName}: ${req.body[fieldName]}).`)
				}
				data[fieldName] = req.body[fieldName]
			}
			let {products} = req.body
			if(!products || !Array.isArray(products) || !products.length){
				throw new Error(`Отсутствуют товары в заказе.`)
			}
			let totalPrice = parseInt(req.body.totalPrice)
			if(!totalPrice || isNaN(totalPrice)){ // если нет итоговой цены - вычисляем её
				totalPrice = products.reduce((prev, curr) => prev + curr.price * curr.count, 0)
			}
			const comment = req.body.comment || ''
			let order = await Order.create({...data, totalPrice, comment})
			products = products.map((p) => ({
				orderId: order.id,
				productId: p.id,
				count: p.count
			}))
			await OrderProduct.bulkCreate(products)
			return res.json(order)
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}
	},

	async update(req, res, next){ // обновляем только статус (состояние) заказа
		try{
			let {id, status} = req.body
			id = parseInt(id)
			if(!id || isNaN(id)){
				throw new Error(`Невалидный ID.`)
			}
			let order = await Order.findOne({
				where: {id}
			})
			if(!order){
				throw new Error(`Запись с ID ${id} не найдена.`)
			}
			if(!status){
				throw new Error(`Не указан новый статус заказа.`)
			}
			order.set({status})
			await order.save()
			return res.json(order)
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}
	},

	async getAll(req, res, next){
		try{
			const orders = await Order.findAndCountAll({
				include: Product,
				order: [['createdAt', 'DESC']]
			})
			return res.json(orders)
		}
		catch(err){
			next(ApiError.badRequest(err.message))
		}
	}
}

module.exports = orderController
