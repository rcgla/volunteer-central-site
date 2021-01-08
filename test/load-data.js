import fs from 'fs-extra';
import * as path from 'path';
import winston from 'winston';

import * as Q from "../src/queries/index.js";
import * as db from "../src/database/index.js";
import {addUsers} from './dbops/add-users.js';
import {addEvents} from './dbops/add-events.js';
import {addSettings} from './dbops/add-settings.js';
import {addPlacements} from './dbops/add-placements.js';

import * as errmgr from './errmgr.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readDataProfile(dataProfile) {
    let settingsData = await readJson(dataProfile.settings);
    let usersData = await readJson(dataProfile.users);
    let eventsData = await readJson(dataProfile.events);
    let placementsData = await readJson(dataProfile.placements);
    return {settingsData, usersData, eventsData, placementsData};
}

async function initDb(data) {
    try {
        await db.initDatabaseConnection();
    }
    catch (err) {
        throw new Error(err);
    }
    
    try {
        let jwt = await login("mayor", "dancingpaint");
        if (!jwt) {
            throw new Error("Could not login");
        }
        await wipeDb(jwt);
        await addSettings(data.settingsData, jwt, errmgr);
        await addUsers(data.usersData, jwt, errmgr);
        await addEvents(data.eventsData, jwt, errmgr);
        await addPlacements(data.placementsData, jwt, errmgr);
        winston.log('info', "Ready");
    }
    catch (err) {
        throw err;
    }
}


// clear all data from the database
async function wipeDb(jwt) {
    // delete all rows from all tables except for DbInfo
    let dbres = await db.query(Q.ETC.DELETE_ALL_DATA(), {}, jwt);
    if (!dbres.success) {
        let err = new Error("Could not wipe data");
        err.errors = dbres.errors;
        throw new Error(err);
    }
    winston.info("Cleared data");
}

async function login (username, password) {
    let dbres = await db.query(Q.AUTH.LOGIN(), {
        input: {
            username, 
            password
        }
    });

    if (!dbres.success) {
        winston.error("Login error");
        throw new Error("Login error");
    }

    return dbres.data.authenticate.jwtToken;
}

async function readJson(filename) {
    let data = await fs.readFile(path.resolve(__dirname, filename), {encoding: "utf-8"});
    return JSON.parse(data);
}

export { errmgr, initDb, login, readDataProfile};