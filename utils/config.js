require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_DB_URI_TEST
  : process.env.MONGO_DB_URI

module.exports = {
  MONGODB_URI,
  PORT
}
