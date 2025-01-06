require('dotenv').config();
const { validationResult } = require('express-validator');
const { validateProfileName } = require('../validation/profileValidation');
const strapiService = require('../../services/strapiService');

exports.g_profileName = async (req, res) => {
    try {

        const user = req.session.User;

        return res.render('profile/name', {
            user: user,
        });
    } catch (error) {
        console.error('Error loading profile:', error.message);

        // Handle errors gracefully
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading your profile. Please try again later.',
        });
    }
};



exports.p_profileName = [
    validateProfileName, 
    async (req, res, next) => {
        try {
            // Validate request inputs
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('profile/name', {
                    errors: errors.array(),
                    user: req.session.User // Pass existing user data for rendering
                });
            }

            // Extract and sanitise input data
            const { firstName, lastName } = req.body;
            if (!firstName || !lastName) {
                return res.status(400).render('profile/name', {
                    errors: [{ msg: 'First name and last name are required.' }],
                    user: req.session.User,
                });
            }

            // Get the user from the session
            const user = req.session.User;

            // Update user data
            user.firstName = firstName.trim();
            user.lastName = lastName.trim();

            // Update the user in Strapi
            const updatedUser = await strapiService.updateUser(user);

            // Ensure the update was successful
            if (!updatedUser) {
                throw new Error('Failed to update user in Strapi.');
            }

            // Update the user in the session
            req.session.User.firstName = updatedUser.firstName;
            req.session.User.lastName = updatedUser.lastName;

            // Redirect to the profile page with a success message
            return res.redirect('/profile/name');
        } catch (error) {
            console.error('Error updating profile name:', error.message);

            // Handle errors gracefully
            return res.status(500).render('error', {
                title: 'Error',
                message: 'An error occurred while updating your profile. Please try again later.',
            });
        }
    }
];