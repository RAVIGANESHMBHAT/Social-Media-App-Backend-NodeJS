const router = require('express').Router()

const Post = require('../models/Post')
const User = require('../models/User')

//Create a post
router.post('/', async (req, res) => {
    try {
        const savedPost = new Post(req.body)
        await savedPost.save()
        res.status(200).json(savedPost)
    }
    catch(e) {
        res.status(500).json(e)
    }
})

//Update a post created by you
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("The post has been updated.")
        } else {
            res.status(403).json("you can update only your posts.")
        }
    } catch (e) {
        res.sendStatus(500).json(e)
    }
})

//Delete a post created by you
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json("The post has been deleted.")
        } else {
            res.status(403).json("you can delete only your posts.")
        }
    } catch (e) {
        res.sendStatus(500).json(e)
    }
})

//Like or Dislike a post
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            res.status(200).json("The post has been liked.")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).json("The post has been disliked.")
        }
    }
    catch (e) {
        res.status(500).json(e)
    }

})

//Get a post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (e) {
        res.status(500).json(e)
    }
})

// router.get('/timelines', async (req, res) => {
//     try {
//         //const currentUser = await User.findById(req.body.userId)
//         res.status(200).json("Done")
//     } catch (e) {
//         res.status(500).json(e)
//     }
// })

router.get('/timeline/all', async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId)
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendPosts = await Promise.all(
                currentUser.followings.map(friendId => {
                    return Post.find({ userId: friendId})
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))//[...userPosts, ...friendPosts]
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = router