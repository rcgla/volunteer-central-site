import * as Q from "../../src/queries/index.js";
import * as db from "../../src/database/index.js";
import winston from "winston";

async function addSettings(data, jwt, errmgr) {
    winston.info("Adding Settings");
   
    for (var setting in data) {
        if (setting == 'tShirtSizes') {
            for (var size of data[setting]) {
                let dbres = await db.query(
                    Q.TSHIRT_SIZES.CREATE(),
                    {
                        input: {
                            name: size.name,
                            order: size.order
                        }
                    }, 
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add tshirt size error");
                }
            }
        }
        else if (setting == 'eventTypes') {
            for (var eventType of data[setting]) {
                let dbres = await db.query(
                    Q.EVENT_TYPES.CREATE(),
                    {
                        input: {
                            name: eventType
                        }
                    },
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add event type error");
                }
            }
        }
        else if (setting == 'activityTypes') {
            for (var activityType of data[setting]) {
                let dbres = await db.query(
                    Q.ACTIVITY_TYPES.CREATE(),
                    {
                        input: {
                            name: activityType
                        }
                    },
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add activity type error");
                }
            }
        }
        else if (setting == 'locations') {
            for (var location of data[setting]) {
                let dbres = await db.query(
                    Q.LOCATIONS.CREATE(),
                    {
                        input: {
                            name: location.name,
                            description: location.description || null,
                            address: location.address || null,
                            notes: location.notes || null
                        }
                    }, 
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add location error");
                }
                let locationId = dbres.data.createLocation.location.id;
                // add rooms
                if (location.rooms) {
                    for (var room of location.rooms) {
                        let dbres = await db.query(
                            Q.ROOMS.CREATE(),
                            {
                                input: {
                                    name: room.name,
                                    description: room.description || null,
                                    notes: room.notes || null,
                                    locationId
                                }
                            },
                            jwt
                        );
                        if (!dbres.success) {
                            errmgr.addErrors(dbres.errors);
                            throw new Error("add room error");
                        }
                    }
                }
            }   
        }
        else if (setting == 'trackTypes') {
            for (var trackType of data[setting]) {
                let dbres = await db.query(
                    Q.TRACK_TYPES.CREATE(),
                    {
                        input: {
                            name: trackType
                        }
                    },
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add track type error");
                }
            }
        }
        else if (setting == 'userGroupTypes') {
            for (var userGroupType of data[setting]) {
                let dbres = await db.query(
                    Q.USER_GROUP_TYPES.CREATE(),
                    {
                        input: {
                            name: userGroupType
                        }
                    },
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add user group type error");
                }
            }
        }
        else if (setting == 'roles') {
            for (var role of data[setting]) {
                let dbres = await db.query(
                    Q.ROLES.CREATE(),
                    {
                        input: {
                            name: role
                        }
                    },
                    jwt
                );
                if (!dbres.success) {
                    errmgr.addErrors(dbres.errors);
                    throw new Error("add role error");
                }
            }
        }
    }   
}

export {addSettings};
