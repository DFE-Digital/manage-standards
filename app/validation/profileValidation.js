const { check, validationResult } = require('express-validator');

exports.validateProfileName = [
    check('firstName')
        .trim()
        .custom((value, { req }) => {
            if (value === '') {
                throw new Error('Enter a first name');
            }
            return true;
        }),
        check('lastName')
        .trim()
        .custom((value, { req }) => {
            if (value === '') {
                throw new Error('Enter a last name');
            }
            return true;
        })
];