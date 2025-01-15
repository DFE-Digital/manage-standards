const strapiService = require('../../services/strapiService');

exports.g_standards = async (req, res, next) => {

    try {
        const user = req.session.User;

        const standards = await strapiService.getStandardsOwnedByUserDocumentId (user.documentId);

        return  res.render('standards/index', { standards });
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

        return res.render('standards/standard', { standard});
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

        return res.render('standards/history', { standard });
    } catch (error) {
        console.log('Error fetching standard:', error);
    }
}

exports.g_standard = async (req, res, next) => {
    
    try {
        const { documentId } = req.params;

        const standard = await strapiService.getStandardByDocumentId(documentId);

        if(standard.stage.title === 'Draft')
        {
            return res.redirect(`/create/getdraft/${documentId}`);
        }
        if (standard.stage.title === 'Published') {
            return res.render('standards/standard/index', { standard });
        }


       return  res.render('standards/standard/manage', { standard });
    } catch (error) {
        console.error('Error fetching standard:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load standard. Please try again later.'
        });
    }
}

exports.g_standard_manage = async (req, res, next) => {

    try {
        const { documentId } = req.params;

        const standard = await strapiService.getStandardByDocumentId(documentId);

        if (standard.stage.title === 'Draft') {
            return res.redirect(`/create/getdraft/${documentId}`);
        }

        return res.render('standards/standard/manage', { standard });
    } catch (error) {
        console.error('Error fetching standard:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load standard. Please try again later.'
        });
    }
}

exports.g_standard_history = async (req, res, next) => {

    try {
        const { documentId } = req.params;

        const standard = await strapiService.getStandardByDocumentId(documentId);

        if (standard.stage.title === 'Draft') {
            return res.redirect(`/create/getdraft/${documentId}`);
        }

        return res.render('standards/standard/history', { standard });
    } catch (error) {
        console.error('Error fetching standard:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load standard. Please try again later.'
        });
    }
}

exports.g_standard_edit_section = async (req, res, next) => {

    try {
        const { section, documentId } = req.params;

        const standard = await strapiService.getStandardByDocumentId(documentId);

        if (standard.stage.title === 'Draft') {
            return res.redirect(`/create/getdraft/${documentId}`);
        }

        if(section === 'summary'){
            return res.render('standards/standard/manage', { standard, mode: 'edit', section: 'summary' });
        }

        return res.render('standards/standard/history', { standard });
    } catch (error) {
        console.error('Error fetching standard:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load standard. Please try again later.'
        });
    }
}