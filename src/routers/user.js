const express = require('express')
const router = new express.Router()
const User = require('../models/user')

router.post('/users', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send()
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404).send({ error: 'Task not found' })
    }
    res.send(user)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send()
    }
    res.status(500).send()
  }
})

router.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidaOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidaOperation) {
    return res.status(400).send({ error: 'Invalid updates' })
  }

  try {
    // In order to get middleware running
    const user = await User.findById(req.params.id)
    updates.forEach(update => user[update] = req.body[update])
    await user.save()

    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!user) {
      res.status(404).send({ error: 'User not found' })
    }
    res.send(user)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send({ error: 'User not found' })
    }
    if (error.name == 'ValidationError' || error.name == 'CastError') {
      return res.status(400).send()
    }
    res.status(500).send()
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      res.status(404).send({ error: 'User not found' })
    }
    res.send(user)
  } catch (error) {
    if (error.name == 'CastError' &&  error.kind == 'ObjectId') {
      return res.status(404).send({ error: 'User not found' })
    }
    res.status(500).send()
  }
})

module.exports = router