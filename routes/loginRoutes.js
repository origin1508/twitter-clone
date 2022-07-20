const express = require('express');
const app = express();
const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");

// 서버에 대한 트래픽이 아닌 경로를 처리하는 것뿐
// "/": 이 루트의 최상위 라는 의미
router.get("/", (req, res, next) => {
    
    res.status(200).render("login"); 
})

module.exports = router;