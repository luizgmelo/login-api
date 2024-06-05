const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const yup = require('yup')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
app.use(express.json())
const port = 3000
const mySecret = "mySecret"
const saltRounds = 10

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
})

const User = mongoose.model('User', UserSchema)


app.get('/hello', (req, res) => {
  let token = req.headers['authorization']
  if (token) {
    token = token.replace(/^Bearer\s+/, "")
    jwt.verify(token, mySecret, (err, decoded) => {
      if (err) {
        return res.sendStatus(403)
      } else {
        return res.send(`Hello ${decoded['username']}`)
      }
    })
  } else {
    return res.sendStatus(403)
  }

})

const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required().min(8).max(72)
}).noUnknown()

app.post('/login', (req, res) => {
  loginSchema.validate(req.body)
  .catch(err => res.status(422).send(err.errors))
  .then(login)
  .then(({status,data}) => {
    res.status(status).send(data)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send(err)
  })
})

async function login(request) {
  const userPayload = new User({
    email: request.email,
    password: request.password
  })

  const query = User.where({email: userPayload.email})
  const user = await query.findOne()

  console.log(user.password)

  if (user != null) {
    const match = bcrypt.compare(userPayload.password, user.password)
    if (match) {
      const token = jwt.sign({email: user.email, username: user.username}, mySecret)
      return {status:200, data: {token}}
    } 
  } 
  return {status:403, data:'Wrong email or password!'}
}

const registerSchema = yup.object({
  username: yup.string().required().min(5),
  password: yup.string().required().min(8).max(72),
  email: yup.string().email().required()
}).noUnknown()

app.post('/register', async (req, res) => {
  registerSchema.validate(req.body)
  .then(register)
  .catch(err => res.status(422).send(err.errors))
  .then(({status, data}) => {
    res.status(status).send(data)
  })
  .catch(err => {
    console.log(err)
    res.status(500).send(err)
  })
})

async function register(request) {
  const passwordHashed = bcrypt.hashSync(request.password, saltRounds)
  
  const newUser = new User({
    username: request.username,
    password: passwordHashed,
    email: request.email
  })

  await newUser.save()
  return {status:200, data:{newUser}}
}

app.listen(port, async () => {
  await mongoose.connect(`mongodb+srv://luizgmelo64:${process.env.MONGODB_MY_PASSWORD}@login-api.t0dohpy.mongodb.net/?retryWrites=true&w=majority&appName=login-api`)
  console.log(`App running and listen at port ${port}`)
})
