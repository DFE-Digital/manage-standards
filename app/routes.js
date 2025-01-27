
const express = require('express');
const router = express.Router();
const app = express();

const homeController = require('./controllers/homeController.js');
const authController = require('./controllers/authController.js');
const complianceController = require('./controllers/complianceController.js');
const guidanceController = require('./controllers/guidanceController.js');
const profileController = require('./controllers/profileController.js');
const dashboardController = require('./controllers/dashboardController.js');
const standardsController = require('./controllers/standardsController.js');
const createController = require('./controllers/createController.js');
const adminController = require('./controllers/adminController.js');
const testController = require('./controllers/testController.js');



function isAuthenticated(req, res, next) {
    try {
        console.log('***********************Checking authentication')
        if (req.session && req.session.User) {
            console.log('***********************User is authenticated')
            console.log(req.session.User)

            res.locals.user = req.session.User;
            return next();
        } else {
            console.log('***********************User is not authenticated')
            console.log(req.session)
            // if the route starts with router.get('/create/preview', then send to a page to say they need to be signed in, and then try again
            if (req.originalUrl.startsWith('/create/preview')) {
                return res.redirect('/need-to-sign-in');
            }
            return res.redirect('/sign-in');
        }
    }
    catch (error) {
        console.log(error)
    }
}

function isAdmin(req, res, next) {
    if (req.session.User.Administrator == true) {
        return next();
    } else {
        return res.redirect('/dashboard');
    }
}

// Home routes
router.get('/', isAuthenticated, homeController.g_homepage);


// Guidance routes
router.get('/guidance', guidanceController.g_guidance);
router.get('/guidance/:page', guidanceController.g_guidancepage);

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
router.get('/standards/standard/:documentId', isAuthenticated, standardsController.g_standard);
router.get('/standards/standard/manage/:documentId', isAuthenticated, standardsController.g_standard_manage);
router.get('/standards/standard/history/:documentId', isAuthenticated, standardsController.g_standard_history);
router.get('/standards/standard/edit-section/:section/:documentId', isAuthenticated, standardsController.g_standard_edit_section);
router.get('/standard/:slug', isAuthenticated, standardsController.g_standardBySlug);
router.get('/standard/:slug/history', isAuthenticated, standardsController.g_standardHistoryBySlug);

router.post('/standards/standard/publish', isAuthenticated, standardsController.p_publish_standard);
router.post('/standards/standard/updatedpublish', isAuthenticated, standardsController.p_updatedpublish);

//Editors
router.post('/standard/editor/summary', isAuthenticated, standardsController.p_edit_summary);
router.post('/standard/editor/purpose', isAuthenticated, standardsController.p_edit_purpose);

// Create routes
router.get('/create', isAuthenticated, createController.g_start);
router.get('/create/getdraft/:documentId', isAuthenticated, createController.g_getdraft);
router.get('/create/new', isAuthenticated, createController.g_new);
router.get('/create/tasks', isAuthenticated, createController.g_tasks);
router.get('/create/title', isAuthenticated, createController.g_title);
router.get('/create/summary', isAuthenticated, createController.g_summary);
router.get('/create/purpose', isAuthenticated, createController.g_purpose);
router.get('/create/how-to-meet', isAuthenticated, createController.g_meet);
router.get('/create/categories', isAuthenticated, createController.g_categories);
router.get('/create/sub-categories', isAuthenticated, createController.g_subcategories);
router.get('/create/governance', isAuthenticated, createController.g_governance);
router.get('/create/products', isAuthenticated, createController.g_products);
router.get('/create/products/add', isAuthenticated, createController.g_add_products);
router.get('/create/products/remove/:t/:documentId', isAuthenticated, createController.g_remove_product);
router.get('/create/exceptions', isAuthenticated, createController.g_exceptions);
router.get('/create/exceptions/add', isAuthenticated, createController.g_add_exception);
router.get('/create/exceptions/remove/:documentId', isAuthenticated, createController.g_remove_exception);
router.get('/create/people', isAuthenticated, createController.g_people);
router.get('/create/people/add', isAuthenticated, createController.g_add_people);
router.get('/create/people/remove/:t/:documentId', isAuthenticated, createController.g_remove_person);
router.get('/create/validity', isAuthenticated, createController.g_validity);
router.get('/create/legality', isAuthenticated, createController.g_legality);
router.get('/create/preview/:documentId', isAuthenticated, createController.g_preview);
router.get('/create/confirm-delete', isAuthenticated, createController.g_confirm_delete);
router.get('/create/complete', isAuthenticated, createController.g_complete);

router.post('/create/title', isAuthenticated, createController.p_title);
router.post('/create/summary', isAuthenticated, createController.p_summary);
router.post('/create/purpose', isAuthenticated, createController.p_purpose);
router.post('/create/how-to-meet', isAuthenticated, createController.p_meet);
router.post('/create/categories', isAuthenticated, createController.p_categories);
router.post('/create/subcategories', isAuthenticated, createController.p_subcategories);
router.post('/create/governance', isAuthenticated, createController.p_governance);
router.post('/create/legality', isAuthenticated, createController.p_legality);
router.post('/create/products/add', isAuthenticated, createController.p_add_products);
router.post('/create/products/remove', isAuthenticated, createController.p_remove_products);
router.post('/create/exception/remove', isAuthenticated, createController.p_remove_exception);
router.post('/create/validity', isAuthenticated, createController.p_validity);
router.post('/create/people/add', isAuthenticated, createController.p_add_person);
router.post('/create/people', isAuthenticated, createController.p_people);
router.post('/create/person/remove', isAuthenticated, createController.p_remove_person);
router.post('/create/exceptions/add', isAuthenticated, createController.p_add_exception);
router.post('/create/standard/submit', isAuthenticated, createController.p_submit);

// Admin routes
router.get('/admin', isAuthenticated, isAdmin, adminController.g_admin);
router.get('/admin/review', isAuthenticated, isAdmin, adminController.g_review);
router.get('/admin/standards', isAuthenticated, isAdmin, adminController.g_standards);
router.get('/admin/draft-standards', isAuthenticated, isAdmin, adminController.g_draftstandards);
router.get('/admin/admins', isAuthenticated, isAdmin, adminController.g_admins);
router.get('/admin/admins/person/:id', isAuthenticated, isAdmin, adminController.g_person);
router.get('/admin/standard/:documentId', isAuthenticated, isAdmin, adminController.g_standard);

router.post('/admin/admins/add', isAuthenticated, isAdmin, adminController.p_add_admin);
router.post('/admin/admins/remove', isAuthenticated, isAdmin, adminController.p_remove_admin);
router.post('/admin/standard/outcome', isAuthenticated, isAdmin, adminController.p_submit_outcome);



// Compliance routes
router.get('/compliance', isAuthenticated, complianceController.g_compliance);

router.get('/check-links', testController.checkSitemapLinks);

module.exports = router; 