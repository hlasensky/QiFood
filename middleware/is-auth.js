module.exports = (req, res, next) => {
    if (req.user.email === "anonym") {
        return res.redirect('/login');
        next();
    } else if (!req.session.isLoggedIn && !req.session.isAdmin) {
        return res.redirect('/login');
    }
    next();
}