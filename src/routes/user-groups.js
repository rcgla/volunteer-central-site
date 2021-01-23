import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as middleware from '../middleware.js';
import * as utils from '../utils.js';

const router = express.Router();

// get all the user groups
router.get('/',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.USER_GROUPS.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let userGroups = dbres.data.userGroups;
    return res.render('./user-groups/user-groups.njk', { userGroups });
});

// get form to create a new user group
router.get('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return res.render('./user-groups/new-user-group.njk');
});

// handle form to create a new user group
router.post('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// edit user group
router.get('/:id/edit',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let dbres = await db.query(Q.USER_GROUPS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let userGroup = dbres.data.userGroup;
    return res.render('./user-groups/edit-user-group.njk', { userGroup });    
});


// get form to confirm deleting a user group
router.get('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let dbres = await db.query(Q.USER_GROUPS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let user = dbres.data.userGroup;
    return res.render('./user-groups/confirm-delete-user-group.njk', { user });    
});

// handle form to confirm deleting a user group
router.post('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// get one user group
router.get('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.USER_GROUPS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        next(err);
    }
    let userGroup = dbres.data.userGroup;
    return res.render('./user-groups/user-group.njk', { userGroup });
});

// handle user group edit form submission
router.post('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    return next(new Error("TODO"));
});


export { router };