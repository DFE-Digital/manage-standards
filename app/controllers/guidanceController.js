
require('dotenv').config();
// GET Routes

exports.g_guidance = async (req, res, next) => {

    const authenticated = req.session.User ? true : false;

    return res.render('guidance/index', {authenticated});
};

exports.g_guidancepage = async (req, res, next) => {

    const authenticated = req.session.User ? true : false;
    const {page} = req.params;

    return res.render(`guidance/${page}`, { authenticated });
};