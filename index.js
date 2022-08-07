require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const fileUpload = require('express-fileupload')

const sequelize = require('./db')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')

const PORT = process.env.PORT || 8080
const HOST = process.env.HOST || '127.0.0.1'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(fileUpload({}))
app.use('/api', router)

// Обработка ошибок, последний Middleware
app.use(errorHandler)

const start = async () => {
  try{
    await sequelize.authenticate()
    await sequelize.sync() //{force: true}
    app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`))
  }
	catch(err){
    console.log(err)
  }
}

start()
