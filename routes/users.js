const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')

router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (e) {
                res.status(500).json(e)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })
            if (!user) {
                return res.status(404).send("No user found with the mentioned ID")
            }
            res.status(200).json("Account has been updated")

        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can update only your account")
    }
})

router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            if (!user) {
                return res.status(404).send("No user found with the mentioned ID")
            }
            res.status(200).json("Account has been deleted")

        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can delete only your account")
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send("User not found!")
        }
        const { password, updatedAt, ...otherAttributes } = user._doc
        res.status(200).send(otherAttributes)
    } catch (e) {
        res.status(500).send(err)
    }
})

router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        const user = await User.findById(req.params.id)
        const currentUser = await User.findById(req.body.userId)
        if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } })
            await currentUser.updateOne({ $push: { followings: req.params.id}})
            res.status(200).json("User has been followed.")
        } else {
            res.status(403).json("You already follow this user")
        }
    } else {
        res.status(403).json("You cannot follow yourself!")
    }
})

router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        const user = await User.findById(req.params.id)
        const currentUser = await User.findById(req.body.userId)
        if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId } })
            await currentUser.updateOne({ $pull: { followings: req.params.id}})
            res.status(200).json("User has been unfollowed.")
        } else {
            res.status(403).json("You don't follow this user")
        }
    } else {
        res.status(403).json("You cannot unfollow yourself!")
    }
})

module.exports = router