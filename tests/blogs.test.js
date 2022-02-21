const mongoose = require('mongoose')
const Blog = require('../models/Blog')

const {initialBlogs, getAllContentFromBlogs, api} = require('./helpers')

beforeEach(async () => {
	await Blog.deleteMany({})
	for(let blog of initialBlogs) {
		const blogObject = new Blog(blog)
		await blogObject.save()
	}
})

describe('GET /api/blogs', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

})

afterAll(() => {
  mongoose.connection.close()
})
