const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postsRoute = require('./routes/posts')

dotenv.config({path: './config/dev.env'})

const port = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true }, () => {
    console.log("Database connection established")
});

//middleware
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

app.use('/api/users', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postsRoute)

app.get('/', (req, res) => {
    res.send("Welcome to home page")
})

app.get('/users', (req, res) => {
    res.send("Welcome to user page")
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})