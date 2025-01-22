const { validationResult } = require('express-validator');
const strapiService = require('../../services/strapiService');
const validation = require('../validation/createValidation');
const notifyService = require('../../services/notifyService.js');

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
        const { documentId } = req.params;
        const standard = await strapiService.getStandardDraft(documentId, req.session.User.id);

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

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

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

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        return res.render('create/summary', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_categories = async (req, res, next) => {
    try {

        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        // Get categories to render list

        const categories = await strapiService.getCategories();

        //console.log(categories);

        return res.render('create/categories', { standard, categories });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_subcategories = async (req, res, next) => {
    try {

        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);


        const subcategories = await strapiService.getSubCategories();

        const filteredSubCategories = filterSubCategoriesByStandard(standard, subcategories);

        return res.render('create/sub-categories', { standard, subcategories, filteredSubCategories });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

const filterSubCategoriesByStandard = (standard, subCategories) => {
    try {
        // Validate inputs
        if (!standard || !Array.isArray(standard.categories) || standard.categories.length === 0) {
            throw new Error("Invalid standard or missing categories.");
        }

        if (!Array.isArray(subCategories)) {
            throw new Error("Invalid subCategories data.");
        }

        // Extract the documentIds of the categories in the standard
        const categoryDocumentIds = standard.categories.map(category => category.documentId);

        // Filter subCategories that match the category documentIds
        const filteredSubCategories = subCategories.filter(subCategory =>
            subCategory.category &&
            categoryDocumentIds.includes(subCategory.category.documentId)
        );

        return filteredSubCategories;
    } catch (error) {
        console.error(`Error filtering subcategories: ${error.message}`);
        return [];
    }
};


exports.g_purpose = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);
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


        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);
        return res.render('create/how-to-meet', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_products = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }


        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);
        return res.render('create/products', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_add_products = async (req, res, next) => {

    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = req.session.Standard
        const products = await strapiService.getProducts();

        return res.render('create/add-product', { standard, products });

    } catch (error) {
        console.error('Error fetching data:', error);

        renderErrorPage(res);
    }
};

//g_remove_product
exports.g_remove_product = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const { t, documentId } = req.params;

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        // Find the appropriate product to remove

        //console.log(standard)

        if (t === 'a') {

            const product = standard.approvedProducts.find(p => p.documentId === documentId);
            if (!product) {
                return res.redirect('/create/products');
            }

            return res.render('create/remove-product', { standard, product, t });
        }

        if (t === 't') {

            const product = standard.toleratedProducts.find(p => p.documentId === documentId);
            if (!product) {
                return res.redirect('/create/products');
            }

            return res.render('create/remove-product', { standard, product, t });
        }


        return res.redirect('/create/products');
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};


exports.g_exceptions = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }


        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);
        return res.render('create/exceptions', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_add_exception = async (req, res, next) => {

    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = req.session.Standard

        return res.render('create/add-exception', { standard });

    } catch (error) {
        console.error('Error fetching data:', error);

        renderErrorPage(res);
    }
};

exports.g_remove_exception = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const { documentId } = req.params;

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        // Find the appropriate product to remove

        //console.log(standard)


        const exception = standard.exceptions.find(p => p.documentId === documentId);
        if (!exception) {
            return res.redirect('/create/exceptions');
        }

        return res.render('create/remove-exception', { standard, exception });


    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_people = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        return res.render('create/people', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};



exports.g_add_people = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = req.session.Standard

        const people = await strapiService.getPeople();

        return res.render('create/add-people', { standard, people });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_validity = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }
        const standard = req.session.Standard
        return res.render('create/validity', { standard });
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

exports.g_preview = async (req, res, next) => {

    try {
        // Get the draft using the documentId

        const { documentId } = req.params;

        const standard = await strapiService.getStandardByDocumentId(documentId);

        if (!standard) {
            return res.redirect('/create');
        }

        return res.render('shared/standard/index', { standard });
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_remove_person = async (req, res, next) => {

    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const { t, documentId } = req.params;

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        if (t === 'o') {

            const person = standard.owners.find(p => p.documentId === documentId);
            if (!person) {
                return res.redirect('/create/people');
            }

            return res.render('create/remove-person', { standard, person, t });
        }

        if (t === 'c') {

            const person = standard.contacts.find(p => p.documentId === documentId);
            if (!person) {
                return res.redirect('/create/people');
            }

            return res.render('create/remove-person', { standard, person, t });
        }


        return res.redirect('/create/people');
    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};

exports.g_confirm_delete = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }
        const standard = req.session.Standard
        return res.render('create/confirm-delete', { standard });

    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
}

