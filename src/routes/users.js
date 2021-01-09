import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as middleware from '../middleware.js';
import * as utils from '../utils.js';

const router = express.Router();

// get all the users
router.get('/',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.USERS.GET_ALL_SORTED(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let users = dbres.data.users;
    return res.render('./users/users.njk', { users });
});

// get logged-in user's landing page
router.get('/dashboard',  middleware.isAuthenticated, async (req, res) => {
    let jwt = req.cookies.jwt;
    let token = utils.parseToken(jwt);
    
    let dbres = await db.query(Q.USERS.GET(), { id: token.userId }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let user = dbres.data.user;
    return res.render('./users/dashboard.njk', { user });
});

// get user profile
router.get('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.USERS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        next(err);
    }
    let user = dbres.data.user;
    return res.render('./users/user.njk', { user });
});

// edit user profile
router.get('/:id/edit',  middleware.isAuthenticated, async (req, res, next) => {
    let dbres = await db.query(Q.USERS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let user = dbres.data.user;
    return res.render('./users/edit-user.njk', { user });    
});

// handle user profile edit form submission
router.post('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    return next(new Error("TODO"));
});

// get form to create a new user
router.get('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return res.render('./users/new-user.njk');
});

// handle form to create a new user
router.post('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// get form to confirm deleting a user
router.get('/:ID/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let dbres = await db.query(Q.USERS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let user = dbres.data.user;
    return res.render('./users/confirm-delete-user.njk', { user });    
});

// handle form to confirm deleting a user
router.post('/:ID/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});


export { router };