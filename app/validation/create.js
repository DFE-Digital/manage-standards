const { body, check, validationResult } = require('express-validator');

// Helper function to check if a field exists and is not empty
const checkExists = (field, errorMessage) => [
    check(field)
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error(errorMessage);
            }
            return true;
        })
];

// Individual validations for specific fields
exports.validateTitle = checkExists('title', 'Enter a title');
exports.validateSummary = checkExists('summary', 'Enter a summary');
exports.validateCategory = checkExists('categories', 'Select a category');
exports.validateSubCategories = checkExists('subcategories', 'Select a sub-category');
exports.validatePurpose = checkExists('purpose', 'Enter a purpose');
exports.validateGuidance = checkExists('guidance', 'Enter guidance for how to meet the standard');
exports.validateGovernance = checkExists('governance', 'Enter information about the governance of the standard');
exports.validateValidity = checkExists('validity', 'Select an option');

// Validation for approved fields, flattening the nested array by spreading each result

exports.validateApprovedFields = [
    body().custom((_, { req }) => {
        const { approved_products, approved_name, approved_vendor, approved_version, approved_usecase } = req.body;

console.log(req.body);

        // Check if `approved_products` (existing product) is provided
        const hasProducts = !!approved_products;

        // Check if any of the other fields are provided
        const hasApprovedFields = approved_name || approved_vendor || approved_version || approved_usecase;

        // If `approved_products` is selected, ensure no other fields are filled
        if (hasProducts && hasApprovedFields) {
            req.body.approved_products = "";
            throw new Error('Select either an existing product or fill out the approved fields, not both.');
        }

        // If neither `approved_products` nor any approved fields are provided, throw an error
        if (!hasProducts && !hasApprovedFields) {
            throw new Error('You must select an existing product or provide details for the approved fields.');
        }

        return true;
    }),

    // Field-level validation for the other 4 fields when `hasProducts` is false
    body('approved_name').custom((value, { req }) => {
        if (!req.body.approved_products && !value) {
            throw new Error('Enter an approved name');
        }
        return true;
    }),
    body('approved_vendor').custom((value, { req }) => {
        if (!req.body.approved_products && !value) {
            throw new Error('Enter an approved vendor');
        }
        return true;
    }),
    body('approved_version').custom((value, { req }) => {
        if (!req.body.approved_products && !value) {
            throw new Error('Enter an approved version');
        }
        return true;
    }),
    body('approved_usecase').custom((value, { req }) => {
        if (!req.body.approved_products && !value) {
            throw new Error('Enter an approved use case');
        }
        return true;
    }),
];


exports.validateToleratedFields = [
    body().custom((_, { req }) => {
        const { tolerated_products, tolerated_name, tolerated_vendor, tolerated_version, tolerated_usecase } = req.body;

        console.log(req.body);

        const hasProducts = !!tolerated_products;

        const hasToleratedFields = tolerated_name || tolerated_vendor || tolerated_version || tolerated_usecase;

        // If `tolerated_products` is selected, ensure no other fields are filled
        if (hasProducts && hasToleratedFields) {
            req.body.tolerated_products = "";
            throw new Error('Select either an existing product or fill out the tolerated fields, not both.');
        }

        // If neither `tolerated_products` nor any approved fields are provided, throw an error
        if (!hasProducts && !hasToleratedFields) {
            throw new Error('You must select an existing product or provide details for the tolerated fields.');
        }

        return true;
    }),

    // Field-level validation for the other 4 fields when `hasProducts` is false
    body('tolerated_name').custom((value, { req }) => {
        if (!req.body.tolerated_products && !value) {
            throw new Error('Enter an tolerated name');
        }
        return true;
    }),
    body('tolerated_vendor').custom((value, { req }) => {
        if (!req.body.tolerated_products && !value) {
            throw new Error('Enter an tolerated vendor');
        }
        return true;
    }),
    body('tolerated_version').custom((value, { req }) => {
        if (!req.body.tolerated_products && !value) {
            throw new Error('Enter an tolerated version');
        }
        return true;
    }),
    body('tolerated_usecase').custom((value, { req }) => {
        if (!req.body.tolerated_products && !value) {
            throw new Error('Enter an tolerated use case');
        }
        return true;
    }),
];


// Example for validateExceptionFields with specific validation logic (as discussed previously)
exports.validateExceptionFields = [
    ...checkExists('exception', 'Enter an exception summary'),
    check('exceptiondetail')
        .trim()
        .notEmpty()
        .withMessage('Enter details of the exception')
        .isLength({ max: 1000 })
        .withMessage('Details of the exception must be 1000 characters or fewer')
];

exports.validateContactFields = [
    // Validate `contactType` is not empty
    check('contactType')
        .notEmpty()
        .withMessage('Select a contact type'),

    // Conditional validation for `contactEmail` and `contactName`
    body('contactEmail').custom((value, { req }) => {
        // Skip validation if `people` is provided
        if (req.body.people) {
            return true;
        }
        // If `people` is not provided, ensure `contactEmail` and `contactName` are filled
        if (!value) {
            throw new Error('Enter a contact email');
        }
        return true;
    }),
    body('contactName').custom((value, { req }) => {
        // Skip validation if `people` is provided
        if (req.body.people) {
            return true;
        }
        // If `people` is not provided, ensure `contactName` is filled
        if (!value) {
            throw new Error('Enter a contact name');
        }
        return true;
    }),


    // Validate that at least one option is chosen (either `people` or `contactEmail` and `contactName`)
    body().custom((_, { req }) => {
        const { contactEmail, contactName, people } = req.body;
        if (!people && (!contactEmail || !contactName)) {
            throw new Error('Select an existing person or enter new contact details');
        }
        return true;
    })
];