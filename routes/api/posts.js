const express = require('express');
const app = express();
const router = express.Router();

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

router.get("/", (req, res, next) => {
    Post.find({})
    .populate("postedBy")
    .sort({ "createdAt": 1 })
    .then(results => res.status(200).send(results))
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })
});

router.post("/", async (req, res, next) => {

    if (!req.body.content) {
        console.log("Content param not sent with request");
        res.sendStatus(400);
        return
    }

    const postData = {
        content: req.body.content,
        postedBy: req.session.user
    };

    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: "postedBy" }); // postedBy 필드를 User 컬렉션이랑 합친다?
        res.status(201).send(newPost);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })

});

module.exports = router;