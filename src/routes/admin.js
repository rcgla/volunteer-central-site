import express from 'express';
import * as db from '../database.js';
import * as Q from '../queries/index.js';
import * as utils from '../utils.js';

const router = express.Router();

router.get('/', async(req, res) => {
    
    try {
        let sessions = await db.query(Q.SESSIONS.GET_ALL_SESSIONS, {}, req.cookies.jwt);
        return res.render('./admin/index.html', 
            {
                sessions: sessions.data.data.sessions.nodes,
                accessLevel: req.accessLevel
            });
    }
    catch(err) {
        console.log(err);
        return res.redirect('/server-error');
    }
});

router.get('/sessions/:sessionId/campers', async (req, res) => {
    try {
        let campers = await utils.getUsersBySessionAndRoleGroup(
            parseInt(req.params.sessionId), 
            'CAMPERS',
            req.cookies.jwt);
        return res.render('./admin/users.html', 
            {
                accessLevel: req.accessLevel,
                pagetitle: "Campers",
                users: campers
            });
    }
    catch(err) {
        console.log(err);
        return res.redirect('/server-error');
    }
});

router.get('/sessions/:sessionId/volunteers', async (req, res) => {
    try {
        let volunteers = await utils.getUsersBySessionAndRoleGroup(
            parseInt(req.params.sessionId), 
            'VOLUNTEERS',
            req.cookies.jwt);
        return res.render('./admin/users.html', 
            {
                accessLevel: req.accessLevel,
                pagetitle: "Volunteers",
                users: volunteers
            });
    }
    catch(err) {
        console.log(err);
        return res.redirect('/server-error');
    }
});

router.get('/sessions/:sessionId', async (req, res) => {
    try {
        let session = await db.query(
            Q.SESSIONS.GET_SESSION_BY_ID, 
            {id: parseInt(req.params.sessionId)}, 
            req.cookies.jwt);
        return res.render('./admin/session.html', {
            session: session.data.data.sessions.nodes[0],
            accessLevel: req.accessLevel
        });
    }
    catch(err) {
        console.log(err);
        return res.redirect('/server-error');
    }
});

export { router };
