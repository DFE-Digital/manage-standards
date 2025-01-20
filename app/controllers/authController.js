const { validationResult } = require('express-validator');
const { validateSignIn } = require('../validation/authValidation');
const strapiService = require('../../services/strapiService.js');
const notifyService = require('../../services/notifyService.js');


exports.g_signin = (req, res, next) => {
    return res.render('auth/sign-in');
};

exports.g_checktoken = async (req, res, next) => {

    try {
        const token = req.params.token;

        if (!token || typeof token !== 'string') {
            return res.redirect('/sign-in');
        }

        // Fetch user from Strapi service
        let user = await strapiService.getUserByToken(token);

        if (!user || user === null) {
            return res.redirect('/sign-in');
        }

        console.log('Check token')

        //await strapiService.recycleToken(user.email);
     
        // Set the user in the session
        req.session.User = user;

        if (!user.firstName || !user.lastName) {
            return res.redirect('/profile/name');
        }

        return res.redirect('/dashboard');

    }
    catch (error) {
        console.error('Error during token check:', error.message);
        return res.redirect('/sign-in');
    }
}

exports.g_signout = (req, res, next) => {

    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Session error:", err);
                return res.status(500).send("Could not sign out, please try again.");
            }

            res.clearCookie('connect.sid'); // Adjust cookie name if different
            res.redirect('/sign-in');
        });
    } catch (error) {
        next(error)
    }

};

exports.g_checkemail = (req, res, next) => {
    try {
        res.render('auth/check-email');
    } catch (error) {
        next(error)
    }
};

// POSTS

exports.p_signin = [
    validateSignIn, // Middleware for validation rules
    async (req, res, next) => {
        try {
            // Ensure session object exists
            req.session = req.session || {};

            // Validate request inputs
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('auth/sign-in', { errors: errors.array() });
            }

            const { EmailAddress } = req.body;

            // Validate and sanitise email input
            if (!EmailAddress || typeof EmailAddress !== 'string') {
                return res.render('auth/sign-in', { errors: [{ msg: 'Invalid email address' }] });
            }
            const email = EmailAddress.trim().toLowerCase();

            // Fetch user from Strapi service
            let user = await strapiService.getUser(email);

            // User doesn't exist
            if (!user || user === null) {

                // Create them in the User model
                user = await strapiService.createUser(email);

                // User creation failed catastrophically
                if (!user || user === null) {
                    return res.render('auth/sign-in', {
                        errors: [{ msg: 'An unexpected error occurred. Please try again later.' }]
                    });
                }
            }

            // We have a user found or created so lets send them a magic link
            await notifyService.sendMagicLink(user.email, user.token);

            return res.redirect('/auth/check-email');

        } catch (error) {
            console.error('Error during sign-in process:', error.message);

            // Render a generic error message to the user
            return res.render('auth/sign-in', {
                errors: [{ msg: 'An unexpected error occurred. Please try again later.' }]
            });
        }
    }
];

