const strapiService = require('../../services/strapiService');
const { validationResult } = require('express-validator');
const { validateAddAdmin } = require('../validation/authValidation');
const validation = require('../validation/createValidation');

exports.g_admin = async (req, res, next) => {

    try {
        const user = req.session.User;

        const standards = await strapiService.getDraftsForApproval();
        const countStandards = await strapiService.getCountStandards();

        return res.render('admin/index', { standards, countStandards });
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

        return res.render('admin/review', { standards });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}

exports.g_standards = async (req, res, next) => {

    try {
        const standards = await strapiService.getStandards();
        return res.render('admin/standards/index', { standards });

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
        const standard = await strapiService.getStandardByDocumentId(req.params.documentId);
        const reviewhistory = await strapiService.getStandardComments(req.params.documentId);

        return res.render('admin/standard/index', { standard, reviewhistory });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}

exports.g_standard_outcome = async (req, res, next) => {
    try {


        const standard = await strapiService.getStandardByDocumentId(req.params.documentId);

        return res.render('admin/standard/review-outcome', { standard });
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

        return res.render('admin/admins/index', { admins });
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

        return res.render('admin/admins/person', { person });
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

//p_submit_outcome

exports.p_submit_outcome = [
    validation.validateApproval,
    async (req, res, next) => {

        try {

            const { documentId, outcome, comments } = req.body;
            const standard = await strapiService.getStandardByDocumentId(req.params.documentId);
            const errors = validationResult(req);

            console.log(documentId)
            console.log(outcome)
            console.log(comments)

            if (!errors.isEmpty()) {
                return res.render('admin/standard/index', { errors: errors.array(), body: req.body, standard });
            }

            await strapiService.submitOutcome(documentId, outcome);
            // Save standard-comments

            await strapiService.saveStandardComments(documentId, req.session.User.documentId, outcome, comments);

            return res.redirect('/admin/standard/' + documentId);   
        } catch (error) {
            console.error('Error submitting outcome:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to submit outcome. Please try again later.'
            });
        }
    }
]