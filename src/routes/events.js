import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as middleware from '../middleware.js';

const router = express.Router(); 

// get all the events
router.get('/',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let events = dbres.data.events;
    return res.render('./events/events.njk', { events });
});
// get form to create a new event
router.get('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return res.render('./events/new-event.njk');
});

// handle form to create a new event
router.post('/new',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// get event
router.get('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.EVENTS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        next(err);
    }
    let event = dbres.data.event;
    return res.render('./events/event.njk', { event });
});

// edit event
router.get('/:id/edit',  middleware.isAuthenticated, async (req, res, next) => {
    let dbres = await db.query(Q.EVENTS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let event = dbres.data.event;
    return res.render('./events/edit-event.njk', { event });    
});

// get form to confirm deleting an event
router.get('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    let dbres = await db.query(Q.EVENTS.GET(), { id: parseInt(req.params.id) }, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let event = dbres.data.events;
    return res.render('./events/confirm-delete-event.njk', { event });    
});

// handle form to confirm deleting an event
router.post('/:id/delete',  middleware.isAuthenticated, middleware.isAdmin, async (req, res, next) => {
    return next(new Error("TODO"));
});

// handle event edit form submission
router.post('/:id',  middleware.isAuthenticated, async (req, res, next) => {
    return next(new Error("TODO"));
});

export { router };