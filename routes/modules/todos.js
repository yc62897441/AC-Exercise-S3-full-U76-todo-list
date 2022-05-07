const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo

// 檢視單一 todo 資訊
router.get('/todo/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

// 檢視新增 todo 頁面
router.get('/new', (req, res) => {
  res.render('new')
})

// 檢視編輯 todo 頁面
router.get('/edit/:id', (req, res) => {
  const userId = req.user.id
  const todoId = req.params.id

  Todo.findOne({ raw: true, nest: true, where: { id: todoId, UserId: userId } })
    .then(todo => {
      const { name, isDone } = todo
      console.log(name, isDone)
      res.render('edit', { name, isDone, todoId })
    })
    .catch(error => console.log(error))
})

// 新增單一 todo
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

// 編輯單一 todo
router.put('/edit/:id', (req, res) => {
  console.log(req.body)
  const userId = req.user.id
  const todoId = req.params.id
  let { name, isDone } = req.body
  if (isDone === 'on') {
    isDone = true
  } else {
    isDone = false
  }

  Todo.findOne({ where: { id: todoId, UserId: userId } })
    .then(todo => {
      todo.name = name
      todo.isDone = isDone
      todo.save()
    })
    .then(() => {
      res.redirect('/')
    })
    .catch(error => console.log(error))
})

// 刪除單一 todo
router.delete('/:id', (req, res) => {
  const todoId = req.params.id
  const userId = req.user.id

  Todo.findOne({ where: { id: todoId, UserId: userId } })
    .then(todo => {
      todo.destroy()
    })
    .then(() => {
      res.redirect('/')
    })
    .catch(error => console.log(error))
})

module.exports = router
