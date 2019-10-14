const express = require('express')
const router = express.Router()
const { authenticated } = require('../config/auth')
const db = require('../models')
const Record = db.Record
const User = db.User

router.get('/', authenticated, (req, res) => {
  return res.redirect('/')
})

router.get('/new', authenticated, (req, res) => {
  return res.render('new')
})

router.post('/', authenticated, (req, res) => {
  Record.create({
      name: req.body.name,
      category: req.body.category || "pen",
      merchant: req.body.merchant || "",
      caseDate: req.body.caseDate,
      amount: req.body.amount,
      UserId: req.user.id
    })
    .then(record => { return res.redirect('/') })
    .catch(error => { return res.status(422).json(error) })
})

router.get('/:id/edit', authenticated, (req, res) => {
  User.findByPk(req.user.id).then(user => {
      if (!user) throw new Error('User not found')
      return Record.findOne({
        where: {
          UserId: req.user.id,
          Id: req.params.id
        }
      })
    })
    .then(record => {
      // ============ dateFormat ============
      let dateFormat = { "dateFormat": record.caseDate.toJSON().substr(0, 10) }
      Object.assign(record, dateFormat)
      return res.render('edit', { record, dateFormat })
    })
    .catch(error => { return res.status(422).json(error) })
})

router.put('/:id/edit', authenticated, (req, res) => {
  Record.findOne({
      where: {
        UserId: req.user.id,
        Id: req.params.id
      }
    }).then(record => {
      record.name = req.body.name
      record.category = req.body.category
      record.merchant = req.body.merchant || ""
      record.caseDate = req.body.caseDate
      record.amount = req.body.amount
      return record.save()
    })
    .then(record => { return res.redirect(`/`) })
    .catch(error => { return res.status(422).json(error) })
})

router.get('/:id/delete', authenticated, (req, res) => {
  User.findByPk(req.user.id).then(user => {
      if (!user) throw new Error('User not found')
      return Record.destroy({
        where: {
          UserId: req.user.id,
          Id: req.params.id
        }
      })
    })
    .then(record => { return res.redirect('/') })
    .catch(error => { return res.status(422).json(error) })
})

module.exports = router