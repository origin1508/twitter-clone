const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware')
const path = require('path')
// const bodyParser = require('body-parser') Express v4.16.0기준 빌트인 되어있음

const server = app.listen(port, () => console.log("server listening on port " + port));

app.set("view engine", "pug");
app.set("views", "views");

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // static파일의 경로를 public폴더로 지정

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const bodyParser = require('body-parser');

app.use("/login", loginRoute);
app.use("/register", registerRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
    // 사이트 루트에 접근할 때 먼저 middleware단계를 실행한다.
    // payload는 함수나 페이지나 요청같은 것을 저장
    var payload = {
        pageTitle: "Home"
    }

    res.status(200).render("home", payload); // 페이지(템플릿을 렌더링할.), 페이로드(보내고 싶은 데이터.)- => 서버에서 템플릿으로 데이터를 전달
})