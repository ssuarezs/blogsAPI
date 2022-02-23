const usersRouter = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (req, res, next) => {
  const users = await User.find({}) 
		.populate('blogs', {
			url: 1,
			title: 1,
			author: 1,
			id: 1,
		})
  res.json(users)
})

usersRouter.post('/', async (req, res, next) => {
	const { username, name, password } = req.body

	const existingUser = await User.findOne({ username })
	if(existingUser) {
		return res.status(400).json({
			error: 'username must be unique'
		})
	}

	if(!( username && (username.length > 3) && password && (password.length > 3) )) {
		return res.status(406).send({ 
			error: 'username or password ar e invalid or missing' 
		})
	}

	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)

	const user = new User({
		username,
		name,
		passwordHash
	})

	const savedUser = await user.save()
	res.status(201).json(savedUser)
})

module.exports = usersRouter
