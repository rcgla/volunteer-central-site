import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as middleware from '../middleware.js';
import * as utils from '../utils.js';
import dayjs from 'dayjs';

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
    return res.render('./users/users.njk', { users, dayjs, sortUserPhotos, hadRole });
});

// get logged-in user's landing page
router.get('/dashboard',  middleware.isAuthenticated, async (req, res, next) => {
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

// get form to create a new user
router.get('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    // handeds, mealprefs, types, tShirtSizes
    let handeds = ["RIGHT", "LEFT", "OTHER"];
    let mealprefs = ["OMNIVORE", "VEGETARIAN", "VEGAN"];
    let types = ["CLIENT", "STAFF", "ADMIN"];
    let dbres = await db.query(Q.TSHIRT_SIZES.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let tShirtSizes = dbres.data.tShirtSizes;
    return res.render('./users/new-edit-user.njk', 
        {
            title: "New user", 
            handeds, 
            mealprefs, 
            types, 
            tShirtSizes, 
            user: null,
            postEndpoint: `/new`
        });
});

// handle form to create a new user
router.post('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// get form to confirm deleting a user
router.get('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.USERS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let user = dbres.data.user;
    return res.render('./users/confirm-delete-user.njk', { user });    
});

// handle form to confirm deleting a user
router.post('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// edit user profile
router.get('/:id/edit',  middleware.isAuthenticated, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.USERS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let user = dbres.data.user;
    user.photos = sortUserPhotos(user.photos);
    // handeds, mealprefs, types, tShirtSizes
    let handeds = ["RIGHT", "LEFT", "OTHER"];
    let mealprefs = ["OMNIVORE", "VEGETARIAN", "VEGAN"];
    let types = ["CLIENT", "STAFF", "ADMIN"];
    dbres = await db.query(Q.TSHIRT_SIZES.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let tShirtSizes = dbres.data.tShirtSizes;
    return res.render('./users/new-edit-user.njk', 
        {
            title: "New user", 
            handeds, 
            mealprefs, 
            types, 
            tShirtSizes, 
            user: utils.simplifyUserObject(user),
            postEndpoint: `/${user.id}`
        });
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
    user.photos = sortUserPhotos(user.photos);
    return res.render('./users/user.njk', { user });
});

// handle user profile edit form submission
router.post('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    return next(new Error("TODO"));
});

function sortUserPhotos(photos) {
    // most recent first
    return photos.sort((a, b) => {
        if (dayjs(a.event.start).isAfter(dayjs(b.event.start))) {
            return -1;
        }
        else {
            return 1;
        }
    });
}
function hadRole(user, role) {
    // look at the users placements and see if they ever had the specified role
    return user.placements.find(p => p.role.name == role) != undefined;
}
export { router };