exports.notFound = (req, res, next) => {
    res.status(404).render("404",
     {pageTitle: "404",
     isAuthenticated: req.session.isLoggedIn});
}