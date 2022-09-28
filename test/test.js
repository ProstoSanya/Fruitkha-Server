const chai = require('chai')
const chaiHttp = require('chai-http')
const jwt = require('jsonwebtoken')
const generatePhone = require('random-mobile-numbers')

const Jabber = require('jabber')

const server = require('../index')
const { User, Type, Country, Product, Order } = require('../models/models.js')

// Assertion
chai.should()
chai.use(chaiHttp)

const randInt = (min = 1, max = 100) => Math.round(min - 0.5 + Math.random() * (max - min + 1)) + 0

const jabber = new Jabber()
const USERNAME = jabber.createFullName(false).split(' ')[0]
const PASSWORD = jabber.createWord(randInt(6, 12))
const USEREMAIL = jabber.createEmail()

let USERID = null
let TYPEID = null
let COUNTRYID = null
let PRODUCTID = null
let ORDERID = null
let TOKEN = null

let types = []
let countries = []

describe("Start Testing", () => {
  before(async () => {
    console.log('USERNAME = ' + USERNAME + ' | USEREMAIL = ' + USEREMAIL + ' | PASSWORD = ' + PASSWORD)
    //get all types
    chai.request(server)
      .get("/api/type/")
      .end((err, res) => {
        if(err){
          throw new Error(err)
        }
        res.should.have.status(200)
        res.body.should.be.an('array')
        types = res.body.map((t) => t.id)
      })
    //get all countries
    chai.request(server)
      .get("/api/country/")
      .end((err, res) => {
        if(err){
          throw new Error(err)
        }
        res.should.have.status(200)
        res.body.should.be.an('array')
        countries = res.body.map((c) => c.id)
      })
  })

  after(async () => {
    if(ORDERID){
      await Order.destroy({ where: { id: ORDERID }, limit: 1 })
    }
    if(PRODUCTID){
      await Product.destroy({ where: { id: PRODUCTID }, limit: 1 })
    }
    if(TYPEID){
      await Type.destroy({ where: { id: TYPEID }, limit: 1 })
    }
    if(COUNTRYID){
      await Country.destroy({ where: { id: COUNTRYID }, limit: 1 })
    }
    if(USERID){
      await User.destroy({ where: { id: USERID }, limit: 1 })
    }
  })

  it("Create user", (done) => {
    chai.request(server)
      .post("/api/user/")
      .send({
        'username': USERNAME,
        'password': PASSWORD,
        'email': USEREMAIL,
        'role': 'ADMIN'
      })
      .end((err, res) => {
        if(err){
          done(err)
        }
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.property('id')
        USERID = res.body.id
        done()
      })
  })

  it("SignIn", (done) => {
    chai.request(server)
      .post("/api/user/signin")
      .send({
        'username': USERNAME,
        'password': PASSWORD
      })
      .end((err, res) => {
        if(err){
          done(err)
        }
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.property('token')
        TOKEN = res.body.token
        done()
      })
  })

  it("Create type", (done) => {
    let name = jabber.createWord(randInt(6, 20))
    while(types.includes(name)){
      name = jabber.createWord(randInt(6, 20))
    }
    chai.request(server)
      .post("/api/type")
      .send({ name })
      .end((err, res) => {
        if(err){
          done(err)
        }
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.property('id')
        TYPEID = res.body.id
        done()
      })
  })

  it("Create country", (done) => {
    let name = jabber.createWord(randInt(6, 20))
    while(countries.includes(name)){
      name = jabber.createWord(randInt(6, 20))
    }
    chai.request(server)
      .post("/api/country")
      .send({ name })
      .end((err, res) => {
        if(err){
          done(err)
        }
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.property('id')
        COUNTRYID = res.body.id
        done()
      })
  })


  describe("Create new product && make order", () => {
    const price = randInt(5, 100)
    let name = ''
    before(async () => { //generate unique product name
      let res = true
      while(res){
        name = jabber.createWord(randInt(6, 20))
        res = await Product.findOne({ where: { name } })
      }
    })

    it("Add product", (done) => {
      //new Promise(async (resolve) => {
        chai.request(server)
          .put('/api/shop')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send({
            'name': name,
            'price': price,
            'type': TYPEID,
            'country': COUNTRYID
          })
          .end((err, res) => {
            if(err){
              done(err)
            }
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('id')
            PRODUCTID = res.body.id
            done()
          })
        /*resolve()
      })
      .then(done)
      .catch((err) => done(err))*/
    })

    it("Make order", (done) => {
      let comment = jabber.createParagraph(randInt(3, 9))
      if(comment.length > 150){
        comment = comment.slice(0, 149).trim()
      }
      let address = jabber.createParagraph(randInt(2, 6))
      if(address.length > 35){
        address = address.slice(0, 34).trim()
      }
      const phone = generatePhone('USA')
      const data = {
        name: USERNAME,
        email: USEREMAIL,
        address: address,
        phone: phone,
        products: [
          {
            id: PRODUCTID,
            count: randInt(1, 10),
            price: price
          }
        ],
        comment: comment
      }
      chai.request(server)
        .post("/api/order")
        .send(data)
        .end((err, res) => {
          if(err){
            done(err)
          }
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('id')
          ORDERID = res.body.id
          done()
        })
    })
  })

})
