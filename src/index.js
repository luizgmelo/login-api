const express = require('express')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())
const port = 3000

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
})

const User = mongoose.model('User', UserSchema)


app.listen(port, async () => {
  await mongoose.connect('mongodb+srv://luizgmelo64:<password>@login-api.t0dohpy.mongodb.net/?retryWrites=true&w=majority&appName=login-api')
  console.log(`App running and listen at port ${port}`)
})
