const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/AdminUser');

const requireAuthOrAdminAuth = (req, res, next) => {
    const authToken = req.cookies.jwt;

    // check if jwt exists and it is verified for either user or admin
    if (authToken) {
        jwt.verify(authToken, 'comic secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                jwt.verify(authToken, 'comic admin secret', (err, decodedToken) => {
                    if (err) {
                        console.log(err.message);
                        res.redirect('/login');
                    } else {
                        console.log(decodedToken);
                        next();
                    }
                })
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

//check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        //check if user
        jwt.verify(token, 'comic secret', async (err, decodedToken) => {
            if (err) {
                //if not user, check if admin user
                jwt.verify(token, 'comic admin secret', async (err, decodedToken) => {
                    if (err) {
                        //if neither, reset
                        console.log(err.message);
                        res.locals.user = null;
                        next();
                    } else {
                        //if admin, log to local
                        console.log(decodedToken);
                        let user = await Admin.findById(decodedToken.id);
                        res.locals.user = user;
                        next();
                    }
                }); 
            } else {
                //if user, log to local
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        //if no token, reset
        res.locals.user = null;
        next();
    }
}



module.exports = { requireAuthOrAdminAuth, checkUser };
