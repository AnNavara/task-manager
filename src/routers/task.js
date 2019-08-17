const express = require('express')
const router = new express.Router()
const Task = require('../models/task')

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body)
  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({})
    res.send(tasks)
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      res.status(404).send({ error: 'Task not found' })
    }
    res.send(task)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send()
    }
    res.status(500).send()
  }
})

router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidaOperation = updates.every(update => allowedUpdates.includes(update))
  
  if (!isValidaOperation) {
    return res.status(400).send({ error: 'Invalid updates' })
  }

  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!task) {
      res.status(404).send({ error: 'Task not found' })
    }
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

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
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