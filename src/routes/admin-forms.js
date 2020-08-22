import express from 'express';
import * as db from '../database.js';
import * as Q from '../queries/index.js';
import expressValidator from 'express-validator';
const { validationResult, body } = expressValidator;

const router = express.Router();
// add sessionType
router.post('/sessionTypes/add', async (req, res, next) => {
    let name = req.body.name;
    let dbres = await db.query(Q.SESSION_TYPES.CREATE, 
        {input: { 
                sessionType: {name}
            }
        }, 
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error("Error creating session type");
        return next(err);   
    }
    let message = "Session type created";
    return res.redirect('/admin/settings?message=' + encodeURIComponent(message));
});

// edit sessionType
router.post('/sessionTypes/:sessionTypeId', 
    async (req, res, next) => {
        let id = parseInt(req.params.sessionTypeId);
        let data = {
            name: req.body.name
        };
        let dbres = await db.query(Q.SESSION_TYPES.UPDATE, {id, data}, req.cookies.jwt);
        
        if (!dbres.success) {
            let err = new Error("Error updating session type.");
            return next(err);
        }
        let message = "Session type updated.";
        return res.redirect('/admin/settings?message=' + encodeURIComponent(message));
    }
);
// add sessionType
router.post('/sessionTypes/delete/:sessionTypeId', async (req, res, next) => {
    let id = parseInt(req.params.sessionTypeId);
    let dbres = await db.query(Q.SESSION_TYPES.DELETE, 
        {id}, 
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error("Error removing session type");
        return next(err);   
    }
    let message = "Session type removed";
    return res.redirect('/admin/settings?message=' + encodeURIComponent(message));
});
export { router };