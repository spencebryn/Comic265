const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', adminCode: '' };

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'This email has already been registered.';
        return errors;
    }

    // Validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.signup_post = async (req, res) => {
    const { email, password, adminCode } = req.body;
    console.log('req.body:', req.body);
    console.log('adminCode:', adminCode);

    try {
        let user;
        if (adminCode === 'admintest') {
            user = await AdminUser.create({ email, password, adminCode });
        } else {
            user = await User.create({ email, password, adminCode });
        }
        res.status(201).json(user);
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}



module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    res.send('sucessful login');
}

module.exports.adminLogin_get = (req, res) => {
    res.render('adminLogin');
}

module.exports.adminLogin_post = async (req, res) => {
    const { email, password, adminCode } = req.body;
    // Check if the adminCode is valid
    if (adminCode !== 'admintest') {
        return res.status(400).send('Invalid admin code');
    }
    
    // If adminCode is valid, proceed with login
    res.send('admin successful login');
}

