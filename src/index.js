const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const yup = require('yup')
const app = express()
app.use(express.json())
const port = 3000
const mySecret = "mySecret"

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

app.post('/login', async (req, res) => {
  // <TO-DO Validade login>
  const userPayload = new User({
    email: req.body.email,
    password: req.body.password
  })

  const query = User.where({email: userPayload.email})
  const user = await query.findOne()
  if (user != null) {
    if (user.password == userPayload.password) {
      const token = jwt.sign({email: user.email, username: user.username}, mySecret)
      res.send(token)
    } else {
      res.send('Ops... Wrong Email or Password!')
    }
  } else {
    res.send('Ops... Wrong Email or Password!')
  }

})

const registerSchema = yup.object({
  username: string().required().min(5),
  password: string().required().min(8).max(72),
  email: string().email().required()
}).noUnkown()

app.post('/register', async (req, res) => {
  // <TO-DO Validade register>
  registerSchema.validate(req.body)
  .catch(err => res.status(422).send(err))
  .then(register)
  .then((status,data) => res.status(status).send(data))
  .catch(err => {
    console.log(err)
    res.status(500).send(err)
  })
})

async function register(request) {
  // <TO-DO> Hash Password
  //
  const newUser = new User({
    username: request.body.username,
    password: request.body.password,
    email: request.body.email
  })

  await newUser.save()
  return {status:200, data:newUser}
}

app.listen(port, async () => {
  await mongoose.connect('mongodb+srv://luizgmelo64:<password>@login-api.t0dohpy.mongodb.net/?retryWrites=true&w=majority&appName=login-api')
  console.log(`App running and listen at port ${port}`)
})
