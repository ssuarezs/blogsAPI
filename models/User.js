const { Schema, model } = require('mongoose')

const userSchema = new Schema({
	username: String,
	name: String,
	passwordHash: String,
	blogs: [{
		type: Schema.Types.ObjectId,
		ref: 'Blog'
	}]
})

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id
		delete returnedObject._id
		delete returnedObject.__v

		delete returnedObject.passwordHash
	}
})

const User = new model('User', userSchema)

module.exports = User
