import express from 'express';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as utils from '../utils.js';
import * as mail from '../mail.js';
import * as emails from '../emails.js';
import expressValidator from 'express-validator';
const { validationResult, body } = expressValidator;

const router = express.Router();

// submit login
router.post('/login', 
    [
        body('email').isEmail(),
        body('password').isLength({ min: 8 })
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let message = "Login error";
            return res.status(422).redirect('/login?message=' + encodeURIComponent(message));
        }

        let dbres = await db.query(
            Q.AUTH.LOGIN(), 
            {   
                input: {
                    email: req.body.email, 
                    password: req.body.password
                }
            });
        if (!dbres.success) {
            let message = "Login error";
            return res.redirect('/login?message=' + encodeURIComponent(message));    
        }
        let jwt = dbres.data.authenticate.jwtToken;
        let token = utils.parseToken(jwt);
        if (token) {
            return res.status(200)
                .cookie('jwt', jwt, { httpOnly: true/*, secure: true */ , maxAge: token.expires})
                .redirect(req.body.next ? req.body.next : '/user/dashboard');
        }
        else {
            let message = "Login error";
            return res.status(401)
                .redirect('/login?message=' + encodeURIComponent(message));
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
            let message = 'Reset password error';
            return res.status(422).redirect('/forgot-password?message=' + encodeURIComponent(message));
        }

        let dbres = await db.query(
            Q.AUTH.TEMPORARY_TOKEN(),
            {
                input: {
                    email: req.body.email
                }
            });
        if (!dbres.success) {
            let message = "Reset password error";
            return res.redirect('/forgot-password?message=' + encodeURIComponent(message));
        }
        let jwt = dbres.data.createTemporaryToken.jwtToken;
        let token = utils.parseToken(jwt);
        if (token) {
            let resetUrl = process.env.NODE_ENV === 'production' ? 
                `http://vol.werock.la/set-password?token=${jwt}`
                : 
                `http://localhost:${process.env.PORT}/set-password?token=${jwt}`;
            await mail.sendEmail(req.body.email, 
                emails.reset.subject,
                emails.reset.text(resetUrl),
                emails.reset.html(resetUrl));  
            let message = "Password reset initiated. Please check your email for further instructions."; 
            return res.status(200)
                .redirect(`/?message=` + encodeURIComponent(message));
        }
    }
);

export { router };