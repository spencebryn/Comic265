const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/authMiddleware');
const { requireAdminAuth } = require('./middleware/adminAuthMiddleware');
const { requireAuthOrAdminAuth } = require('./middleware/eitherAuthMiddleware');
const { checkUser } = require('./middleware/eitherAuthMiddleware');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.static('data'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = "mongodb+srv://spencebryn:ComicBook0@comicbook0.cvyq6cv.mongodb.net/allUser";
const port = process.env.PORT || 3000;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then((result) => app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  }))
  .catch((err) => console.log(err));


// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/login', (req, res) => res.render('login'));
app.get('/adminLogin', (req, res) => res.render('adminLogin'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/adminTool', requireAdminAuth, (req, res) => res.render('adminTool'));
app.get('/searchResult', requireAuthOrAdminAuth, (req, res) => res.render('searchResult'));
app.get('/comicView', requireAuthOrAdminAuth, (req, res) => res.render('comicView'));
app.get('/cart', (req, res) => {
  // Retrieve the user's email from the request parameters
  const userEmail = req.query.email;

  // Read the cart data from the cart.json file
  fs.readFile('data/cart.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the cart data as JSON
    const cartData = JSON.parse(data);

    // Check if the user's email exists in the cart data
    if (cartData.hasOwnProperty(userEmail)) {
      const cartItems = cartData[userEmail][0].userComics;
      res.render('cart', { cartItems });
    } else {
      // If the user's email is not found, display an empty cart
      res.render('cart', { cartItems: [] });
    }
  });
});
app.get('/data/comics.json', requireAuthOrAdminAuth, (req, res) => {
  res.sendFile(__dirname + '/data/comics.json');
});
app.get('/comicDetails', requireAuthOrAdminAuth, (req, res) => {
  const comicId = req.query.id; // Get the comic ID from the query parameter

  // Fetch the comic details using the comicId
  // You would typically retrieve the comic details from your data source (e.g., database) based on the comicId

  // Render the comicDetails template with the comic details
  res.render('comicDetails', { comicId });
});


app.post('/adminTool', (req, res) => {
  const newComic = req.body;
  newComic.price = Number(newComic.price);

  // Load existing comics
  const comics = require('./data/comics.json');

  // Check if the ID already exists
  const existingComic = comics.find(comic => comic.id === newComic.id);
  if (existingComic) {
    return res.status(400).json({ error: 'Comic with the same ID already exists' });
  }

  // Add the new comic to the array
  comics.push(newComic);

  // Save the updated comics array back to the file
  const fs = require('fs');
  fs.writeFile('./data/comics.json', JSON.stringify(comics), (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add new comic' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

// Server-side code
app.get('/adminTool/edit/:id', (req, res) => {
  const comicId = req.params.id;
  const comics = require('./data/comics.json');
  const comic = comics.find(comic => comic.id === comicId);

  if (!comic) {
    return res.status(404).json({ error: 'Comic not found' });
  }

  res.status(200).json(comic);
});

app.put('/adminTool/edit/:id', (req, res) => {
  const comicId = req.params.id;
  const updatedComic = req.body;
  updatedComic.price = Number(updatedComic.price);

  // Load existing comics
  const comics = require('./data/comics.json');

  // Find the index of the comic with the given ID
  const index = comics.findIndex(comic => comic.id === comicId);

  if (index === -1) {
    return res.status(404).json({ error: 'Comic not found' });
  }

  // Update the comic data
  comics[index] = { ...comics[index], ...updatedComic };

  // Save the updated comics array back to the file
  const fs = require('fs');
  fs.writeFile('./data/comics.json', JSON.stringify(comics), (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update comic' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

app.put('/api/cart', requireAuth, (req, res) => {
  const { email } = req.user;

  // Read the cart.json file
  fs.readFile('./data/cart.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    // Parse the cart data
    const cart = JSON.parse(data);

    // Find the user's cart entry
    const cartEntry = cart.find(entry => entry.email === email);

    if (cartEntry) {
      // Clear the cart items for the user
      cartEntry.items = [];

      // Update the cart.json file
      fs.writeFile('./data/cart.json', JSON.stringify(cart), 'utf8', err => {
        if (err) {
          console.error('Error clearing cart items:', err);
          res.status(500).json({ error: 'Server error' });
        } else {
          res.json({ message: 'Cart items cleared successfully' });
        }
      });
    } else {
      // User's cart entry not found
      res.status(404).json({ error: 'User cart not found' });
    }
  });
});


router.delete('/cart/:comicId', (req, res) => {
  const userEmail = req.user.email; // User's email from JWT authorization
  const comicId = req.params.comicId;

  const cartData = require('../data/cart.json');

  // Find the user's cart entry
  const cartEntry = cartData.find(entry => entry.userEmail === userEmail);

  if (!cartEntry) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  // Find the index of the comic in the user's cart
  const comicIndex = cartEntry.comics.findIndex(item => item.id === comicId);

  if (comicIndex === -1) {
    return res.status(404).json({ message: 'Comic not found in cart' });
  }

  // Remove the comic from the user's cart
  cartEntry.comics.splice(comicIndex, 1);

  // Update the cart.json file
  fs.writeFileSync('./data/cart.json', JSON.stringify(cartData, null, 2));

  res.json({ message: 'Comic removed from cart' });
});

module.exports = router;



app.use(authRoutes);