const express = require('express');
const app = express();
const router = express.Router();

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

router.put("/:userId/follow", async (req, res, next) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (user === null) return res.sendStatus(404);

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? '$pull' : '$addToSet'; // $pull 배열에서 제거, $addToSet 배열에서 추가
    
    // follow를 한 유저의 id를 following에 추가하고 following이 업데이트된 user 정보로 session 갱신
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400)
    });
    
    // following 유저의 followers에 follow를 한 user._id 즉 로그인한 user의 id를 추가
    User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } })
    .catch(err => {
        console.log(err);
        res.sendStatus(400)
    });

    res.status(200).send(req.session.user);

});


module.exports = router;