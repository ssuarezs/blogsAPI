const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Blog = require('../models/Blog')
const User = require('../models/Blog')

const {initialBlogs, getAllContentFromBlogs, api} = require('./helpers')

let token = ''

beforeEach(async () => {
  await User.deleteMany({})

  const password = 'secret'
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username: 'root', passwordHash, blogs: [] })
  await user.save()

  const tokenResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'secret' })
    .expect(200)
  token = `Bearer ${tokenResponse.body.token}`

	await Blog.deleteMany({})
	for(let blog of initialBlogs) {
    const blogObject = new Blog({...blog, user: user._id})
		const savedBlog = await blogObject.save()
	}

})

describe('GET /api/blogs', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs have the correspond length', async () => {
    const {response} = await getAllContentFromBlogs()
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('get an specific blog', async () => {
    const { response } = await getAllContentFromBlogs()
    const id = response.body[0].id
    await api
      .get(`/api/blogs/${id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a blog that do not exist can not be founded', async () => {
    await api
      .get('/api/blogs/6213f9ad4a52d9973287b54b')
      .expect(404)
  })

})

describe('GET /api/blogs, have the prop', () => {

  test('id', async () => {
    const {response} = await getAllContentFromBlogs()
    const ids = response.body.map(blog => blog.id)
    for (let id of ids) {
      expect(id).toBeDefined() 
    }
  })
  
  test('like', async () => {
    const {response} = await getAllContentFromBlogs()
    const numlikes = response.body.map(blog => blog.likes)
    for (let likes of numlikes) {
      expect(typeof likes).toBe('number')
      expect(likes >= 0).toBe(true)
    }
  })

})

describe('POST /api/blogs', () => {

  test('a new blogs can be added', async () => {
    const newBlog = {
      title: "Added Blog",
      author: "Gridman",
      url: "https://google.com",
      likes: 5,
    }
    await api
      .post('/api/blogs')
      .set({ Authorization: token })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const {titles, response} = await getAllContentFromBlogs()
    expect(response.body).toHaveLength(initialBlogs.length+1)
    expect(titles).toContain(newBlog.title)
  })
  
  test('a new blogs without title or url can not be added', async () => {
    const blogWOT = { url: "https://google.com" }
    const blogWOU = { title: "Added Blog"}
    const blogComplete = { title: "Added Blog", url: "https://google.com" }
    const blogWO = {}
    await api
      .post('/api/blogs').set({ Authorization: token }).send(blogWOT).expect(400)
    await api
      .post('/api/blogs').set({ Authorization: token }).send(blogWOU).expect(400)
    await api
      .post('/api/blogs').set({ Authorization: token }).send(blogWO).expect(400)
    await api
      .post('/api/blogs').set({ Authorization: token }).send(blogComplete).expect(201)
  })

})

describe('DELETE /api/blogs', () => {

  test('a blog can be deleted', async () => {
    const { response } = await getAllContentFromBlogs()
    const id = response.body[0].id
    const oldTitle = response.body[0].title
    await api
      .delete(`/api/blogs/${id}`)
      .set({ Authorization: token })
      .expect(204)
    const {titles, response: secondRes} = await getAllContentFromBlogs()
    expect(secondRes.body).toHaveLength(initialBlogs.length-1)
    expect(titles).not.toContain(oldTitle)
  })
  
  test('a blog that do not exist can not be deleted', async () => {
    await api
      .delete(`/api/blogs/1234`)
      .set({ Authorization: token })
      .expect(400)

    const { contents, response } = await getAllContentFromBlogs()
    expect(response.body).toHaveLength(initialBlogs.length)
  })

})

describe('PUT /api/blogs', () => {

  test('a blog can be updated', async () => {
    const { response } = await getAllContentFromBlogs()
    const { body: blogs } = response
    const blogToUpdate = blogs[0]
    const newBlog = {title: 'Updated blog', url: 'google.com'}

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)

    const { titles, response: secondRes } = await getAllContentFromBlogs()
    expect(secondRes.body).toHaveLength(initialBlogs.length)
    expect(titles).not.toContain(blogToUpdate.title)
    expect(titles).toContain(newBlog.title)
  })

  test('a blog that do not exist can not be updated', async () => {
    const newBlog = {title: 'blog updated', url: 'google.com'}

    await api
      .put(`/api/blogs/6213a070453aa8a1fffb53da`)
      .send(newBlog)
      .expect(200)

    const { titles, response } = await getAllContentFromBlogs()
    expect(response.body).toHaveLength(initialBlogs.length)
    expect(titles).not.toContain(newBlog.title)
  })

})


afterAll(() => {
  mongoose.connection.close()
})
