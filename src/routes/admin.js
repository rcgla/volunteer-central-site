import express from 'express';
import * as db from '../database.js';
import * as Q from '../queries/index.js';
import * as utils from '../utils.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    let dbres = await db.query(
        Q.SESSIONS.GET_ALL, 
        {}, 
        req.cookies.jwt);
        
    if (!dbres.success) {
        let err = new Error("Could not get sessions");
        return next(err);
    }

    return res.render('./admin/index.html', 
        {
            sessions: dbres.data.sessions.nodes,
            accessLevel: req.accessLevel
        }
    );
});

router.get('/sessions/:sessionId/campers', async (req, res, next) => {
    let result = await utils.getUsersBySessionAndRoleGroup(
        parseInt(req.params.sessionId), 
        'CAMPERS',
        req.cookies.jwt);
    if (!result.success) {
        let err = new Error(result.errors.join(','));
        return next(err);
    }
    return res.render('./admin/users.html', 
        {
            accessLevel: req.accessLevel,
            pagetitle: "Campers",
            users: result.users
        }
    );
});

router.get('/sessions/:sessionId/volunteers', async (req, res) => {
    let result = await utils.getUsersBySessionAndRoleGroup(
        parseInt(req.params.sessionId), 
        'VOLUNTEERS',
        req.cookies.jwt);
    if (!result.success) {
        let err = new Error(result.errors.join(','));
        return next(err);
    }
    return res.render('./admin/users.html', 
        {
            pagetitle: "Campers",
            users: result.users
        }
    );
});

router.get('/sessions/:sessionId', async (req, res, next) => {
    let dbres = await db.query(
        Q.SESSIONS.GET_BY_ID, 
        { id: parseInt(req.params.sessionId) }, 
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error(`Could not get session ${req.params.sessionId}`);
        return next(err);
    }
    let session = dbres.data.sessions.nodes[0];
    return res.render('./admin/session.html', { session });
});

router.get('/settings', async (req, res, next) => {
    let dbres = await db.query(
        Q.SESSION_TYPES.GET_ALL,
        {},
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error(`Could not get session types`);
        return next(err);
    }
    let sessionTypes = dbres.data.sessionTypes.nodes;
    return res.render('./admin/settings.html', {
        sessionTypes
    });
});
router.get('/sessionTypes/edit/:sessionTypeId', async (req, res, next) => {
    let dbres = await db.query(
        Q.SESSION_TYPES.GET,
        { id: parseInt(req.params.sessionTypeId) },
        req.cookies.jwt);
    if (!dbres.success) {
        let err = new Error(`Could not get session type ${req.params.sessionTypeId}`);
        return next(err);
    }
    let sessionType = dbres.data.sessionType;
    return res.render('./admin/add-edit.html', {
        title: "Edit Session Type",
        name: sessionType.name,
        submit: `/admin/forms/sessionTypes/${req.params.sessionTypeId}`
    });
});
router.get('/sessionTypes/add', async (req, res, next) => {
    return res.render('./admin/add-edit.html', {
        title: "Add Session Type",
        submit: '/admin/forms/sessionTypes/add'
    });
});

export { router };
