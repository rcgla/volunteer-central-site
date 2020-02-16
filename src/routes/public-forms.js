var express = require('express')
const db = require('../database');
const QAUTH = require('../queries/auth');
const utils = require('../utils');
const mail = require('../mail.js');
const emails = require('../emails.js');
const { validationResult, body } = require('express-validator');

var router = express.Router()

// submit login
router.post('/login', 
    [
        body('email').isEmail(),
        body('password').isLength({ min: 8 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).redirect('/login?error=Login%20error');
        }

        try {
            let result = await db.query(
                QAUTH.LOGIN, 
                {   
                    input: {
                        email: req.body.email, 
                        password: req.body.password
                    }
                });
            let jwt = result.data.data.authenticate.jwtToken;
            let token = utils.parseToken(jwt);
            if (token) {
                res
                    .status(200)
                    .cookie('jwt', jwt, { httpOnly: true/*, secure: true */ , maxAge: token.expires})
                    .redirect('/user/dashboard');
            }
            else {
                res
                    .status(401)
                    .redirect('/login?error=Login%20error');
            }
        }
        catch(err) {
            console.log(err);
            res.redirect('/login?error=Login%20error');
        }
    }
);

// submit logout
router.post('/logout', (req, res) => {
    res
        .status(200)
        .clearCookie('jwt', {
            path: '/'
        })
        .redirect('/');
});

// submit forgot password
router.post('/forgot-password', 
    [
        body('email').isEmail()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).redirect('/forgot-password?error=Reset%20password%20error');
        }

        try {
            let result = await db.query(
                QAUTH.TEMPORARY_TOKEN,
                {
                    input: {
                        email: req.body.email
                    }
                });
            let jwt = result.data.data.createTemporaryToken.jwtToken;
            let token = utils.parseToken(jwt);
            if (token) {
                let resetUrl = process.env.MODE === 'LOCALDEV' ? 
                    `http://localhost:${process.env.PORT}/set-password?token=${jwt}`
                    : 
                    `http://vol.werock.la/set-password?token=${jwt}`;
                await mail.emailPasswordReset(req.body.email, 
                    emails.reset.subject,
                    emails.reset.text(resetUrl),
                    emails.reset.html(resetUrl));   
                res
                    .status(200)
                    .redirect('/check-your-email');
            }
        }
        catch(err) {
            console.log(err);
            res.redirect('/forgot-password?error=Reset%20password%20error');
        }
    }
);
module.exports = router;