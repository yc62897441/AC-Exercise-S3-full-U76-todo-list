const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo
const User = db.User

// 檢視主頁，列出所有 todos
router.get('/', (req, res) => {
  const name = req.user.name
  const id = req.user.id

  return Todo.findAll({ raw: true, nest: true, where: { UserId: id } })
    .then((todos) => { return res.render('index', { todos: todos }) })
    .catch((error) => { return res.status(422).json(error) })
})

module.exports = router
