const { validationResult } = require('express-validator');
const strapiService = require('../../services/strapiService');
const validation = require('../validation/createValidation');

// Helper function to handle error pages consistently
function renderErrorPage(res, message = 'Failed to load page. Please try again later.', title = 'Error', status = 500) {
    console.error(`Error: ${message}`);
    return res.status(status).render('error', { title, message });
}

// Helper function to handle error pages consistently
function renderErrorPage(res, message = 'Failed to load page. Please try again later.', title = 'Error', status = 500) {
    console.error(`Error: ${message}`);
    return res.status(status).render('error', { title, message });
}

exports.g_start = async (req, res, next) => {
    try {
        const user = req.session.User;
        req.session.Standard = null;

        const drafts = await strapiService.getStandardsDraftByUser(user.id);
        res.render('create/start', { drafts });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_getdraft = async (req, res, next) => {
    try {
        const { id } = req.params;
        const standard = await strapiService.getStandardDraft(id, req.session.User.id);

        if (!standard) {
            return res.redirect('/create');
        }

        req.session.Standard = standard;

        return res.redirect('/create/tasks');

    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_new = async (req, res, next) => {
    try {

        if (!req.session.Standard) {
            req.session.Standard = {};
        }

        return res.render('create/tasks');
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_tasks = async (req, res, next) => {
    try {

        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = req.session.Standard

        return res.render('create/tasks', { standard });

    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_title = async (req, res, next) => {
    try {

        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = req.session.Standard
        return res.render('create/title', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_summary = async (req, res, next) => {
    try {

        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = req.session.Standard

        return res.render('create/summary', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_purpose = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }


        const standard = req.session.Standard
        return res.render('create/purpose', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_meet = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }


        const standard = req.session.Standard
        return res.render('create/how-to-meet', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_governance = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }


        const standard = req.session.Standard
        return res.render('create/governance', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_legality = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }


        const standard = req.session.Standard
        return res.render('create/legality', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

// POST: Title
exports.p_title = [
    validation.validateTitle,
    async (req, res) => {
        const errors = validationResult(req);
        const { title } = req.body;

        // Ensure `req.session.Standard` is initialised
        let standard = req.session.Standard || {};

        if (!errors.isEmpty()) {
            return res.render('create/title', {
                standard: standard,
                errors: errors.array(),
                title
            });
        }

        try {
            const user = req.session.User;

            if (standard.documentId) {
                // If the standard exists, update the title
                const updatedStandard = await strapiService.updateTitle(standard.documentId, title);
                req.session.Standard = updatedStandard; // Update the session with the new object
            } else {
                // If no standard exists, create a new one
                const newStandard = await strapiService.createStandardDraft(user.id, title);
                req.session.Standard = newStandard; // Store the newly created standard
            }

            return res.redirect('/create/summary');
        } catch (error) {
            console.error('Error creating standard:', error);
            return renderErrorPage(res, 'Failed to create standard. Please try again later.');
        }
    }
];


// POST: Summary
exports.p_summary = [
    validation.validateSummary,
    async (req, res) => {
        const errors = validationResult(req);
        const { summary } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/summary', {
                standard: standard,
                errors: errors.array(),
                summary
            });
        }

        try {
            const updatedStandard = await strapiService.updateSummary(standard.documentId, summary);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/purpose');
        } catch (error) {
            console.error('Error updating summary:', error);
            return renderErrorPage(res, 'Failed to update summary. Please try again later.');
        }
    }
];

// POST: Purpose
exports.p_purpose = [
    validation.validatePurpose,
    async (req, res) => {
        const errors = validationResult(req);
        const { purpose } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/purpose', {
                standard: standard,
                errors: errors.array(),
                purpose
            });
        }

        try {
            const updatedStandard = await strapiService.updatePurpose(standard.documentId, purpose);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/how-to-meet');
        } catch (error) {
            console.error('Error updating purpose:', error);
            return renderErrorPage(res, 'Failed to update purpose. Please try again later.');
        }
    }
];

// POST: How to Meet
exports.p_meet = [
    validation.validateMeet,
    async (req, res) => {
        const errors = validationResult(req);
        const { meet } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/how-to-meet', {
                standard: standard,
                errors: errors.array(),
                meet
            });
        }

        try {
            const updatedStandard = await strapiService.updateMeet(standard.documentId, meet);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/category');
        } catch (error) {
            console.error('Error updating how-to-meet:', error);
            return renderErrorPage(res, 'Failed to update how-to-meet. Please try again later.');
        }
    }
];


// POST: Governance

exports.p_governance = [
    validation.validateGovernance,
    async (req, res) => {
        const errors = validationResult(req);
        const { governance } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/governance', {
                standard: standard,
                errors: errors.array(),
                governance
            });
        }

        try {
            const updatedStandard = await strapiService.updateGovernance(standard.documentId, governance);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/tasks');
        } catch (error) {
            console.error('Error updating governance:', error);
            return renderErrorPage(res, 'Failed to update governance. Please try again later.');
        }
    }
];

// POST: Legality

exports.p_legality = [
    validation.validateLegality,
    async (req, res) => {
        const errors = validationResult(req);
        const { legality } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/legality', {
                standard: standard,
                errors: errors.array(),
                legalStandard: legality
            });
        }

        try {
            const updatedStandard = await strapiService.updateLegality(standard.documentId, legality);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/tasks');
        } catch (error) {
            console.error('Error updating legality:', error);
            return renderErrorPage(res, 'Failed to update legality. Please try again later.');
        }
    }
];