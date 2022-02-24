const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')

const { tokenExtractor } = require('../utils/middleware')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({})
		.populate('user', { 
			username: 1,
			name: 1,
			id: 1
		}) 
  response.json(blogs)
})

blogsRouter.get('/:id', async (req, res, next) => {
	const { id } = req.params
	const blog = await Blog.findById(id)
	if(blog) return res.json(blog)
	res.status(404).end()
})

blogsRouter.post('/', tokenExtractor, async (req, res, next) => {
	const { title, author, url, likes } = req.body
	const { userId } = req

	const user = await User.findById(userId)

	const newBlog = new Blog({
		title,
		author,
		url,
		likes,
		user: user._id 
	})

	if(!newBlog || !newBlog.title || !newBlog.url){
		return res.status(400).json({ error: 'title or url is missing' })
	}

	const savedBlog = await newBlog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()

	res.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', tokenExtractor, async (req, res, next) => {
	const { id } = req.params
	const { userId } = req

	const blog = await Blog.findById(id)
	const user = await User.findById(userId)

	if (!( user && blog )){
		return res.status(400).send({ error: 'user or blog not found' })
	}

	if (!( blog.user.toString() === userId.toString() )) {
		return res.status(401).send({ error: 'the user is not the ower to delete blog' })
	}

	user.blogs = user.blogs.filter(blog => blog.id !== id)
	await user.save()
	await Blog.findByIdAndDelete(id)

	res.status(204).end()
})

blogsRouter.put('/:id', async (req, res, next) => {
	const { id } = req.params
	const newBlog = req.body
	const result = await Blog.findByIdAndUpdate(id, newBlog, {new: true})
	res.json(result)
})

module.exports = blogsRouter
