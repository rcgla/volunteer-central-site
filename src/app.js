import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';
import nunjucksDate from 'nunjucks-Date';

import { router as publicRoutes} from './routes/public.js';
import { router as userRoutes } from './routes/user.js';
import { router as adminRoutes } from './routes/admin.js';
import { router as publicFormRoutes } from './routes/public-forms.js';
import { router as userFormRoutes } from './routes/user-forms.js';
import { router as adminFormRoutes } from './routes/admin-forms.js';
import { initDatabaseConnection, DBURL } from './database/index.js';
import postgraphile from 'postgraphile';
import { options as postgraphileOptions } from './database/postgraphileOptions.js';

import * as middleware from './middleware.js';

async function initExpressApp() {
    const app = express();    
    const apiLimiter = rateLimit();

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

    app.use('/', publicRoutes);
    app.use('/user', middleware.isAuthenticated, userRoutes);
    app.use('/admin', middleware.isAuthenticated, middleware.isAdmin, adminRoutes);
    app.use('/forms', apiLimiter, publicFormRoutes);
    app.use('/user/forms', middleware.isAuthenticated, userFormRoutes);
    app.use('/admin/forms', middleware.isAuthenticated, middleware.isAdmin, adminFormRoutes);

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