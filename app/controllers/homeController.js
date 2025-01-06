
require('dotenv').config(); 
// GET Routes

exports.g_homepage = async (req, res, next) => {
    
   res.render('index');
};