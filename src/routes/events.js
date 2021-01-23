import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as middleware from '../middleware.js';
import expressValidator from 'express-validator';
const { validator, validationResult, body } = expressValidator;

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
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.EVENT_TYPES.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        return next(err);
    }
    let eventTypes = dbres.data.eventTypes;
    return res.render('./events/new-event.njk', {eventTypes});
});

// handle form to create a new event
/* 
expects the following fields:

name: string (required)
description: string (optional)
start: iso 8601 datetime (required)
end: iso 8601 datetime (required)
visibility: 'CLIENT' | 'STAFF' | 'ADMIN' (optional; defaults to 'STAFF')
eventType: integer (id) (required)
*/
router.post(
    '/new',  
    middleware.isAuthenticated, 
    middleware.isAdmin, 
    [
        body("name").trim(),
        body("description").trim(),
        body("start").isISO8601(),
        body("end").isISO8601(),
        body("visibility").custom(value => ['CLIENT', 'STAFF', 'ADMIN'].includes(value)),
        body("eventType").isInt()
    ],
async (req, res, next) => {
    const validation = validationResult(req);
    if (validation.errors.length > 0) {
        let err = new Error("Validation error");
        err.statusCode = 422;
        err.errors = validation.errors;
        return next(err);
    }
    let name = req.body.name;
    let description = req.body.description ?? '';
    let start = req.body.start;
    let end = req.body.end;
    let visibility = req.body.visibility;
    let eventTypeId = parseInt(req.body.eventType);
    let jwt = req.cookies.jwt;
    let dbres = await db.query(Q.EVENTS.CREATE(),
        {
            input: {
                name, 
                description,
                start,
                end,
                visibility,
                eventTypeId
            }
        },
        jwt
    );

    if (!dbres.success) {
        let err = new Error("Create event error");
        err.errors = dbres.errors;
        return next(err);
    }
    return res.redirect("/users/dashboard");
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