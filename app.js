const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = "mongodb+srv://spencebryn:ComicBook0@comicbook0.cvyq6cv.mongodb.net/allUser";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', (req, res) => res.render('smoothies'));
app.get('/login', (req, res) => res.render('login'));
app.get('/adminLogin', (req, res) => res.render('adminLogin'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/adminTool', (req, res) => res.render('adminTool'));
app.get('/searchResult', (req, res) => res.render('searchResult'));
app.get('/comicView', (req, res) => res.render('comicView'));
app.get('/cart', (req, res) => res.render('cart'));
app.use(authRoutes);