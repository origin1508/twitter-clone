const express = require('express');
const app = express();
const router = express.Router();
// bcrypt 는 암호 해싱 함수 패키지
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema')

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({ extended: false })); // body가 key value쌍으로 이루어진 값만 포함하겠다고 제한 true라면 모든 데이터 유형이 올 수 있음. 

router.get("/", (req, res, next) => {
    
    res.status(200).render("register"); 
})

router.post("/", async (req, res, next) => {
    
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const payload = req.body;

    if(firstName && lastName && username && email && password) {
        // 컬렉션에서 하나의 문서를 찾는 것을 의미 (문서 = database table)
        const user = await User.findOne({
            // or 연산자를 통해서 username또는 email을 찾는다. 해당하는 user가 있다면
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((err) => {
            console.log(err);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("register", payload); 
        });
        
        if(user == null) {
            // No user found
            const data = req.body;

            data.password = await bcrypt.hash(password, 10)// hash하려는 값, 해싱 계산을 몇번 수행할 것인지(2^10),

            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect('/');
            })

        }
        else {
            // User found
            if (email == user.email) {
                payload.errorMessage = "Email already in use.";
            }
            else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render("register", payload); 
        }
    }
    else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload); 
    }

    
})

module.exports = router;