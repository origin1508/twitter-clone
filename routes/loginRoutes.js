const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({ extended: false }));
// 서버에 대한 트래픽이 아닌 경로를 처리하는 것뿐
// "/": 이 루트의 최상위 라는 의미
router.get("/", (req, res, next) => {
    
    res.status(200).render("login"); 
});

router.post("/", async (req, res, next) => {
    
    const payload = req.body;

    if(req.body.logUsername && req.body.logPassword) {
        const user = await User.findOne({
            $or: [
                { username: req.body.logUsername },
                { email: req.body.logUsername }
            ]
        })
        .catch((err) => {
            console.log(err);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("login", payload); 
        });
        // 유저가 존재한다면 
        if (user != null) {
            const result = await bcrypt.compare(req.body.logPassword, user.password)
            // password가 일치한다면 session.user를 user로 할당
            if (result === true) {
                req.session.user = user;
                return res.redirect("/");
            }
            
        }
        // 일치하는 유저가 없다면 or password or logUserName이 다르거나 존재하지 않는 경우
        payload.errorMessage = "Login credentials incorrect.";
        return res.status(200).render("login", payload); 
    }
    // 필드가 비어있는 경우
    payload.errorMessage = "Make sure each field has a valid value.";
    res.status(200).render("login"); 
})
// router나 app의 HTTP method 함수의 가장 마지막 인자로 전달되는 함수를 Request Handler라고 부른다.
// 설정된 라우팅 경로에 해당하는 요청이 들어오면 Request Handler함수가 실행.. 요청을 확인하고 응답을 보내는 역할
module.exports = router;