var express = require('express');
const db = require('../database');
const Q = require('../queries/queries');
var router = express.Router()

// user profile page
router.get('/profile', async (req, res) => {
    try {
        let result = await db.query(Q.USER_PROFILE, { id: req.userId }, req.cookies.jwt);
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


module.exports = router;