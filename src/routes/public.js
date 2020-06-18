import express from 'express';
import * as utils from '../utils.js';

const router = express.Router();
router.get('/test', (req, res) => res.render('test.html'));

// home page
router.get('/', (req, res) => res.render('index.html'));

// error
router.get('/error', (req, res) => res.render('error.html'));

// login page
router.get('/login', (req, res) => res.render('./auth/login.html'));

// forgot password page
router.get('/forgot-password', (req, res) => res.render('./auth/forgot-password.html'));

// check your email (for a reset password link) page
router.get('/check-your-email', (req, res) => res.render('./auth/check-your-email.html'));

// reset password page
router.get('/set-password', (req, res) => {
    // verify token
    let jwt = req.query.token;
    let token = utils.parseToken(jwt);
    if (token) {
        return res
                .status(200)
                .cookie('jwt', jwt, { httpOnly: true/*, secure: true */ , maxAge: token.expires})
                .render('./auth/set-password.html');
    }
    else {
        return res
                .status(401)
                .redirect('/forgot-password?error=Please%20try%20again.');
    }
});

// invitation accept page
router.get('/accept-invitation', (req, res) => {
    // verify token
    let jwt = req.query.token;
    let token = utils.parseToken(jwt);
    if (token) {
        return res
                .status(200)
                .cookie('jwt', jwt, { httpOnly: true/*, secure: true */ , maxAge: token.expires})
                .render('./auth/set-password.html',
                    {
                        pageTitle: "Welcome",
                        pageMessage: `Thank you for your involvement in Rock n' Roll Camp for Girls LA! 
                        Because you'll login to use this site, please set a password. 
                        Then after you've logged in, don't forget to update your profile.`
                    });
        }
        else {
            return res
                    .status(401)
                    .redirect('/request-error');
        }
    }
);

export { router };