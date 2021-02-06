import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as middleware from '../middleware.js';
import * as utils from '../utils.js';

const router = express.Router();

// get all the activities
router.get('/',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let activities = dbres.data.activities;
    return res.render('./activities/activities.njk', { activities });
});

// get form to create a new activity
router.get('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return res.render('./activities/new-activity.njk');
});

// handle form to create a new activity
router.post('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// get form to confirm deleting an activity
router.get('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let dbres = await db.query(Q.ACTIVITIES.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let activity = dbres.data.activity;
    return res.render('./users/confirm-delete-activity.njk', { activity });    
});

// handle form to confirm deleting an activity
router.post('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// edit activity
router.get('/:id/edit',  middleware.isAuthenticated, async (req, res, next) => {
    let dbres = await db.query(Q.USERS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let activity = dbres.data.activity;
    return res.render('./activities/edit-activity.njk', { activity });    
});

// get activity
router.get('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.ACTIVITIES.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        next(err);
    }
    let activity = dbres.data.activity;
    return res.render('./activities/activity.njk', { activity });
});

// handle activity edit form submission
router.post('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    return next(new Error("TODO"));
});


export { router };