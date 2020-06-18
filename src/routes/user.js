import express from 'express';
import * as db from '../database.js';
import * as Q from '../queries/index.js';

const router = express.Router();

// user profile page
router.get('/profile', async (req, res) => {
    try {
        let result = await db.query(Q.USERS.GET_USER_PROFILE, { id: req.userId }, req.cookies.jwt);
        return res.render('./profile.html', 
            {
                accessLevel: req.accessLevel,
                user: result.data.data.user
            });
    }
    catch(err) {
        console.log(err);
        return res.redirect('/server-error');
    }
});

router.get('/dashboard', async (req, res) => {
    try {
        return res.render('./dashboard.html',
        {
            accessLevel: req.accessLevel
        });
    }
    catch(err) {
        console.log(err);
        return res.redirect('/server-error');   
    }
})


export { router };