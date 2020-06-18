import express from 'express';
import * as db from '../database.js';
import * as Q from '../queries/index.js';

const router = express.Router();

// user profile page
router.get('/profile', async (req, res, next) => {
    let dbres = await db.query(Q.USERS.GET_BY_ID, { id: req.userId }, req.cookies.jwt);
    
    if (!dbres.success) {
        let err = new Error(`Could not get profile for user (${req.userId})`);
        return next(err);
    }

    return res.render('profile.html', 
        {
            user: dbres.data.user
        }
    );
});

router.get('/dashboard', async (req, res) => {
    return res.render('./dashboard.html',
    {
        accessLevel: req.accessLevel
    });
})


export { router };