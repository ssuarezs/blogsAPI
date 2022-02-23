const supertest = require('supertest')
const app = require('../app')

const User = require('../models/User')
const api = supertest(app)

const initialBlogs = [
	{
		title: "Mi primer blog",
		author: "Gridman",
		url: "https://google.com",
		likes: 3,
	},
	{
		title: "Mi segundo blog",
		author: "Gridman",
		url: "https://google.com",
		likes: 6,
	},
	{
		title: "Mi tercer blog",
		author: "Gridman",
		url: "https://google.com",
		likes: 6,
	}
]

const getAllContentFromBlogs = async () => {
	const response = await api.get('/api/blogs')
	return { 
		titles: response.body.map(blog => blog.title),
		response
	}
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
	initialBlogs,
	getAllContentFromBlogs,
	usersInDb,
	api
}
