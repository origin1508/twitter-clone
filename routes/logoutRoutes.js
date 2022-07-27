const express = require('express');
const app = express();
const router = express.Router();
// bcrypt 는 암호 해싱 함수 패키지
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema')

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({ extended: false })); 

router.get("/", (req, res, next) => {
    
    if(req.session) {
        req.session.destroy(() => {
            res.redirect("/login")
        })
    }
});


module.exports = router;