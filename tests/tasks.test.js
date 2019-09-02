const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
  userOneId,
  userOne,
  userTwo,
  taskOne,
  configureDatabase } = require('./fixtures/db')

beforeEach(configureDatabase)

describe('Test create task path', () => {
  test('Should create task for user', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: 'From my test'
      })
      .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
  })

  test('Should not create task with invalid description', async () => {
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: {}
      })
      .expect(400)
  })

  test('Should not create task with invalid status', async () => {
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        completed: {}
      })
      .expect(400)
  })
})

describe('Test update path', () => {
  test('Should not update task with invalid description', async () => {
    await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: {}
      })
      .expect(400)
  })

  test('Should not update task with invalid description', async () => {
    await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        completed: {}
      })
      .expect(400)
  })

  test('Should not update other users tasks', async () => {
    await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send({
        completed: true
      })
      .expect(404)
  })
})

describe('Test fetch path', () => {
  test('Should fetch userOne user tasks', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    expect(response.body.length).toEqual(2)
  })

  test('Should fetch task by Id', async () => {
    await request(app)
      .get(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })

  test('Should not fetch task by Id if unathenticated', async () => {
    await request(app)
      .get(`/tasks/${taskOne._id}`)
      .send()
      .expect(401)
  })

  test('Should not fetch other users tasks by Id', async () => {
    await request(app)
      .get(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404)
  })

  test('Should fetch only completed tasks', async () => {
    const response = await request(app)
      .get('/tasks?completed=true')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    const tasks = await Task.find({ author: userOne._id, completed: true })
    expect(response.body.length).toEqual(tasks.length)
  })

  test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
      .get('/tasks?completed=false')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    const tasks = await Task.find({ author: userOne._id, completed: false })
    expect(response.body.length).toEqual(tasks.length)
  })

  test('Should sort fetch by creation descending date', async () => {
    const response = await request(app)
      .get('/tasks?sortBy=createdAt_desc')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    expect(new Date(response.body[0].createdAt) > new Date(response.body[1].createdAt))
  })

  test('Should fetch first page of tasks', async () => {
    const response = await request(app)
      .get('/tasks?limit=1&skip=0')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    expect(response.body.length).toEqual(1)
  })
})



describe('Test delete path', () => {
  test('Should delete task', async () => {
    const response = await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
  })

  test('Should not delete task if unathenticated', async () => {
    const response = await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .send()
      .expect(401)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
  })

  test('Should not delete other users tasks', async () => {
    const response = await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
  })
})

