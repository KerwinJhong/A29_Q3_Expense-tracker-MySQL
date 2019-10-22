const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../models')
const Record = db.Record
const User = db.User

const { authenticated } = require('../config/auth')

router.get('/', authenticated, (req, res) => {
      let { year, month, day, categoryKey } = req.query
        // =========  category search  =========
      let categoryValue = ''
      if (categoryKey === "家居物業") categoryValue = "home"
      if (categoryKey === "交通出行") categoryValue = "shuttle-van"
      if (categoryKey === "休閒娛樂") categoryValue = "grin-beam"
      if (categoryKey === "餐飲食品") categoryValue = "utensils"
      if (categoryKey === "其他") categoryValue = "pen"
      let categoryFind = ''
      if (categoryValue === '') {
        categoryFind = {
          [Op.like]: '%'
        }
      } else {
        categoryFind = {
          [Op.like]: categoryValue
        }
      }
      // =========  search  =========
      if (year === "全部") year = ""
      if (month === "全部") month = ""
      if (day === "全部") day = ""
      let nowYear = new Date().getFullYear().toString()
      let gteDay = day ? (`${Number(day) - 1}`) : "01"
      let lteDay = day ? (`${Number(day) + 1}`) : "31"
      let gteDate = `${year || "1970"}-${month || "01"}-${gteDay}`
      if (gteDay === "0") {
        gteDate = `${year}-${`${Number(month) - 1}`}-31`
    }
    if (gteDay === "0" && (Number(month) - 1)===0) {
      gteDate = `${`${Number(year) - 1}`}-12-31`
    }
    let lteDate = `${year || nowYear}-${month || "12"}-${lteDay}`
    let dateLine = { [Op.between]: [ gteDate, lteDate ] }
  User.findByPk(req.user.id).then((user) => {
      if (!user) throw new Error('User not found')
      return Record.findAll({ where: { 
      UserId: req.user.id,
      category: categoryFind,
      caseDate: dateLine
    }, 
      order: [['caseDate', 'DESC']] 
    })
    })
    .then(records => {
      let amount = 0
      let dateFormat = {}
      let selecterList = []
      records.map(record => {
        // ============ amount ============
        amount += record.amount
        // ============ dateFormat ============
        let dateToString = record.caseDate.toJSON().substr(0, 10)
        dateFormat = { "dateFormat": dateToString }
        Object.assign(record, dateFormat)
        // ============ dateBox ============
        if (selecterList.indexOf(dateToString)) { selecterList.push(dateToString) }
        })
      return res.render('index', { records, amount, selecterList, year, month, day, categoryKey })
    })
    .catch(error => { return res.status(422).json(error) })
})

module.exports = router