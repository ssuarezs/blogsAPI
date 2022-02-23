const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/User')

const {usersInDb, api} = require('./helpers')

describe('when a user is created', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation fails if the user props are invalid or missing', async () => {
    const usersAtStart = await usersInDb()

    const newUsers = [
      { username: 'lulu', password: '' },
      { username: '', password: 'melo' },
      { username: 'aoe', password: 'melo' },
      { username: 'lulu', password: 'htn' },
    ]

    for(let newUser of newUsers){
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(406)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username or password ar e invalid or missing')
    }

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
