import * as Q from "../src/queries/index.js";
import * as db from "../src/database/index.js";
import { initDb, readDataProfile, login, errmgr as loadDataErrors } from './load-data.js';
import chai from 'chai';
const expect = chai.expect;
import winston from 'winston';

// different levels of access tokens
let adminJwt, staffJwt, clientJwt;
// the raw data that was imported into the database, so we can check for accuracy
let importedData = {};
let adminUser, staffUser, clientUser;
describe('initial-data-import', function () {
    this.timeout(50000);
    before(async function () {
        winston.add(new winston.transports.Console({format: winston.format.simple()}));
        winston.level = 'debug';
        let dataProfile = {
            users: "./data/users.json",
            settings: "./data/settings.json",
            events: "./data/events.json",
            placements: './data/placements.json'
        };
        try {
            importedData = await readDataProfile(dataProfile); 
            adminUser = importedData.usersData.find(user => user.username == 'mayor');
            staffUser = importedData.usersData.find(user => user.userType == 'STAFF'); // random staff
            clientUser = importedData.usersData.find(user => user.userType == 'CLIENT'); // random client
            await initDb(importedData);
        }
        catch(err) {
            loadDataErrors.addError(err);
        }
        
        try {
            adminJwt = await login(adminUser.username, adminUser.password);
            clientJwt = await login(clientUser.username, clientUser.password);
            staffJwt = await login(staffUser.username, staffUser.password);
            if (!adminJwt || !clientJwt || !staffJwt) {
                throw new Error("Could not login");
            }
        }
        catch(err) {
            loadDataErrors.addError(err);
        }
    });
    after(async function() {
        process.exit(0);
    });
    it('does not report errors', async function() {
        let errs = loadDataErrors.getErrors();
        if (errs.length > 0) {
            winston.error(errs);
        }
        expect(errs.length).to.equal(0);
    });
    it(`has the right number of users`, async function () {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, adminJwt);
        expect(dbres.data.users.length).to.equal(importedData.usersData.length);
    });
    it(`has the right number of tshirt sizes`, async function () {
        let dbres = await db.query(Q.TSHIRT_SIZES.GET_ALL(), {}, adminJwt);
        expect(dbres.data.tShirtSizes.length).to.equal(importedData.settingsData.tShirtSizes.length);
    });
    it('assigned the right tshirt size to each user', async function() {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, adminJwt);
        dbres.data.users.map(user => {
            let jsonUser = importedData.usersData.find(u => u.name == user.name);
            expect(user.usersProtectedInfo.tShirtSize.name).to.equal(jsonUser.tShirtSize);
        });
    });
    it("lets staff users see all the users in Users table (limited info only)", async function() {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, staffJwt);
        expect(dbres.data.users.length).to.equal(importedData.usersData.length);
    });
    it("lets staff users see all the users protected info", async function() {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, staffJwt);
        for (var user of dbres.data.users) {
            expect(user.usersProtectedInfo).to.not.be.null;
        }
    });
    it("does not let staff users see anyone else's private info", async function () {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, staffJwt);
        for (var user of dbres.data.users) {
            if (user.login?.username != staffUser.username) {
                expect(user.usersPrivateInfo).to.be.null;
                expect(user.usersProtectedInfo).to.not.be.null;
                expect(user.login).to.be.null;
                expect(user.emergencyContacts).to.be.empty;
            }
            else {
                expect(user.usersPrivateInfo.address).to.equal(staffUser.address);
                expect(user.usersPrivateInfo.email).to.equal(staffUser.email);
                expect(user.usersProtectedInfo.tShirtSize.name).to.equal(staffUser.tShirtSize);
                let names = staffUser.emergencyContacts.map(item => item.name);
                user.emergencyContacts.map(item => expect(names).to.contain(item.name));
            }
        }
    });
    it("lets client users see all the users shared info", async function() {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, clientJwt);
        expect(dbres.data.users.length).to.equal(importedData.usersData.length);
    });
    it("does not let client users see anyone else's private or protected info", async function () {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, clientJwt);
        for (var user of dbres.data.users) {
            if (user.login?.username != clientUser.username) {
                expect(user.usersPrivateInfo).to.be.null;
                expect(user.usersProtectedInfo).to.be.null;
                expect(user.login).to.be.null;
                expect(user.emergencyContacts).to.be.empty;
            }
            else {
                expect(user.usersPrivateInfo.address).to.equal(clientUser.address);
                expect(user.usersProtectedInfo.tShirtSize.name).to.equal(clientUser.tShirtSize);
                expect(user.usersPrivateInfo.email).to.equal(clientUser.email);
                let names = clientUser.emergencyContacts.map(item => item.name);
                user.emergencyContacts.map(item => expect(names).to.contain(item.name));
            }
        }
    });
    it("has emergency contact info, accessible to admins", async function() {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, adminJwt);
        dbres.data.users.map(user => {
            let jsonUser = importedData.usersData.find(u => u.name == user.name);
            let names = user.emergencyContacts.map(item => item.name);
            jsonUser.emergencyContacts.map(item => expect(names).to.contain(item.name));
        });
    }),
    it("does not let public users see any user info", async function() {
        let dbres = await db.query(Q.USERS.GET_ALL(), {}, null);
        expect(dbres.errors.length).to.not.equal(0);
        expect (dbres.data).to.be.null;

        dbres = await db.query(Q.USERS_PROTECTED_INFO.GET_ALL(), {}, null);
        expect(dbres.errors.length).to.not.equal(0);
        expect (dbres.data).to.be.null;

        dbres = await db.query(Q.USERS_PRIVATE_INFO.GET_ALL(), {}, null);
        expect(dbres.errors.length).to.not.equal(0);
        expect (dbres.data).to.be.null;

    })
    it ("has the right locations", async function() {
        let dbres = await db.query(Q.LOCATIONS.GET_ALL(), {}, adminJwt);
        expect(dbres.data.locations.length).to.equal(importedData.settingsData.locations.length);
        let locationNames = importedData.settingsData.locations.map(location => location.name);
        dbres.data.locations.map(location => expect(locationNames).to.contain(location.name));
    });
    it (`has the right number of rooms at each location`, async function() {
        let dbres = await db.query(Q.LOCATIONS.GET_ALL(), {}, adminJwt);
        dbres.data.locations.map(location => {
            let jsonLocation = importedData.settingsData.locations.find(l => l.name == location.name);
            if (jsonLocation.rooms) {
                expect(location.rooms.length).to.equal(jsonLocation.rooms.length);
                let names = location.rooms.map(item => item.name);
                jsonLocation.rooms.map(item => expect(names).to.contain(item.name));
            }
            else {
                expect(location.rooms).to.be.empty;
            }
        });
    });
    it (`has the correct activity types`, async function() {
        let dbres = await db.query(Q.ACTIVITY_TYPES.GET_ALL(), {}, adminJwt);
        let names = dbres.data.activityTypes.map(a => a.name);
        importedData.settingsData.activityTypes.map(item => expect(names).to.contain(item));
    });
    it ("has the correct event types", async function() {
        let dbres = await db.query(Q.EVENT_TYPES.GET_ALL(), {}, adminJwt);
        let names = dbres.data.eventTypes.map(a => a.name);
        importedData.settingsData.eventTypes.map(item => expect(names).to.contain(item));
    });
    it ("has the correct track types", async function() {
        let dbres = await db.query(Q.TRACK_TYPES.GET_ALL(), {}, adminJwt);
        let names = dbres.data.trackTypes.map(a => a.name);
        importedData.settingsData.trackTypes.map(item => expect(names).to.contain(item));
    });
    it ("has the correct user group types", async function() {
        let dbres = await db.query(Q.USER_GROUP_TYPES.GET_ALL(), {}, adminJwt);
        let names = dbres.data.userGroupTypes.map(a => a.name);
        importedData.settingsData.userGroupTypes.map(item => expect(names).to.contain(item));
    });
    it ("has the correct roles", async function() {
        let dbres = await db.query(Q.ROLES.GET_ALL(), {}, adminJwt);
        let names = dbres.data.roles.map(a => a.name);
        importedData.settingsData.roles.map(item => expect(names).to.contain(item));
    });

    it ("has the correct events", async function() {
        let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        let names = dbres.data.events.map(a => a.name);
        importedData.eventsData.map(item => expect(names).to.contain(item.name));
    });
    it("has the right number of locations for events", async function() {
        let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        dbres.data.events.map(event => {
            let jsonEvent = importedData.eventsData.find(l => l.name == event.name);
            if (jsonEvent.locations) {
                let names = event.locations.map(a => a.name);
                jsonEvent.locations.map(item => expect(names).to.contain(item));
            }
            else {
                expect(event.locations).to.be.empty;
            }
        }); 
    });
    it("has the correct tracks for events", async function() {
        let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        dbres.data.events.map(event => {
            let jsonEvent = importedData.eventsData.find(item => item.name == event.name);
            if (jsonEvent.tracks) {
                let names = event.tracks.map(a => a.name);
                jsonEvent.tracks.map(item => expect(names).to.contain(item.name));
            }
            else {
                expect(event.tracks).to.be.empty;
            }
        }); 
    });
    it ("has correct usertype-based visibility for events", async function() {
        // public sees no events
        let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, null);
        expect(dbres.data).to.be.null;

        dbres = await db.query(Q.EVENTS.GET_ALL(), {}, clientJwt);
        let clientViewOfEvents = dbres.data.events.map(e => e.name);
        
        dbres = await db.query(Q.EVENTS.GET_ALL(), {}, staffJwt);
        let staffViewOfEvents = dbres.data.events.map(e => e.name);

        dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        let adminViewOfEvents = dbres.data.events.map(e => e.name);

        importedData.eventsData.map(event => {
            if (event.visibility == 'CLIENT') {
                expect(clientViewOfEvents).to.contain(event.name);
                expect(staffViewOfEvents).to.contain(event.name);
                expect(adminViewOfEvents).to.contain(event.name);
            }
            else if (event.visibility == 'STAFF') {
                expect(clientViewOfEvents).to.not.contain(event.name);
                expect(staffViewOfEvents).to.contain(event.name);
                expect(adminViewOfEvents).to.contain(event.name);
            }
            else if (event.visibility == 'ADMIN') {
                expect(clientViewOfEvents).to.not.contain(event.name);
                expect(staffViewOfEvents).to.not.contain(event.name);
                expect(adminViewOfEvents).to.contain(event.name);
            }
        });
    });
    it ("has activities for events", async function() {
        let dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        dbres.data.events.map(event => {
            let jsonEvent = importedData.eventsData.find(e => e.name == event.name);
            if (jsonEvent.activities) {
                let names = event.activities.map(item => item.name);
                jsonEvent.activities.map(item => expect(names).to.contain(item.name));
            }
            else {
                expect(event.activities).to.be.empty;
            }
        });
    });
    it ("has correct usertype visibility for activities", async function() {
        // public sees no events
        let dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, null);
        expect(dbres.data).to.be.null;

        dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, clientJwt);
        let clientView = dbres.data.activities.map(e => e.name);
        
        dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, staffJwt);
        let staffView = dbres.data.activities.map(e => e.name);

        dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, adminJwt);
        let adminView = dbres.data.activities.map(e => e.name);

        importedData.eventsData.map(event => event.activities?.map(activity => {
            if (activity.visibility == 'CLIENT') {
                expect(clientView).to.contain(activity.name);
                expect(staffView).to.contain(activity.name);
                expect(adminView).to.contain(activity.name);
            }
            else if (activity.visibility == 'STAFF') {
                expect(clientView).to.not.contain(activity.name);
                expect(staffView).to.contain(activity.name);
                expect(adminView).to.contain(activity.name);
            }
            else if (activity.visibility == 'ADMIN') {
                expect(clientView).to.not.contain(activity.name);
                expect(staffView).to.not.contain(activity.name);
                expect(adminView).to.contain(activity.name);
            }
        }));
    });
    
    it("has the right rooms and tracks for activities", async function() {
        let dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, adminJwt);
        let jsonActivities = importedData.eventsData.map(e => e.activities ?? []);
        jsonActivities = jsonActivities.flat();
        dbres.data.activities.map(activity => {
            let jsonActivity = jsonActivities.find(a => a.name == activity.name);
            if (jsonActivity.roomNames) {
                let names = activity.rooms.map(item => item.name);
                jsonActivity.roomNames.map(item => expect(names).to.contain(item));
            }
            else {
                expect(activity.rooms).to.be.empty;
            }

            if (jsonActivity.trackName) {
                expect(activity.track).to.not.be.null;
                expect(activity.track.name).to.equal(jsonActivity.trackName);
            }
        });
    });

    // this test is a bit crude as it just checks that repeating activities have more than one db entry
    // in reality, a repeating weekday event that starts on a friday for an event that ends on a sunday
    // would have no repeats
    it("has repeating activities", async function() {
        let dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, adminJwt);
        let jsonActivities = importedData.eventsData.map(e => e.activities ?? []);
        jsonActivities = jsonActivities.flat();
        jsonActivities.map(jsonActivity => {
            if (jsonActivity.repeat != 'None') {
                let dbActivities = dbres.data.activities.filter(a => a.name == jsonActivity.name);
                expect(dbActivities.length).to.be.greaterThan(1);
            }
        });
    });

    it.skip("has correct visibility (participant) for activities", async function() {

    });

    it("has the correct roles for activities", async function() {
        let dbres = await db.query(Q.ACTIVITIES.GET_ALL(), {}, adminJwt);
        let dbActivities = dbres.data.activities;
        dbres = await db.query(Q.ROLES(), {}, jwt);
        let dbRoles = dbres.data.roles;

        let jsonActivities = importedData.eventsData.map(e => e.activities ?? []);
        jsonActivities = jsonActivities.flat();
        dbActivities.map(dbActivity => {
            let jsonActivity = jsonActivities.find(a => a.name == dbActivity.name);
            if (jsonActivity.roles) {
                let roleLists = dbActivity.roleIds.split(",");
                for (let roleList of roleLists) {
                    // check each role id list, e.g. [1, 2, 3] and make sure it has a match in the JSON document
                    // TODO left off here
                }
                let roleNames = [];
                for (let roleId of roleIds) {
                    let dbRole = dbRoles.find(r => r.id == parseInt(roleId));

                }

                jsonActivity.roomNames.map(item => expect(names).to.contain(item));
            }
            else {
                expect(activity.rooms).to.be.empty;
            }

            if (jsonActivity.trackName) {
                expect(activity.track).to.not.be.null;
                expect(activity.track.name).to.equal(jsonActivity.trackName);
            }
        });
    });
    it("has the correct placements", async function() {
        let dbres = await db.query(Q.PLACEMENTS.GET_ALL(), {}, adminJwt);
        let placements = dbres.data.placements;
        dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        let events = dbres.data.events;
        let jsonPlacements = importedData.placementsData;
        // look at all the user placements for each event
        jsonPlacements.map(jsonEventPlacements => {
            jsonEventPlacements.users.map(jsonUser => {
                let eventId = events.find(e => e.name == jsonEventPlacements.eventName).id;
                jsonUser.userRoles.map(jsonRole => {
                    let dbPlacement = placements.find(item => 
                        item.event.id == eventId
                        && 
                        item.user.name == jsonUser.userName
                        &&
                        item.role.name == jsonRole);
                    expect(dbPlacement).to.not.be.undefined;
                });
            });
        });
    });
    
    it("has the correct photos", async function() {
        // check photos.get_all for correct user, photo, event
        let dbres = await db.query(Q.PHOTOS.GET_ALL(), {}, adminJwt);
        let photos = dbres.data.photos;
        dbres = await db.query(Q.EVENTS.GET_ALL(), {}, adminJwt);
        let events = dbres.data.events;
        dbres = await db.query(Q.USERS.GET_ALL(), {}, adminJwt);
        let users = dbres.data.users;
        // each user appears once in placement[event].users 
        importedData.placementsData.map(jsonEventPlacements => {
            let dbevent = events.find(item => item.name == jsonEventPlacements.eventName);
            jsonEventPlacements.users.map(u => {
                let dbuser = users.find(item => item.name == u.userName);
                let dbphoto = photos.find(photo => photo.url == u.userPhoto && photo.event.id == dbevent.id);
                expect(dbphoto).to.not.be.undefined;
                expect(dbphoto.event.id).to.equal(dbevent.id);
                expect(dbphoto.user.id).to.equal(dbuser.id);
            });
        });
    });
    it ("has the correct user groups", async function() {
        let dbres = await db.query(Q.USER_GROUPS.GET_ALL_WITH_USERS(), {}, adminJwt);
        importedData.placementsData.map(placement => {
            placement.userGroups.map(jsonUserGroup => {
                let dbUserGroup = dbres.data.userGroups.find(item => item.name == jsonUserGroup.name);
                expect(dbUserGroup).to.not.be.undefined;
                expect(dbUserGroup.track.trackType.name).to.equal(jsonUserGroup.track);
                expect(dbUserGroup.userGroupType.name).to.equal(jsonUserGroup.userGroupType);

                jsonUserGroup.users.map(userName => {
                    let usersInGroup = dbUserGroup.users.map(item => item.name);
                    expect(usersInGroup).to.contain(userName);
                });
            });
        });
    });
});

