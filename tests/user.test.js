const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, configureDatabase } = require('./fixtures/db')

beforeEach(configureDatabase)


describe('Test signup path', () => {
  test('Should signup a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Valera',
        email: 'valera@example.com',
        password: 'MyPass777!'
      })
      .expect(201)

    // Assert that database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
      user: {
        name: 'Valera',
        email: 'valera@example.com'
      },
      token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
  })

  test('Should not signup user with invalid email', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Mark',
        email: 'invalidemail',
        password: '12356passshh'
      })
      .expect(400)
  })

  test('Should not signup user with invalid name', async () => {
    await request(app)
      .post('/users')
      .send({
        name: {},
        email: 'validemail@example.com',
        password: '1pass!445$'
      })
      .expect(400)
  })

  test('Should not signup user with invalid password', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Validname',
        email: 'validemail@example.com',
        password: '123'
      })
      .expect(400)
  })
})

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assert that user login with second token
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existing user', async () => {
  await request(app).post('/users/login').send({
    email: 'dogeshit@example.com',
    password: 'verywrong123'
  }).expect(400)
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile not unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for unathenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
  
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

describe('Test update path', () => {
  test('Should update valid user fields', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: 'Volk'
      })
      .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Volk')
  })

  test('Should not update unathenticated user', async () => {
    await request(app)
      .patch('/users/me')
      .send({
        name: 'unathenticated'
      })
      .expect(401)
    
    const user = await User.findById(userOneId)
    expect(user.name).not.toEqual('unathenticated')
  })

  test('Should not update user with invalid name', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: {}
      })
      .expect(400)
  })

  test('Should not update user with invalid email', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        email: 'invalidemail'
      })
      .expect(400)
  })

  test('Should not update user with invalid password', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        password: '34'
      })
      .expect(400)
  })
})



test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({telemetry: '()=>user.tokens'})
    .expect(400)
})
