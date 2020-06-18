import express from 'express';
import * as db from '../database.js';
import * as Q from '../queries/index.js';
import expressValidator from 'express-validator';
const { validationResult, body } = expressValidator;

const router = express.Router();

// submit set password
router.post('/set-password', 
    [
        body('password').isLength({ min: 8, max: 20 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let message = "Password must be 8-20 characters";
            return res.status(422).redirect('/set-password?message=' + encodeURIComponent(message));
        }

        let dbres = await db.query(
            Q.AUTH.SET_PASSWORD, 
            {
                input: {
                    userId: req.userId, 
                    newPassword: req.body.password
                }
            }
            , req.cookies.jwt);
        if (!dbres.success) {
            let message = "Error setting password";
            return res
                .status(401)
                .redirect('/set-password?message=' + encodeURIComponent(message));
        }
        let message = "Success. Login with your new password."
        return res
                .status(200)
                // clear the temporary cookie
                .clearCookie('jwt', {
                    path: '/'
                })
                .redirect('/login?message=' + encodeURIComponent(message));
                
    }
);

// submit profile
router.post('/profile', 
    async (req, res) => {
        let data = {
            name: req.body.name,
            organization: req.body.organization,
            website: req.body.website.indexOf("http://") === -1 ? 
                `http://${req.body.website}` : req.body.website
        };
        let dbres = await db.query(Q.USERS.UPDATE, {id: req.userId, data}, req.cookies.jwt);
        
        if (!dbres.success) {
            let message = "Error updating profile.";
            return res.redirect('/user/profile?message=' + encodeURIComponent(message));
        }
        if (req.body.password != "") {
            if (req.body.password.length < 8) {
                let message = "Password must be 8-20 characters";
                return res.status(422).redirect('/user/profile?message=' + encodeURIComponent(message));
            }
            dbres = await db.query(
                Q.AUTH.SET_PASSWORD,
                {
                    input: {
                        userId: req.userId, 
                        newPassword: req.body.password
                    }
                },
                req.cookies.jwt);
            if (!dbres.success) {
                let message = "Error updating password.";
                return res.redirect('/user/profile?message=' + encodeURIComponent(message));
            }
        }
        let message = "Profile updated.";
        return res.redirect('/user/profile?message=' + encodeURIComponent(message));
    }
);

export { router };