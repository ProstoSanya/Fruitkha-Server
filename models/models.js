const sequelize = require('../db')
const { INTEGER, STRING } = require('sequelize').DataTypes

const Type = sequelize.define('type', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, unique: true, allowNull: false}
},
{
	timestamps: false
})

const Country = sequelize.define('country', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, unique: true, allowNull: false}
},
{
	timestamps: false
})

const Product = sequelize.define('product', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, unique: true, allowNull: false},
    typeId: {type: INTEGER, allowNull: false},
    countryId: {type: INTEGER, allowNull: false},
    price: {type: INTEGER, allowNull: false},
    description: {type: STRING},
    img: {type: STRING}
})

const Order = sequelize.define('order', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, validate: { notEmpty: true }},
    email: {type: STRING, validate: { isEmail: true }},
    address: {type: STRING},
    phone: {type: STRING, validate: { notEmpty: true }},
    comment: {type: STRING},
	status: {type: STRING, defaultValue: 'NEW', validate: { isIn: [['NEW', 'IN_PROCESS', 'EXECUTED', 'REJECTED']] }},
    totalPrice: {type: INTEGER, allowNull: false}
})

const OrderProduct = sequelize.define('order_product', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    //orderId: {type: INTEGER, allowNull: false},
    //productId: {type: INTEGER, allowNull: false},
    count: {type: INTEGER, defaultValue: 1, allowNull: false}
})

const User = sequelize.define('user', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: STRING, unique: true, validate: { notEmpty: true }},
    email: {type: STRING, unique: true, validate: { isEmail: true }},
    password: {type: STRING, validate: { notEmpty: true }},
    role: {type: STRING, defaultValue: 'USER', validate: { isIn: [['ADMIN', 'USER']] }}
})

Type.hasMany(Product)
Product.belongsTo(Type)

Country.hasMany(Product)
Product.belongsTo(Country)

/*Order_product.hasMany(Order)
Order.belongsTo(Order_product)

Order_product.hasMany(Product)
Product.belongsTo(Order_product)

Type.belongsToMany(Brand, {through: TypeBrand })
Brand.belongsToMany(Type, {through: TypeBrand })*/

Product.belongsToMany(Order, {through: OrderProduct})
Order.belongsToMany(Product, {through: OrderProduct})

module.exports = {
    Product,
	Type,
	Country,
	Order,
	OrderProduct,
	User
}

/*

const Basket = sequelize.define('basket', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true}
})

const BasketDevice = sequelize.define('basket_device', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true}
})

const Device = sequelize.define('device', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, unique: true, allowNull: false},
    price: {type: INTEGER, allowNull: false},
    rating: {type: INTEGER, defaultValue: 0},
    img: {type: STRING, allowNull: false}
})

const Type = sequelize.define('type', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, unique: true, allowNull: false}
})

const Brand = sequelize.define('brand', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: STRING, unique: true, allowNull: false}
})

const Rating = sequelize.define('rating', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    rate: {type: INTEGER, allowNull: false}
})

const DeviceInfo = sequelize.define('device_info', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: STRING, allowNull: false},
    description: {type: STRING, allowNull: false}
})

const TypeBrand = sequelize.define('type_brand', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true}
})

User.hasOne(Basket)
Basket.belongsTo(User)

User.hasMany(Rating)
Rating.belongsTo(User)

Basket.hasMany(BasketDevice)
BasketDevice.belongsTo(Basket)

Type.hasMany(Device)
Device.belongsTo(Type)

Brand.hasMany(Device)
Device.belongsTo(Brand)

Device.hasMany(Rating)
Rating.belongsTo(Device)

Device.hasMany(BasketDevice)
BasketDevice.belongsTo(Device)

Device.hasMany(DeviceInfo, {as: 'info'})
DeviceInfo.belongsTo(Device)

Type.belongsToMany(Brand, {through: TypeBrand })
Brand.belongsToMany(Type, {through: TypeBrand })

module.exports = {
    User,
    Basket,
    BasketDevice,
    Device,
    Type,
    Brand,
    Rating,
    TypeBrand,
    DeviceInfo
}*/