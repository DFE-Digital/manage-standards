const strapiService = require('../../services/strapiService');

exports.g_dashboard = async (req, res, next) => {
 console.log("Get dashboard")
    try {
        const user = req.session.User;

        const standards = await strapiService.getStandardsOwnedByUserDocumentId(user.documentId);
        const standardsReview = await strapiService.getDraftsForApproval();

        res.render('dashboard/index', { standards, standardsReview });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard. Please try again later.'
        });
    }
}