exports.g_complete = async (req, res, next) => {
    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        return res.render('create/complete', { standard });
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

                await strapiService.createAuditLog({
                    data: {
                        title: 'Standard updated',
                        entity: 'Standard',
                        entityId: standard.documentId,
                        user: user.documentId,
                        auditDate: new Date(),
                        details: 'create.p_title',
                        oldValue: standard.title,
                        newValue: title,
                    },
                });

                req.session.Standard = updatedStandard;


            } else {
                // If no standard exists, create a new one
                const newStandard = await strapiService.createStandardDraft(user.id, title);
                await strapiService.createAuditLog({
                    data: {
                        title: 'Standard created',
                        entity: 'Standard',
                        entityId: newStandard.documentId,
                        user: req.session.User.documentId,
                        auditDate: new Date(),
                        details: 'create.p_title',
                        oldValue: '',
                        newValue: 'Draft'
                    },
                });

                req.session.Standard = newStandard; // Store the newly created standard

            }

            return res.redirect('/create/summary');
        } catch (error) {
            console.error('Error creating standard:', error);
            return renderErrorPage(res, 'Failed to create standard. Please try again later.');
        }
    }
];

exports.p_submit = async (req, res, next) => {

    try {
        if (!req.session.Standard) {
            return res.redirect('/create');
        }

        const { action } = req.body;
        const standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

        if (action === 'Submit') {
            const templateParams = {
                standardName: standard.title,
                serviceURL: process.env.serviceURL,
                standardId: standard.documentId,
            };

            await strapiService.createAuditLog({
                data: {
                    title: 'Standard submitted',
                    entity: 'Standard',
                    entityId: standard.documentId,
                    user: req.session.User.documentId ,
                    auditDate: new Date(),
                    details: 'create.p_submit',
                    oldValue: 'Draft',
                    newValue: 'Approval',
                },
            });

            if (standard.owners && standard.owners.length > 0) {

                const publishersList = [];
                publishersList.push(standard.creator.email);

                standard.owners.forEach(owner => {
                    publishersList.push(owner.email);
                });

                const uniquePublishersList = [...new Set(publishersList)];

                uniquePublishersList.forEach(email => {
                    notifyService.sendNotifyEmail(process.env.EMAIL_STANDARD_SUBMITTED, email, templateParams);
                });
            }

            // Notify the forum (EMAIL_STANDARD_SUBMITTED_TO_FORUM and EMAIL_FORUM)
            notifyService.sendNotifyEmail(process.env.EMAIL_STANDARD_SUBMITTED, process.env.EMAIL_FORUM, templateParams);

            await strapiService.submitStandard(standard.documentId);

            return res.redirect('/create/complete');

        }

        if (action === 'Delete') {
            return res.redirect('/create/confirm-delete');
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        renderErrorPage(res);
    }
};


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
            return res.redirect('/create/categories');
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
            return res.redirect('/create/legality');
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

// POST: Categories

exports.p_categories = [
    validation.validateCategories,
    async (req, res) => {
        const errors = validationResult(req);
        const { category } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        const categories = await strapiService.getCategories();

        if (!errors.isEmpty()) {
            return res.render('create/categories', {
                standard: standard,
                errors: errors.array(),
                categories
            });
        }

        try {
            const updatedStandard = await strapiService.updateCategories(standard.documentId, category);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/sub-categories');
        } catch (error) {
            console.error('Error updating categories:', error);
            return renderErrorPage(res, 'Failed to update categories. Please try again later.');
        }
    }
];

exports.p_subcategories = [
    validation.validateSubCategories,
    async (req, res) => {
        const errors = validationResult(req);
        const { categories } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        const subcategories = await strapiService.getSubCategories();

        if (!errors.isEmpty()) {
            const filteredSubCategories = filterSubCategoriesByStandard(standard, subcategories);
            return res.render('create/sub-categories', {
                standard: standard,
                errors: errors.array(),
                categories,
                filteredSubCategories
            });
        }

        try {
            const updatedStandard = await strapiService.updateSubCategories(standard.documentId, categories);


            return res.redirect('/create/products');
        } catch (error) {
            console.error('Error updating subcategories:', error);
            return renderErrorPage(res, 'Failed to update subcategories. Please try again later.');
        }
    }
];


// POST: p_add_products

exports.p_add_products = [
    validation.validateProducts,
    async (req, res) => {
        const errors = validationResult(req);
        const { product, producttype } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            const products = await strapiService.getProducts();
            return res.render('create/add-product', {
                standard: standard,
                errors: errors.array(),
                formData: product,
                products
            });
        }

        try {
            const updatedStandard = await strapiService.updateProducts(standard.documentId, product, producttype);
            req.session.Standard = updatedStandard;
            return res.redirect('/create/products');
        } catch (error) {
            console.error('Error updating products:', error);
            return renderErrorPage(res, 'Failed to update products. Please try again later.');
        }
    }
];

