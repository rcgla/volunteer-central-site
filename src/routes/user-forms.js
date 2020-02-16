var express = require('express')
const db = require('../database');
const Q = require('../queries/queries');
const QAUTH = require('../queries/auth');
const { validator, validationResult, body } = require('express-validator');
var router = express.Router()

// submit set password
router.post('/set-password', 
    [
        body('password').isLength({ min: 8, max: 20 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).redirect('/set-password?error=Password%30must%20be%20at%20least%208-20%20characters%20long.');
        }

        try {
            let result = await db.query(
                QAUTH.SET_PASSWORD, 
                {
                    input: {
                        userId: req.userId, 
                        newPassword: req.body.password
                    }
                }
                , req.cookies.jwt);
            if (result.data.data.setPassword) {
                return res
                        .status(200)
                        // clear the temporary cookie
                        .clearCookie('jwt', {
                            path: '/'
                        })
                        .redirect('/login?error=Success.%20Login%20with%20your%20new%20password');
            }
            else {
                return res
                        .status(401)
                        .redirect('/set-password?error=Set%20password%20error');
            }
            
        }
        catch(err) {
            console.log(err);
            return res.redirect('/set-password?error=Error%20setting%20password');
        }
    }
);

// submit profile
router.post('/profile', 
    async (req, res) => {
        try {
            let data = {
                name: req.body.name,
                organization: req.body.organization,
                website: req.body.website.indexOf("http://") === -1 ? 
                    `http://${req.body.website}` : req.body.website
            };
            await db.query(Q.UPDATE_USER_PROFILE, {id: req.userId, data}, req.cookies.jwt);
            
            if (req.body.password != "") {
                if (req.body.password.length < 8) {
                    return res.status(422).redirect('/user/profile?error=Password%30must%20be%20at%20least%208-20%20characters%20long.');
                }
                await db.query(
                    QAUTH.SET_PASSWORD,
                    {
                        input: {
                            userId: req.userId, 
                            newPassword: req.body.password
                        }
                    },
                    req.cookies.jwt);
            }
            return res.redirect('/user/profile');
        }
        catch(err) {
            console.log(err);
            return res.redirect('/user/profile?error=Error%20updating%20profile');
        }
    }
);

module.exports = router;