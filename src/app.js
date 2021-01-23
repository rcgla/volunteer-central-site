import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';
import nunjucksDate from 'nunjucks-Date';

import { initDatabaseConnection, DBURL } from './database/index.js';
import postgraphile from 'postgraphile';
import { options as postgraphileOptions } from './database/postgraphileOptions.js';
import * as middleware from './middleware.js';
import { router as loginRouter } from './routes/login.js';
import { router as logoutRouter } from './routes/logout.js';
import { router as usersRouter } from './routes/users.js';
import { router as userGroupsRouter } from './routes/user-groups.js';
import { router as eventsRouter } from './routes/events.js';
import { router as activitiesRouter } from './routes/activities.js';

async function initExpressApp() {
    const app = express();    
    
    let env = nunjucks.configure('src/pages/templates', {
        autoescape: true,
        express: app
    });
    nunjucksDate.setDefaultFormat("MMMM Do YYYY");
    nunjucksDate.install(env);

    await initDatabaseConnection();

    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // see https://expressjs.com/en/guide/behind-proxies.html
    app.set('trust proxy', 1);

    app.use(cors());
    app.use(cookieParser());
    app.use(middleware.accessLevel);
    app.use(express.urlencoded({extended: true}));

    app.use('/images', express.static(path.join(__dirname, `./pages/images`)));
    app.use('/css', express.static(path.join(__dirname, `./pages/css`)));
    app.use('/js', express.static(path.join(__dirname, `./pages/js`)));

    app.get('/', (req, res) => res.render('index.njk'));
    app.get('/forgot-password', (req, res) => res.render('forgot-password.njk'));
    app.get('/error', (req, res) => res.render('error.njk'));
    app.use('/login', loginRouter);
    app.use('/logout', logoutRouter);
    app.use('/events', eventsRouter);
    app.use('/users', usersRouter);
    app.use('/user-groups', userGroupsRouter);
    app.use('/activities', activitiesRouter);
    // for testing only!!  creates /graphql endpoint
    // it's way easier to test queries this way, via an external tool like graphiql
    if (process.env.NODE_ENV != 'production') {    
        app.use('/', 
            postgraphile.postgraphile(
                DBURL, 
                process.env.DB_SCHEMAS, 
                {
                    ...postgraphileOptions,
                    readCache: `${__dirname}/database/postgraphile.cache`,
                }
            )
        );
    }

    // error middleware goes here at the end
    app.use(middleware.error);

    return app;
}
export default initExpressApp;