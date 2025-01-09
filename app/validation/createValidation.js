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


module.exports = {
    validateTitle, validateSummary, validatePurpose, validateMeet, validateGovernance, validateLegality
};