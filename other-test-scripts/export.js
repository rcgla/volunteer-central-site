import { login } from '../test/load-data.js';
import * as Q from "../src/queries/index.js";
import * as db from "../src/database/index.js";
import fs from 'fs-extra';

// export event data to a json file
// useful for testing in other scenarios (e.g. web component development)
async function main() {
    try {
        await db.initDatabaseConnection();
    }
    catch (err) {
        throw new Error(err);
    }
    let jwt = await login('mayor', 'dancingpaint');
    let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error(dbres.errors.map(e => e.message).join(','));
        next(err);
    }
    let events = dbres.data.events;
    
    let obj = {events};
    fs.writeFileSync("export-events.json", JSON.stringify(obj, null, 2));
}

(async () => await main())();