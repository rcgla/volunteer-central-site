// load test data but don't run tests
import { initDb, readDataProfile } from "../test/load-data.js";
import winston from "winston";

(async () => {
    winston.add(new winston.transports.Console({format: winston.format.simple()}));
    winston.level = 'debug';
    
    winston.log('info', "Loading data");
    let dataProfile = {
        users: "../test/data/users.json",
        settings: "../test/data/settings.json",
        events: "../test/data/events.json",
        placements: "../test/data/placements.json"
    };
    let data = await readDataProfile(dataProfile);
    let jwt = await initDb(data); // this loads all the data into the db
    winston.info("Done");
    process.exit(0);
})();