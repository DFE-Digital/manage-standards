const strapiService = require('../../services/strapiService');
const { validationResult } = require('express-validator');
const { validateAddAdmin } = require('../validation/authValidation');
const validation = require('../validation/createValidation');
const notifyService = require('../../services/notifyService.js');

exports.g_admin = async (req, res, next) => {

    try {
        const user = req.session.User;

        const standards = await strapiService.getDraftsForApproval();
        const countStandards = await strapiService.getCountStandards();
        const countDraftStandards = await strapiService.getCountStandards(true);

        return res.render('admin/index', { standards, countStandards, countDraftStandards });
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
        const categories = await strapiService.getCategoryTitles();
        return res.render('admin/standards/index', { standards, categories });

    } catch (error) {

        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}

exports.g_draftstandards = async (req, res, next) => {

    try {
        const standards = await strapiService.getStandards(true); 
        const categories = await strapiService.getCategoryTitles();
        return res.render('admin/standards/index', { standards, drafts: true, categories });

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
        // Fetch the standard by documentId
        const standard = await strapiService.getStandardByDocumentId(req.params.documentId);

        // Extract and sort the standard_comments 
        // if stadard_comments is not available, set it to an empty array



        const standardComments = standard.standard_comments ?? [];
        
        const sortedStandardComments = standardComments.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

        // Pass the standard and sorted comments to the view
        return res.render('admin/standard/index', {
            standard,
            sortedStandardComments
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
};

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

        // ToDo - Display a success message on the admins page when removed.

        res.redirect('/admin/admins');
    } catch (error) {
        console.error('Error removing admin:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to remove admin. Please try again later.'
        });
    }
}


exports.p_submit_outcome = [
    validation.validateApproval,
    async (req, res, next) => {

        try {

            const { documentId, outcome, comments } = req.body;
            const standard = await strapiService.getStandardByDocumentId(documentId);
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

            // send notify email
            if (outcome === 'Approved') {

                await strapiService.createAuditLog({
                    data: {
                        title: 'Standard review outcome',
                        entity: 'Standard',
                        entityId: standard.documentId,
                        user: req.session.User.documentId,
                        auditDate: new Date(),
                        details: 'admin.p_submit_outcome',
                        oldValue: standard.stage.title,
                        newValue: 'Approved',
                    },
                });

                const publishersList = [];
                publishersList.push(standard.creator.email);

                standard.owners.forEach(owner => {
                    publishersList.push(owner.email);
                });

                const uniquePublishersList = [...new Set(publishersList)];

                const templateParams = {
                    standardName: standard.title,
                    serviceURL: process.env.serviceURL,
                    standardId: standard.documentId,
                    comments: comments ?? 'No additional comments provided'
                };

                uniquePublishersList.forEach(email => {
                    notifyService.sendNotifyEmail(process.env.EMAIL_FORUM_APPROVED_TEMPLATE_ID, email, templateParams);
                });
            }

            if (outcome === 'Rejected') {

                await strapiService.createAuditLog({
                    data: {
                        title: 'Standard review outcome',
                        entity: 'Standard',
                        entityId: standard.documentId,
                        user: req.session.User.documentId,
                        auditDate: new Date(),
                        details: 'admin.p_submit_outcome',
                        oldValue: standard.stage.title,
                        newValue: 'Rejected',
                    },
                });

                const publishersList = [];
                publishersList.push(standard.creator.email);

                standard.owners.forEach(owner => {
                    publishersList.push(owner.email);
                });

                const uniquePublishersList = [...new Set(publishersList)];

                const templateParams = {
                    standardName: standard.title,
                    serviceURL: process.env.serviceURL,
                    standardId: standard.documentId,
                    reason: comments ?? 'No reason provided'
                };

                uniquePublishersList.forEach(email => {
                    notifyService.sendNotifyEmail(process.env.EMAIL_FORUM_REJECTED_TEMPLATE_ID, email, templateParams);
                });
            }

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