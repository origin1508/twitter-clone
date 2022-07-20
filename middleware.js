exports.requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // 다음 미들웨어로 넘어간다는 의미
    }
    else {
        return res.redirect('/login');
    }
}