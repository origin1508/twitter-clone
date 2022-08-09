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

router.put("/:id/like", async (req, res, next) => {
    
    const postId = req.params.id;
    const userId = req.session.user._id;
    
    if (userId === undefined) return;
    
    // likes가 존재한다면 postId에 해당하는 게 존재하는가?
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    // 좋아요가 풀리지 않는 문제: 위에서 세션에서 likes를 가져왔기 때문에 현재 상태가 반영되지 않고 이전에 사용자 개체가 저장되어있기 때문에
    const option = isLiked ? '$pull' : '$addToSet' // 만약 배열에서 제거 하고 싶다면 $pull 연산자를 이용, 추가하고 싶다면 $addToSet
    
    console.log("is liked: ", isLiked);
    console.log("option: ", option);
    console.log("userId: ", userId);
    // Insert user like
    // 좋아요가 풀리지 않는 문제를 해결하기 위해 업데이트 된 User정보를 req.session.user에 담아 해결
    // findByIdAndUpdate는 바뀐 유저 정보를 반환하지 않는다. 옵션으로 new: true를 주어서 반환하게 만든다.
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400)
    }); // MongoDB는 텍스트를 필드명으로 예상하고 인식한다. option이 변수라는 것을 인식시키기 위해 []대괄호 안에 넣는다.

    // Insert post like
    const post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400)
    });

    res.status(200).json(post);
});

module.exports = router;