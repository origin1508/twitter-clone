const express = require('express');
const app = express();
const router = express.Router();

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

router.get("/", async (req, res, next) => {
    // url query string postedBy=${profileUserId}&isReply=false
    const searchObj = req.query;

    if(searchObj.isReply !== undefined) {
        const isReply = searchObj.isReply == 'true';
        // MongoDB $exists 연산자 : 해당 필드가 존재해야 하는지 존재하지 않아야 하는지를 정함.
        // profile 페이지 Posts탭에는 답글을 빼고 보여주기 위해 $exists연산자를 이용함.
        searchObj.replyTo = { $exists: isReply };
        delete searchObj.isReply;
    }

    const results = await getPosts(searchObj);
    res.status(200).send(results);

});

router.get("/:id", async (req, res, next) => {

    const postId = req.params.id;
    
    let postData = await getPosts({ _id: postId });
    postData = postData[0]

    const results = {
        postData: postData
    };

    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId })
    res.status(200).send(results);
   
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

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

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

// like
router.put("/:id/like", async (req, res, next) => {
    
    const postId = req.params.id;
    const userId = req.session.user._id;
    
    if (userId === undefined) return;
    
    // likes가 존재한다면 postId에 해당하는 게 존재하는가?
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    // 좋아요가 풀리지 않는 문제: 위에서 세션에서 likes를 가져왔기 때문에 현재 상태가 반영되지 않고 이전에 사용자 개체가 저장되어있기 때문에
    const option = isLiked ? '$pull' : '$addToSet' // 만약 배열에서 제거 하고 싶다면 $pull 연산자를 이용, 추가하고 싶다면 $addToSet
    
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
        res.sendStatus(400);
    });

    res.status(200).json(post);
});


// retweet
router.post("/:id/retweet", async (req, res, next) => {

    const postId = req.params.id;
    const userId = req.session.user._id;
    
    if (userId === undefined) return;
    
    // Try and delete retweet
    const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });

    const option = deletedPost != null ? '$pull' : '$addToSet'

    let repost = deletedPost;

    if (repost === null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    };

    // Insert user retweet
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400)
    });

    // Insert post retweet
    const post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400)
    });

    res.status(200).json(post);
});

router.delete('/:id', (req, res, next) => {
    Post.findOneAndDelete(req.params.id)
        .then(() => res.sendStatus(202))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })
});

// 리팩터링 get 요청을 함수로 만들어 재사용하기 용이하게함
async function getPosts(filter) {
    return await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData") //retweetData에 저장된 post._id를 Post컬렉션에서 찾아 각각 retweetData에 추가한다.
    .populate("replyTo")
    .sort({ "createdAt": 1 })
    .then(async results => {
        results = await User.populate(results, { path: "replyTo.postedBy"})
        return await User.populate(results, { path: "retweetData.postedBy"}) // User 컬렉션을 resuls의 retweetData.postedBy로 찾아 추가한다.
    })
    .catch(err => console.log(err))

}

module.exports = router;