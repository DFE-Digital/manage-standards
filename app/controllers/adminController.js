const strapiService = require('../../services/strapiService');

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