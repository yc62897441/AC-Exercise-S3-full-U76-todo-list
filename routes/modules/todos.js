const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo

router.get('/todo/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/', (req, res) => {
  const name = req.body.name
  
  Todo.create({
    name: name,
    isDone: false,
    UserId: req.user.id
  })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router
