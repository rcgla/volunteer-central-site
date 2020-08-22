import { importIntoDb } from './import.js';
import * as db from '../src/database.js';
import * as Q from '../src/queries/index.js';
import * as utils from '../src/utils.js';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { exit } from 'process';
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envpath = path.join(__dirname, '/.env');
dotenv.config({path: envpath});

(async () => {

    let jwt = await login();
    if (!jwt) {
        console.log("Login token error");
        exit(1);
    }

    // load the files
    let inputDir = __dirname + '/testdata';
    let dataFiles = await fs.readdir(inputDir)      ;
    for (const file of dataFiles) {
        let data = await fs.readFile(inputDir + '/' + file, 'utf8');
        let json = JSON.parse(data);
        for (const key in json) {
            await importIntoDb(key, json[key], jwt);
        }
    }

})();

async function login() {
    let dbres = await db.query(
        Q.AUTH.LOGIN, 
        {   
            input: {
                email: process.env.EMAIL, 
                password: process.env.PASSWORD
            }
        });
    if (!dbres.success) {
        console.log("Login error");
        return;  
    }
    let jwt = dbres.data.authenticate.jwtToken;
    let token = utils.parseToken(jwt);
    return token ? jwt : null;
}
