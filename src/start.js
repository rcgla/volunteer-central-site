import initExpressApp from './app.js';
import winston from 'winston';

const port = process.env.PORT || 8000;
(async () => {
    winston.add(new winston.transports.Console({format: winston.format.simple()}));
    winston.level = 'debug';
    
    let app = await initExpressApp();
    app.listen(port, () => winston.log('info', `Volunteer Central listening on port ${port}!`))
})();

