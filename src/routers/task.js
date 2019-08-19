const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    author: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/tasks', auth, async (req, res) => {
  try {
    // const tasks = await Task.find({ author: req.user._id })
    await req.user.populate('tasks').execPopulate()

    if (!req.user.tasks) {
      res.status(404).send({ error: 'Tasks not found' })
    }
    res.send(req.user.tasks)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send({ error: 'Tasks not found' })
    }
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findById(req.params.id)
    const task = await Task.findOne({ _id: req.params.id, author: req.user._id })

    if (!task) {
      res.status(404).send({ error: 'Task not found' })
    }
    res.send(task)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send({ error: 'Task not found' })
    }
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidaOperation = updates.every(update => allowedUpdates.includes(update))
  
  if (!isValidaOperation) {
    return res.status(400).send({ error: 'Invalid updates' })
  }

  try {
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    // In order to get middleware running
    const task = await Task.findOne({ _id: req.params.id, author: req.user._id })
    
    if (!task) {
      res.status(404).send({ error: 'Task not found' })
    }
    updates.forEach(update => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send({ error: 'Task not found' })
    }
    if (error.name == 'ValidationError' || error.name == 'CastError') {
      return res.status(400).send()
    }
    res.status(500).send()
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id)
    const task = await Task.findOneAndDelete({ _id: req.params.id, author: req.user._id })
    if (!task) {
      res.status(404).send({ error: 'Task not found' })
    }
    res.send(task)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send({ error: 'Task not found' })
    }
    res.status(500).send()
  }
})

module.exports = router