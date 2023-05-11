const jwt = require('jsonwebtoken');

//admin auth
const requireAdminAuth = (req, res, next) => {
    const authToken = req.cookies.jwt;

    //check jwt exists and it is verified
    if (authToken) {
        jwt.verify(authToken, 'comic admin secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/adminLogin');
            } else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/adminLogin');
    }
}

module.exports = { requireAdminAuth };