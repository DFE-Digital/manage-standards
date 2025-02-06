
require('dotenv').config(); 
// GET Routes

exports.g_homepage = async (req, res, next) => {
   const authenticated = req.session.User ? true : false;

   if(authenticated)
   {
       return res.redirect('/dashboard');
   }
   return res.render('index');
};