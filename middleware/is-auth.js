const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    let decodedToken;

    if (!authHeader) {
        req.isAuth = false; //параметр isAuth создается, он не существует в запросе
        return next()
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === '') {
        req.isAuth = false;
        return next()
    }

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (err) {
        req.isAuth = false;
        return next()
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next()
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    next()
};