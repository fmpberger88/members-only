function isAdmin(req, res, next) {
    if (!req.isAuthenticated() && req.user.isAdmin) {
        res.render('403', { title: '403 - Forbidden'})
    } else {
        // User is authenticated and admin, proceed to next middleware
        next();
    }
}

module.exports = isAdmin;