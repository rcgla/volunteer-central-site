import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as helpers from './helpers.js';

export default function generatePlacements(config, users, event) {
    let placement = {
        eventName: event.name
    };

    let usersPool = [...users];
    let photoPool = JSON.parse(fs.readFileSync(path.join(__dirname, 'photo-cache.json')));
    
    // select the overall numbers of staff & campers from the total users pool
    let selectedStaff = helpers.randomItemsFromArray(usersPool.filter(u => u.userType == 'STAFF'), config.staff);
    
    let userPlacements = [];
    let userGroups = [];
    if (event.type == 'SUMMERCAMP') {
        let selectedCampers = helpers.randomItemsFromArray(usersPool.filter(u => u.userType == 'CLIENT'),config.campers);
        let flats = helpers.randomItemsFromArray(selectedCampers, Math.ceil(config.campers * (config.percentFlats/100)));
        let sharps = selectedCampers.filter(u => !flats.includes(u));
        
        let flatsCounselors = helpers.randomItemsFromArray(selectedStaff, flats.length / config.bandSize);
        let sharpsCounselors = helpers.randomItemsFromArray(selectedStaff.filter(u => !flatsCounselors.includes(u)), sharps.length / config.bandSize);
        
        let flatsCoaches = helpers.randomItemsFromArray(
            selectedStaff.filter(u => !flatsCounselors.includes(u) && !sharpsCounselors.includes(u)), 
            flats.length / config.bandSize
        );
        let sharpsCoaches = helpers.randomItemsFromArray(
            selectedStaff.filter(u => !flatsCounselors.includes(u) && !sharpsCounselors.includes(u) && !flatsCoaches.includes(u)), 
            sharps.length / config.bandSize
        );
        let supportStaff = selectedStaff.filter(u => 
            !flatsCounselors.includes(u) && !sharpsCounselors.includes(u) 
            && !flatsCoaches.includes(u) && !sharpsCoaches.includes(u));
        

        let instruments = ['Drums', 'Guitar', 'Bass', 'Keys', 'Vocals'];
        let flatsPlacements = flats.map((user, idx) => {
            let photo = helpers.findRandomPhoto(8, 11, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.fullTimeAvailability(event.start, event.end),
                userRoles: ["Flat", instruments[idx % instruments.length], "Camper"],
                userPhoto: photo.url
            }
        });

        let sharpsPlacements = sharps.map((user, idx) => {
            let photo = helpers.findRandomPhoto(12, 17, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.fullTimeAvailability(event.start, event.end),
                userRoles: ["Sharp", instruments[idx % instruments.length], "Camper"],
                userPhoto: photo.url
            };
        });

        let flatsCounselorsPlacements = flatsCounselors.map((user, idx) => {
            let photo = helpers.findRandomPhoto(20, 60, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.fullTimeAvailability(event.start, event.end),
                userRoles: ["Counselor", "Flat", "Volunteer"],
                userPhoto: photo.url
            };
        });

        let sharpsCounselorsPlacements = sharpsCounselors.map((user, idx) => {
            let photo = helpers.findRandomPhoto(20, 60, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.fullTimeAvailability(event.start, event.end),
                userRoles: ["Counselor", "Sharp", "Volunteer"],
                userPhoto: photo.url
            };
        });

        let flatsCoachesPlacements = flatsCoaches.map((user, idx) => {
            let photo = helpers.findRandomPhoto(20, 60, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.fullTimeAvailability(event.start, event.end),
                userRoles: ["Coach", "Flat", instruments[idx % instruments.length], "Instructor", "Volunteer"],
                userPhoto: photo.url
            };
        });

        let sharpsCoachesPlacements = sharpsCoaches.map((user, idx) => {
            let photo = helpers.findRandomPhoto(20, 60, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.fullTimeAvailability(event.start, event.end),
                userRoles: ["Coach", "Sharp", instruments[idx % instruments.length], "Instructor", "Volunteer"],
                userPhoto: photo.url
            };
        });

        let supportRoles = ['Roadie', 'General support'];
        let supportStaffPlacements = supportStaff.map((user, idx) => {
            let photo = helpers.findRandomPhoto(20, 60, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  Math.random() < 0.5 ? helpers.fullTimeAvailability(event.start, event.end) 
                : helpers.randomPartTimeAvailability(event.start, event.end),
                userRoles: [supportRoles[idx % 2], "Volunteer", "Support"],
                userPhoto: photo.url
            };
        });
        userPlacements.push(
            ...flatsPlacements,
            ...sharpsPlacements,
            ...flatsCounselorsPlacements,
            ...sharpsCounselorsPlacements,
            ...flatsCoachesPlacements,
            ...sharpsCoachesPlacements,
            ...supportStaffPlacements
        );

        userGroups = makeBands(
            config.bandSize, 
            flatsPlacements, sharpsPlacements, 
            flatsCounselorsPlacements, sharpsCounselorsPlacements, 
            flatsCoachesPlacements, sharpsCoachesPlacements);

    }
    else {
        // non-summercamp event, e.g. LOADIN, LOADOUT
        let selectedStaffPlacements = selectedStaff.map(user => {
            let photo = helpers.findRandomPhoto(20, 60, photoPool);
            photoPool.splice(photo.index, 1); // remove the photo from the pool of options
            return {
                userName: user.name,
                userAvailability:  helpers.randomAfternoonAvailability(event.start, event.end),
                userRoles: ["General support", "Support"],
                userPhoto: photo.url
            };
        });
        userPlacements.push(
            ...selectedStaffPlacements
        );
    }

    // always include the mayor and 2 random admins as directors
    let directors = helpers.randomItemsFromArray(usersPool.filter(u => u.userType == 'ADMIN' && u.username != 'mayor'), 2);
    let directorPlacements = directors.map(user => {
        let photo = helpers.findRandomPhoto(20, 60, photoPool);
        photoPool.splice(photo.index, 1); // remove the photo from the pool of options
        return {
            userName: user.name,
            userAvailability: helpers.fullTimeAvailability(event.start, event.end),
            userRoles: ['Co-director', "Volunteer"],
            userPhoto: photo.url
        };
    });

    let photo = helpers.findRandomPhoto(20, 60, photoPool);
    photoPool.splice(photo.index, 1); // remove the photo from the pool of options
    let adminPlacements = [
        {
            userName: 'Mayor of Awesometown',
            userAvailability: helpers.fullTimeAvailability(event.start, event.end),
            userRoles: ["Mayor", "Volunteer"],
            userPhoto: photo.url
        }, 
        ...directorPlacements
    ];
    
    placement.users = [...userPlacements, ...adminPlacements];
    // everyone confirmed, no one dropped (lol)
    placement.users.map(u => {
        u.confirmed = true;
        u.dropped = false;
    });
    placement.userGroups = userGroups;
    return placement;
}

