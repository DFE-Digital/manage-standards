
const express = require('express');
const router = express.Router();

const homeController = require('./controllers/homeController.js');
const authController = require('./controllers/authController.js');
const profileController = require('./controllers/profileController.js');
const dashboardController = require('./controllers/dashboardController.js');
const standardsController = require('./controllers/standardsController.js');
const createController = require('./controllers/createController.js');
const adminController = require('./controllers/adminController.js');

function isAuthenticated(req, res, next) {
    if (req.session && req.session.User) {
        return next();
    } else {
        return res.redirect('/sign-in');
    }
}

// Home routes
router.get('/', isAuthenticated, homeController.g_homepage);

router.get('/sign-in', authController.g_signin);
router.get('/auth/t/:token', authController.g_checktoken);
router.get('/sign-out', authController.g_signout);
router.get('/check-email', authController.g_checkemail);
router.post('/sign-in', authController.p_signin);

// Profile routes
router.get('/profile/name', isAuthenticated, profileController.g_profileName);
router.post('/profile/name', profileController.p_profileName);

// Dashboard routes
router.get('/dashboard', isAuthenticated, dashboardController.g_dashboard);

// Standards routes
router.get('/standards', isAuthenticated, standardsController.g_standards);
router.get('/standard/:slug', isAuthenticated, standardsController.g_standardBySlug);
router.get('/standard/:slug/history', isAuthenticated, standardsController.g_standardHistoryBySlug);

// Create routes
router.get('/create', isAuthenticated, createController.g_start);
router.get('/create/getdraft/:id', isAuthenticated, createController.g_getdraft);
router.get('/create/new', isAuthenticated, createController.g_new);
router.get('/create/tasks', isAuthenticated, createController.g_tasks);
router.get('/create/title', isAuthenticated, createController.g_title);
router.get('/create/summary', isAuthenticated, createController.g_summary);
router.get('/create/purpose', isAuthenticated, createController.g_purpose);
router.get('/create/how-to-meet', isAuthenticated, createController.g_meet);
router.post('/create/title', isAuthenticated, createController.p_title);
router.post('/create/summary', isAuthenticated, createController.p_summary);
router.post('/create/purpose', isAuthenticated, createController.p_purpose);
router.post('/create/how-to-meet', isAuthenticated, createController.p_meet);

// Admin routes
router.get('/admin', isAuthenticated, adminController.g_admin);
router.get('/admin/review', isAuthenticated, adminController.g_review);
router.get('/admin/standard/:slug', isAuthenticated, adminController.g_standard);


module.exports = router; 