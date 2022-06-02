const router = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/User')

//Register
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })

        const user = await newUser.save()
        res.status(200).json(user)
    } catch(e) {
        res.status(400).send(e)
    }
   
})

router.post('/login', async (req, res) => {
    const email = req.body.email
    try {
        const user = await User.findOne({ email })
    
        if (!user) {
            return res.status(404).send("User not found")
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password)

        if (!isMatch) {
            return res.status(400).send("Unable to login")
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(500).json(error)
    }
})

module.exports = router