// name the bands the same as the band practice activity
// to easily link them up later
function makeBands(
    bandSize, 
    flatsPlacements, sharpsPlacements, 
    flatsCounselorsPlacements, sharpsCounselorsPlacements, 
    flatsCoachesPlacements, sharpsCoachesPlacements) 
{
    let userGroups = [];
    let numSharpsBands = sharpsPlacements.length / bandSize;
    let numFlatsBands = flatsPlacements.length / bandSize;
    let bandIdx = 1;

    let sortByInstrument = placements => ({
        "drums": placements.filter(item => item.userRoles.includes("Drums")),
        "vocals": placements.filter(item => item.userRoles.includes("Vocals")),
        "keys": placements.filter(item => item.userRoles.includes("Keys")),
        "guitar": placements.filter(item => item.userRoles.includes("Guitar")),
        "bass": placements.filter(item => item.userRoles.includes("Bass"))
    });
    let flatsByInstrument = sortByInstrument(flatsPlacements);
    let sharpsByInstrument = sortByInstrument(sharpsPlacements);
    
    for (var i = 0; i<numSharpsBands; i++) {
        let band = {
            "name": `Band ${bandIdx} (Sharps)`,
            "track": "MUSIC",
            "userGroupType": "BAND",
            "users": [
                sharpsByInstrument.drums[i].userName,
                sharpsByInstrument.vocals[i].userName,
                sharpsByInstrument.keys[i].userName,
                sharpsByInstrument.guitar[i].userName,
                sharpsByInstrument.bass[i].userName,
                sharpsCounselorsPlacements[i].userName,
                sharpsCoachesPlacements[i].userName
            ]
        };
        userGroups.push(band);
        bandIdx++;
    }
    for (i = 0; i<numFlatsBands; i++) {
        let band = {
            "name": `Band ${bandIdx} (Flats)`,
            "track": "MUSIC",
            "userGroupType": "BAND",
            "users": [
                flatsByInstrument.drums[i].userName,
                flatsByInstrument.vocals[i].userName,
                flatsByInstrument.keys[i].userName,
                flatsByInstrument.guitar[i].userName,
                flatsByInstrument.bass[i].userName,
                flatsCounselorsPlacements[i].userName,
                flatsCoachesPlacements[i].userName
            ]
        };
        userGroups.push(band);
        bandIdx++;
    }

    return userGroups;
}
