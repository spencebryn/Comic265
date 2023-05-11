const jwt = require('jsonwebtoken');

//user auth
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    //check jwt exists and it is verified
    if (token) {
        jwt.verify(token, 'comic secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/login');
    }
}



module.exports = { requireAuth };