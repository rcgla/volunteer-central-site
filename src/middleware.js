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
        res.locals.accessLevel = 'public';
    }
    else {
        let token = utils.parseToken(req.cookies.jwt);
        if (token) {
            res.locals.accessLevel = token.accessLevel;
            req.userId = token.userId;
        }
        else {
            res.locals.accessLevel = 'public';
        }
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