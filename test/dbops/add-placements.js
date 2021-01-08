import * as Q from "../../src/queries/index.js";
import * as db from "../../src/database/index.js";
import winston from "winston";

async function addPlacements(data, jwt, errmgr) {
    winston.info("Adding Placements");
    
    for (var placement of data) {
        try {
            await addPlacement(placement, jwt);
        }
        catch(err) {
            errmgr.addError(err);
        }
    }
}

async function addPlacement(placement, jwt) {
    let dbres = await db.query(Q.USERS.GET_ALL(), {}, jwt);
    let users = dbres.data.users;
    
    dbres = await db.query(Q.EVENTS.GET_ALL(), {}, jwt);
    let events = dbres.data.events;
    let dbevent = events.find(item => item.name == placement.eventName);

    dbres = await db.query(Q.ROLES.GET_ALL(), {}, jwt);
    let roles = dbres.data.roles;

    for (var user of placement.users) {
        let dbuser = users.find(u => u.name == user.userName);
        for (var role of user.userRoles) {
            let dbrole = roles.find(item => item.name == role);
            dbres = await db.query(
                Q.PLACEMENTS.CREATE(),
                {
                    input: {
                        userId: dbuser.id,
                        eventId: dbevent.id,
                        roleId: dbrole.id,
                        confirmed: user.confirmed,
                        dropped: user.dropped
                    }
                }, 
                jwt
            );
            if (!dbres.success) {
                let err = new Error("add event error");
                err.errors = dbres.errors;
                throw err;
            }
        }

        await addPhoto(user.userPhoto, `Profile photo for ${dbuser.name}`, dbuser.id, dbevent.id, jwt);
        
        for (var availability of user.userAvailability) {
            await addAvailability(availability, dbuser.id, dbevent.id, jwt);
        }
    }

    dbres = await db.query(Q.USER_GROUP_TYPES.GET_ALL(), {}, jwt);
    let userGroupTypes = dbres.data.userGroupTypes;
    
    for (var userGroup of placement.userGroups) {
        // create a user group 
        dbres = await db.query(Q.USER_GROUPS.CREATE(), 
            {
                input: {
                    name: userGroup.name,
                    eventId: dbevent.id,
                    trackId: dbevent.tracks.find(item => item.trackType.name == userGroup.track).id,
                    userGroupTypeId: userGroupTypes.find(item => item.name == userGroup.userGroupType).id
                }
            },
            jwt
        );
        if (!dbres.success) {
            let err = new Error("add user group error");
            err.errors = dbres.errors;
            throw err;
        }
        let userGroupId = dbres.data.createUserGroup.userGroup.id;

        for (var user of userGroup.users) {
            let dbUser = users.find(item => item.name == user);
            dbres = await db.query(
                Q.USERS_USER_GROUPS.CREATE(),
                {
                    input: {
                        userId: dbUser.id,
                        userGroupId
                    }
                },
                jwt
            );
            if (!dbres.success) {
                let err = new Error("add user to user group error");
                err.errors = dbres.errors;
                throw err;
            }
        }
        
    }

    return;
    
}

async function addPhoto(url, alt, userId, eventId, jwt) {
    let dbres = await db.query(
        Q.PHOTOS.CREATE(),
        {
            input: {
                url,
                alt,
                eventId,
                userId
            }
        }, 
        jwt
    );
    if (!dbres.success) {
        let err = new Error("add photo error");
        err.errors = dbres.errors;
        throw err;
    }
}

async function addAvailability(availability, userId, eventId, jwt) {
    let dbres = await db.query(
        Q.USER_AVAILABILITY.CREATE(),
        {
            input: {
                start: availability.start,
                end: availability.end,
                eventId,
                userId
            }
        }, 
        jwt
    );
    if (!dbres.success) {
        let err = new Error("add photo error");
        err.errors = dbres.errors;
        throw err;
    }
}

export { addPlacements };
