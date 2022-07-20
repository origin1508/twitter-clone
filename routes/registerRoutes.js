const express = require('express');
const app = express();
const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({ extended: false })); // body가 key value쌍으로 이루어진 값만 포함하겠다고 제한 true라면 모든 데이터 유형이 올 수 있음. 

router.get("/", (req, res, next) => {
    
    res.status(200).render("register"); 
})

router.post("/", (req, res, next) => {
    
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password) {

    }
    else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload); 
    }

    
})

module.exports = router;