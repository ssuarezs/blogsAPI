const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({}) 
  response.json(blogs)
})

blogsRouter.get('/:id', async (req, res, next) => {
	const { id } = req.params
	Blog.findById(id)
		.then(blog => {
			if(blog) return res.json(blog)
			res.status(404).end()
		})
		.catch(err => next(err))
})

blogsRouter.post('/', async (req, res, next) => {
	const newBlog = new Blog(req.body)

	newBlog
		.save()
		.then(result => {
			res.status(201).json(result)
		})
		.catch(err => next(err))
})

blogsRouter.delete('/:id', async (req, res, next) => {
	const { id } = req.params
	Blog.findByIdAndDelete(id)
		.then(() => res.status(204).end())
		.catch(err => next(err))
})

blogsRouter.put('/:id', async (req, res, next) => {
	const { id } = req.params
	const newBlog = req.body

	Blog.findByIdAndUpdate(id, newBlog, {new: true})
		.then(result => res.json(result))
		.catch(err => next(err))
})

module.exports = blogsRouter
