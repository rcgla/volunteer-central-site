// MIDDLEWARE FUNCTIONS
import * as utils from './utils.js';

function isAuthenticated (req, res, next) {
    const token = utils.parseToken(req.cookies.jwt);
    if (token) {
        return next();
    }
    return res.redirect('/login');
}

function isAdmin(req, res, next) {
    const token = utils.parseToken(req.cookies.jwt);
    if (token.accessLevel == 'admin') {
        return next();
    }
    return res.redirect('/login');
}

function accessLevel (req, res, next) {
    if (!req || !req.cookies || !req.cookies.jwt) {
        req.accessLevel = 'public';
        return next();
    }
    const token = utils.parseToken(req.cookies.jwt);
    if (token) {
        req.accessLevel = token.accessLevel;
        req.userId = token.userId;
    }
    else {
        req.accessLevel = 'public';
    }
    return next();
}

function error (err, req, res, next) {
    console.log("Error: ", err.statusCode);
    // use a generic status code if not present
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    res.status(err.statusCode).redirect(`/error?code=${err.statusCode}&error=${err.message}`);
}

export {
    isAuthenticated, 
    isAdmin,
    accessLevel,
    error
};