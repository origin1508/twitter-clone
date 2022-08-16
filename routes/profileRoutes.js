const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }
    res.status(200).render("profilePage", payload); 
});

router.get("/:username", async (req, res, next) => {

    const payload = await getPayload(req.params.username, req.session.user);

    res.status(200).render("profilePage", payload); 
});

// replies tab
router.get("/:username/replies", async (req, res, next) => {

    const payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = 'replies';
    // payload selectedTab 프로퍼티에 담아 Tab이 선택된 것인지 아닌것인지를 판별하기 위해
    res.status(200).render("profilePage", payload); 
});

async function getPayload(username, userLoggedIn) {
    let user = await User.findOne({ username: username });

    if (user === null) {
        // username이 username이 아닌 user._id일 경우를 처리
        // 다른 사용자의 프로필을 눌렀을 때를 가정
        user = await User.findById(username);

        if (user === null) {
            // DB에 해당하는 유저가 존재하지 않을 경우
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJS: JSON.stringify(userLoggedIn),
            };
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJS: JSON.stringify(userLoggedIn),
        profileUser: user
    }
};

module.exports = router;