// p_remove_products

exports.p_remove_products = async (req, res) => {
    const { productDocumentId, productType } = req.body;

    let standard = {}

    if (req.session.Standard) {
        standard = req.session.Standard;
    }

    if (productType === 'a') {
        await strapiService.removeApprovedProduct(standard.documentId, productDocumentId);
    }

    if (productType === 't') {
        await strapiService.removeToleratedProduct(standard.documentId, productDocumentId);
    }

    standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

    req.session.Standard = standard;
    return res.redirect('/create/products');


};

exports.p_remove_exception = async (req, res) => {

    const { exceptionDocumentId } = req.body;

    let standard = {}

    if (req.session.Standard) {
        standard = req.session.Standard;
    }
    await strapiService.removeException(standard.documentId, exceptionDocumentId);

    standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

    req.session.Standard = standard;

    return res.redirect('/create/exceptions');

};




// Save validityPeriod

exports.p_validity = [
    validation.validateValidity,
    async (req, res) => {
        const errors = validationResult(req);
        const { validity } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/validity', {
                standard: standard,
                errors: errors.array(),
                validity
            });
        }

        try {
            const updatedStandard = await strapiService.updateValidity(standard.documentId, validity);
            standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);
            return res.redirect('/create/governance');
        } catch (error) {
            console.error('Error updating validity:', error);
            return renderErrorPage(res, 'Failed to update validity. Please try again later.');
        }
    }
];


//p_add_exception
exports.p_add_exception = [
    validation.validateException,
    async (req, res) => {
        const errors = validationResult(req);
        const { exception, exceptiondetail } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            return res.render('create/add-exception', {
                standard: standard,
                errors: errors.array(),
                formBody: req.body
            });
        }

        try {
            const updatedStandard = await strapiService.updateException(standard.documentId, exception, exceptiondetail);

            standard = await strapiService.getStandardDraft(standard.documentId, req.session.User.id);
            return res.redirect('/create/exceptions');
        } catch (error) {
            console.error('Error updating exceptions:', error);
            return renderErrorPage(res, 'Failed to update exceptions. Please try again later.');
        }
    }
];



//p_add_person 
// body: contactType (Owner or Contact), people (user.documentId), firstName, lastName, email, jobRole

exports.p_add_person = [
    validation.validatePerson,
    async (req, res) => {

        const errors = validationResult(req);
        const { contactType, people, firstName, lastName, email, jobRole } = req.body;

        let standard = {}

        if (req.session.Standard) {
            standard = req.session.Standard;
        }

        if (!errors.isEmpty()) {
            const people = await strapiService.getPeople();
            return res.render('create/add-people', {
                standard: standard,
                errors: errors.array(),
                formBody: req.body,
                people
            });
        }

        try {
            const updatedStandard = await strapiService.updatePeople(standard.documentId, contactType, people, firstName, lastName, email, jobRole);


            return res.redirect('/create/people');
        } catch (error) {
            console.error('Error updating people:', error);
            return renderErrorPage(res, 'Failed to update people. Please try again later.');
        }
    }

];



exports.p_remove_person = async (req, res) => {
    const { personDocumentId, personType } = req.body;

    let standard = {}

    if (req.session.Standard) {
        standard = req.session.Standard;
    }

    if (personType === 'o') {
        await strapiService.removeOwner(standard.documentId, personDocumentId);
    }

    if (personType === 'c') {
        await strapiService.removeContact(standard.documentId, personDocumentId);
    }

    standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

    req.session.Standard = standard;
    return res.redirect('/create/people');

};


exports.p_people = async (req, res) => {

    let standard = {}

    if (req.session.Standard) {
        standard = req.session.Standard;
    }

    standard = await strapiService.getStandardDraft(req.session.Standard.documentId, req.session.User.id);

    if (standard.owners.length === 0) {

        // No owners so create a validation result error
        const errors = validationResult(req);

        errors.errors.push({ msg: 'At least one owner is required.' });

        return res.render('create/people', {
            standard: standard,
            errors: errors.array()
        });
    }

    return res.redirect('/create/validity');

};
