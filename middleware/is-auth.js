module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn || !req.session.isAdmin) {
        return res.redirect('/login');
    }
    next();
}