const strapiService = require('../../services/strapiService');

exports.g_standards = async (req, res, next) => {

    try {
        const user = req.session.User;

        const standards = await strapiService.getStandardsOwnedByUser(user.id);

        res.render('standards/index', { standards });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}

exports.g_standardBySlug = async (req, res, next) => {
    try {
        const {slug} = req.params;

        const standard = await strapiService.getStandardBySlug(slug);

        console.log(standard);

        if (!standard === undefined) {
            console.log('No standard found');
            return res.render('/dashboard/index', {
                standard: []
            });
        }

        res.render('standards/standard', { standard});
    } catch (error) {
        console.log('Error fetching standard:', error);
    }
}

exports.g_standardHistoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const standard = await strapiService.getStandardBySlug(slug);

        console.log(standard);

        if (!standard === undefined) {
            console.log('No standard found');
            return res.render('/dashboard', {
                standard: []
            });
        }

        res.render('standards/history', { standard });
    } catch (error) {
        console.log('Error fetching standard:', error);
    }
}

