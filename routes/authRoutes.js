const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/adminLogin', authController.adminLogin_get);
router.post('/adminLogin', authController.adminLogin_post);
router.get('/adminSignup', authController.adminSignup_get);
router.post('/adminSignup', authController.adminSignup_post);
router.get('/logout', authController.logout_get);
router.get('/adminTool', authController.adminTool_get);
router.get('/adminTool/add', authController.adminToolAdd_get); // New route for add comic page
router.post('/adminTool', authController.adminToolAdd_post);
router.put('/adminTool/:comicId', authController.adminToolEdit_put);
router.post('/adminTool/add', authController.adminToolAdd_post); // New route for adding a comic
router.get('/adminTool/edit/:comicId', authController.adminToolEdit_get); // New route for edit comic page
router.get('/adminTool/edit', authController.adminToolEdit_get);
router.put('/adminTool/edit/:comicId', authController.adminToolEdit_put); // New route for updating a comic
router.get('/comicView', authController.comicView_get);
router.get('/getComics', authController.comicView_get);

module.exports = router;
