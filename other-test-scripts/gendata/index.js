import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import commander from 'commander';
import generateUsers from './gen-users.js';
import generatePlacements from './gen-placements.js';
import * as helpers from './helpers.js';

const {program} = commander;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function main() {
    program.name("VC Gendata");
    program.option('-c, --config <file>', "Configuration file", "config.json");
    program.option('-r --regenPhotos', "Force regeneration of profile photo cache (slow)", false);
    program.parse(process.argv);

    let config = JSON.parse(fs.readFileSync(path.join(__dirname, program.config)));
    
    if (!config || !verifyConfig(config)) {
        console.log("Configuration error, exiting");
        process.exit(1);
    }

    // make sure there are photos to choose from in the cache
    let photoCache = JSON.parse(fs.readFileSync(path.join(__dirname, 'photo-cache.json')));
    if (photoCache.length == 0 || program.regenPhotos) {
        photoCache = [];
        let startAge = 8;
        let endAge = 60;
        let ageRange = Array.from(Array(endAge + 1).keys()).slice(startAge);
        for (var i = 0; i<450; i++) { // make this number large enough so that we can afford to remove some dupes
            // evenly distribute over age range
            let age = ageRange[i % ageRange.length];
            
            let photo = await helpers.getPhoto(age, 'female');
            if (photoCache.find(item => item.url == photo.url) == undefined) {
                photoCache.push(photo);
            }
            else {
                console.log("DUPLICATE PHOTO, SKIPPING");
            }
            // don't hammer the server, wait a little bit
            await helpers.sleep(1000);
        }
        
        fs.writeFileSync(path.join(__dirname, 'photo-cache.json'), JSON.stringify(photoCache, null, 2));
    }

    // a bit hacky but we know 'summercamp' has the most users so just make one big pool
    let users = generateUsers(config['SUMMERCAMP']);
    
    // for each event in '../../test/events.json' create placements according to config[event.eventType]
    let events = JSON.parse(fs.readFileSync(path.join(__dirname, '../../test/data/events.json')));
    let eventPlacements = events.map(event => generatePlacements(config[event.type], users, event));
    
    fs.writeFileSync(path.join(__dirname, '../../test/data/users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(__dirname, '../../test/data/placements.json'), JSON.stringify(eventPlacements, null, 2));

    process.exit(0);
}

function verifyConfig(config) {
    /*
    SUMMERCAMP config: {
        "campers": 50,
        "staff": 25,
        "percentFlats": 50,
        "bandSize": 5
    }
    */

    // SUMMERCAMP config rules
    // 1. total staff must be at least 60% of campers
    // 2. flat and sharp campers must divide evenly by bandsize
    // 3. percent flats has to be between 40-60

    let summercampConfig = config['SUMMERCAMP'];
    let requiredStaff = Math.ceil(summercampConfig.campers * .6);
    if (summercampConfig.campers * .6 > summercampConfig.staff) {
        console.log(`Error! ${summercampConfig.campers} requires at least ${requiredStaff} staff, but there are only ${summercampConfig.staff}.`);
        return false;
    }

    if (summercampConfig.percentFlats > 60 || summercampConfig.percentFlats < 40) {
        console.log(`Error! Please choose between 40-60 percent flats`);
        return false;
    }

    let flats = summercampConfig.campers * Math.ceil(summercampConfig.percentFlats/100);
    let sharps = summercampConfig.campers - flats;

    if (flats % summercampConfig.bandSize) {
        console.log(`Error! There are ${flats} flats and bandSize is set to ${summercampConfig.bandSize}, which does not divide evenly.`);
        return false;
    }

    if (sharps % summercampConfig.bandSize) {
        console.log(`Error! There are ${sharps} sharps and bandSize is set to ${summercampConfig.bandSize}, which does not divide evenly.`);
        return false;
    }

    return true;
}

(async () => {
    main();
})();