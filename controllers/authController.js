const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const Comic = require('../models/Comic');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
mongoose.set('useFindAndModify', false);
const comicData = require('../data/comicData');

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', adminCode: '' };

    //incorrect email
    if (err.message === 'This email is incorrect.') {
        errors.email = 'This email is not registered.'
    }

    //incorrect password
    if (err.message === 'This password is incorrect.') {
        errors.password = 'This password is incorrect.'
    }

    //incorrect admin code
    if (err.message === 'This admin code is incorrect.') {
        errors.adminCode = 'This admin code is incorrect.'
    }

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

    if (err.message.includes('admin validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    

    return errors;
}

//create JWT
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'comic secret', {
        expiresIn: maxAge
    })
}

//create admin JWT
const createAdminToken = (id) => {
    return jwt.sign({ id }, 'comic admin secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.adminSignup_get = (req, res) => {
    res.render('adminSignup');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.create({ email, password });
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json(user);
    }
    catch(err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
   
  }
  

module.exports.adminSignup_post = async (req, res) => {
    const { email, password, adminCode } = req.body;
    try {
      const admin = await AdminUser.create({ email, password, adminCode });
      const token = createAdminToken(admin._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json(admin);
    }
    catch(err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
   
  }


module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.adminLogin_get = (req, res) => {
    res.render('adminLogin');
}

module.exports.adminLogin_post = async (req, res) => {
    const { email, password, adminCode } = req.body;
    console.log(req.body);
    try {
        const admin = await AdminUser.login(email, password, adminCode);
        const token = createAdminToken(admin._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ admin: admin._id })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}

module.exports.adminTool_get = (req, res) => {
    res.render('adminTool');
}

module.exports.adminToolAdd_get = (req, res) => {
    res.render('adminTool/add');
}

module.exports.adminToolAdd_post = async (req, res) => {
    const { comicId, title, price, brand, publisher, artist, coverArtist, writer, inventoryAmount } = req.body;
  
    try {
      const comic = await Comic.create({ comicId, title, price, brand, publisher, artist, coverArtist, writer, inventoryAmount });
      res.status(201).json(comic);
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  };
  

  module.exports.adminToolEdit_get = (req, res) => {
    res.render('adminTool/edit');
}

 module.exports.adminToolEdit_put = async (req, res) => {
  const comicId = req.params.comicId; // Retrieve the comicId from the request parameters
  const { title, price, brand, publisher, artist, coverArtist, writer, inventoryAmount } = req.body;

  try {
    const updatedComic = await Comic.findOneAndUpdate(
      { comicId },
      { $set: { title, price, brand, publisher, artist, coverArtist, writer, inventoryAmount } },
      { new: true }
    );

    if (!updatedComic) {
      // Comic not found, handle appropriately
      return res.status(404).json({ error: 'Comic not found' });
    }

    res.json(updatedComic);
  } catch (err) {
    // Handle error
    res.status(400).json({ error: err.message });
  }
};

module.exports.comicView_get = async (req, res) => {
  try {
    const comics = await comicData.getComics();
    res.render('comicView', comics);
  } catch (err) {
    // Handle error
    res.status(400).json({ error: err.message });
  }
};
  

module.exports.cookieExport = (req, res) => {
  const token = req.cookies.jwt;
  // Use the token as needed
};