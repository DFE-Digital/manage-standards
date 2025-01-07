const strapiService = require('../../services/strapiService');
const { validationResult } = require('express-validator');
const { validateAddAdmin } = require('../validation/authValidation');

exports.g_admin = async (req, res, next) => {

    try {
        const user = req.session.User;

        const standards = await strapiService.getDraftsForApproval();

        res.render('admin/index', { standards });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}


exports.g_review = async (req, res, next) => {

    try {
        const user = req.session.User;

        const standards = await strapiService.getDraftsForApproval();

        res.render('admin/review', { standards });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}

exports.g_standard = async (req, res, next) => {

    try {

        const standard = await strapiService.getStandardBySlug(req.params.slug);

        res.render('admin/standard/index', { standard });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}

exports.g_admins = async (req, res, next) => {

    try {
        const admins = await strapiService.getAdmins();

        res.render('admin/admins/index', { admins });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}


exports.g_person = async (req, res, next) => {

    try {
        const person = await strapiService.getUserById(req.params.id);

        res.render('admin/admins/person', { person });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}


// POSTS


exports.p_add_admin = [
    validateAddAdmin, // Middleware for validation rules
    async (req, res, next) => {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('admin/admins/add', { errors: errors.array(), body: req.body });
            }

            const { firstName, lastName, email } = req.body;

            await strapiService.addAdmin(firstName, lastName, email);

            res.redirect('/admin/admins');
        } catch (error) {
            console.error('Error adding admin:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to add admin. Please try again later.'
            });
        }
    }
]

exports.p_remove_admin = async (req, res, next) => {

    try {

        const { id } = req.body;

        await strapiService.removeAdmin(id);

        res.redirect('/admin/admins');
    } catch (error) {
        console.error('Error removing admin:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to remove admin. Please try again later.'
        });
    }
}