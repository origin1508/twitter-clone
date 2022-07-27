const express = require('express'); // express 변수에 express모듈을 선언
const app = express(); // app 변수에 express 인스턴스를 생성
const port = 3003;
const middleware = require('./middleware');
const path = require('path');
const mongoose = require('./database'); // mongoose는 mogodb에 쉽게 접근하게 만들어준다.
// const bodyParser = require('body-parser') Express v4.16.0기준 빌트인 되어있음
const session = require('express-session'); // session은 로그인 여부를 확인하는 방법 모든 사용자는 고유한 세션을 갖게된다.

const server = app.listen(port, () => console.log("server listening on port " + port));

// view engine setting pug라는 view engine을 사용
app.set("view engine", "pug");
app.set("views", "views"); // views는 views를 참조

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false })); // body가 key value쌍으로 이루어진 값만 포함하겠다고 제한 true라면 모든 데이터 유형이 올 수 있음. 
app.use(express.static(path.join(__dirname, "public"))); // static파일의 경로를 public폴더로 지정

app.use(session({
    secret: "bbq chips",
    resave: true,
    saveUninitialized: false
}));

// Routes
const loginRoute = require('./routes/loginRoutes'); // loginRoutes모듈을 불러온다.
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');


app.use("/login", loginRoute); // 라우터 모듈 연결.. loginRoute모듈을 /login 하위 경로로 연결하겠다
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
    // 사이트 루트에 접근할 때 먼저 middleware단계를 실행한다.
    // payload는 함수나 페이지나 요청같은 것을 저장하는 객체
    var payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user
    }
// middleware를 이용하면 로그인이 되어있는지 검사를 하여 리다이렉팅을 할 수 있다.
    res.status(200).render("home", payload); // 페이지(템플릿을 렌더링할.), 페이로드(보내고 싶은 데이터.)- => 서버에서 템플릿으로 데이터를 전달
})