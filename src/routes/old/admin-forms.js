import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import expressValidator from 'express-validator';
const { validationResult, body } = expressValidator;

const router = express.Router();
// add sessionType
router.post('/eventTypes/add', async (req, res, next) => {
    let name = req.body.name;
    let dbres = await db.query(Q.EVENT_TYPES.CREATE(), 
        {input: { 
                sessionType: {name}
            }
        }, 
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error("Error creating event type");
        return next(err);   
    }
    let message = "Event type created";
    return res.redirect('/admin/settings?message=' + encodeURIComponent(message));
});

// edit sessionType
router.post('/eventTypes/:eventTypeId', 
    async (req, res, next) => {
        let id = parseInt(req.params.eventTypeId);
        let data = {
            name: req.body.name
        };
        let dbres = await db.query(Q.EVENT_TYPES.UPDATE(), {id, data}, req.cookies.jwt);
        
        if (!dbres.success) {
            let err = new Error("Error updating event type.");
            return next(err);
        }
        let message = "Event type updated.";
        return res.redirect('/admin/settings?message=' + encodeURIComponent(message));
    }
);
// delete sessionType
router.post('/sessionTypes/delete/:eventTypeId', async (req, res, next) => {
    let id = parseInt(req.params.eventTypeId);
    let dbres = await db.query(Q.EVENT_TYPES.DELETE(), 
        {id}, 
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error("Error removing event type");
        return next(err);   
    }
    let message = "Event type removed";
    return res.redirect('/admin/settings?message=' + encodeURIComponent(message));
});
export { router };