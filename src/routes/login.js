import express from 'express';
import expressValidator from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as db from '../database/index.js';
import * as Q from '../queries/index.js';
import * as utils from '../utils.js';

const apiLimiter = rateLimit();

const { validationResult, body } = expressValidator;

const router = express.Router();

router.get('/', (req, res) => res.render('login.njk'));

router.post('/', 
    apiLimiter,
    [
        body('username').not().isEmpty(),
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
                    username: req.body.username, 
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
                .redirect(req.body.next ? req.body.next : '/users/dashboard');
        }
        else {
            let message = "Login error";
            return res.status(401)
                .redirect('/login?message=' + encodeURIComponent(message));
        }
    }
);

export { router };