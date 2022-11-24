const { Sequelize } = require('sequelize')

const args = process.env.NODE_ENV === 'test' ?
  [
    process.env.DB_TEST_NAME,
    process.env.DB_TEST_USER,
    process.env.DB_TEST_PASS
  ]
  :
  [
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS
  ]

args.push({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false
})

module.exports = new Sequelize(...args)
