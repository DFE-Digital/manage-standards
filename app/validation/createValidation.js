const { check } = require('express-validator');


const validateTitle = [
    check('title')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter a title');
            }
            return true;
        })
];

const validateSummary = [
    check('summary')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter a summary');
            }
            return true;
        })
];

const validatePurpose = [
    check('purpose')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter a purpose');
            }
            return true;
        })
];

const validateMeet = [
    check('meet')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter a meet');
            }
            return true;
        })
];

const validateGovernance = [
    check('governance')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter governance information');
            }
            return true;
        })
];


const validateLegality = [
    check('legality')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter legality information');
            }
            return true;
        })
];

const validateCategories = [
    check('category')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Select a category');
            }
            return true;
        })
];

const validateSubCategories = [
    check('categories')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Select a subcategory');
            }
            return true;
        })
]; 


const validateProducts = [
    check('product')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Select a product');
            }
            return true;
        }),
    check('producttype')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Select the product status');
            }
            return true;
        })
];

const validateValidity = [
    check('validity')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Select a validity');
            }
            return true;
        })
];

//validateApproval
const validateApproval = [
    check('outcome')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Select an approval');
            }
            return true;
        })
];

// eception and exceptiondetail
const validateException = [
    check('exception')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter an exception summary');
            }
            return true;
        }),
    check('exceptiondetail')
        .trim()
        .custom((value) => {
            if (value === '') {
                throw new Error('Enter an exception detail');
            }
            return true;
        })
];

// contactType (Owner or Contact), people (user.documentId), firstName, lastName, email, jobRole
// If people exists, don't use the firstName, lastName, email, jobRole
// If people doesn't exist, use the firstName, lastName, email, jobRole
// if both exist, throw error saying choose someone or add new, don't do both

const validatePerson = [
    // Validate contactType
    check('contactType')
        .trim()
        .notEmpty()
        .withMessage('Select a contact type'),

    // Custom validation for people and personal details
    check('people')
        .custom((value, { req }) => {
            const { firstName, lastName, email, jobRole } = req.body;

            // Check if `people` is provided
            if (value && (firstName || lastName || email || jobRole)) {
                throw new Error('Choose someone or add new person, but not both');
            }

            // Check if neither `people` nor personal details are provided
            if (!value && !(firstName && lastName && email && jobRole)) {
                throw new Error(
                    'Choose an existing person or add a new person.'
                );
            }

            return true;
        })
];



module.exports = {
    validateTitle, validateSummary, validatePurpose, validateMeet, validateGovernance, validateLegality, validateCategories, validateProducts, validateValidity, validateException, validatePerson,
    validateSubCategories, validateApproval
};