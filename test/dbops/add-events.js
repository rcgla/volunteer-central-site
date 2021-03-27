import * as Q from "../../src/queries/index.js";
import * as db from "../../src/database/index.js";
import winston from "winston";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import weekday from "dayjs/plugin/weekday.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);

async function addEvents(data, jwt, errmgr) {
    winston.info("Adding Events");
    
    for (var event of data) {
        try {
            await addEvent(event, jwt);
        }
        catch(err) {
            errmgr.addError(err);
        }
    }
}

async function addEvent(event, jwt) {
    let dbres = await db.query(Q.EVENT_TYPES.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error("Could not get event types");
        err.errors = dbres.errors;
        throw err;
    }
    let eventType = dbres.data.eventTypes.find(item => item.name == event.eventType);
    dbres = await db.query(
        Q.EVENTS.CREATE(),
        {
            input: {
                name: event.name,
                description: event.description || null,
                start: event.start,
                end: event.end,
                eventTypeId: eventType.id,
                visibility: event.visibility
            }
        }, 
        jwt
    );
    if (!dbres.success) {
        let err = new Error("add event error");
        err.errors = dbres.errors;
        throw err;
    }
    let newEventId = dbres.data.createEvent.event.id;
    dbres = await db.query(Q.EVENTS.GET(), {id: newEventId}, jwt);
    let dbEvent = dbres.data.event;

    await addTracks(event.tracks, jwt, dbEvent);
    await addActivities(event.activities, jwt, dbEvent);
    await addLocations(event.locations, jwt, dbEvent);
}

async function addLocations(locationNames, jwt, event) {
    if (!locationNames) {
        return;
    }
    let dbres = await db.query(Q.LOCATIONS.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error("Could not get locations");
        err.errors = dbres.errors;
        throw err;
    }
    let locations = dbres.data.locations;

    for (var locationName of locationNames) {
        let location = locations.find(item => item.name == locationName);
        if (!location) {
            let err = new Error("could not find location " + locationName);
            throw err;
        }
        let dbres = await db.query(
            Q.EVENTS_LOCATIONS.CREATE(),
            {
                input: {
                    eventId: event.id,
                    locationId: location.id
                }
            },
            jwt
        );
        if (!dbres.success) {
            let err = new Error("Could not add event-location");
            err.errors = dbres.errors;
            throw err;
        }
    }
}

async function addTracks(tracks, jwt, event) {
    if (!tracks) {
        return;
    }
    for (var track of tracks) {
        let dbres = await db.query(Q.TRACK_TYPES.GET_ALL(), {}, jwt);
        if (!dbres.success) {
            let err = new Error("Could not get track types");
            err.errors = dbres.errors;
            throw err;
        }
        let trackType = dbres.data.trackTypes.find(item => item.trackType == track.type);
        dbres = await db.query(
            Q.TRACKS.CREATE(),
            {
                input: {
                    name: track.name,
                    description: track.description || null,
                    start: track.start,
                    end: track.end,
                    trackTypeId: trackType.id,
                    eventId: event.id
                }
            }, 
            jwt
        );
        if (!dbres.success) {
            let err = new Error("add track error");
            err.errors = dbres.errors;
            throw err;
        }
    }
}

async function addActivities(activities, jwt, event) {
    if (!activities) {
        return;
    }
    for (var activity of activities) {
        if ((activity.visibility == 'CLIENT' && (event.visibility == 'STAFF' || event.visibility == 'ADMIN')) 
            ||
            (activity.visibility == 'STAFF' && event.visibility == 'ADMIN')) {
            throw new Error(`Activity ${activity.name} has user type visibility conflict with its parent event`);
        }

        let dbres = await db.query(Q.ACTIVITY_TYPES.GET_ALL(), {}, jwt);
        if (!dbres.success) {
            let err = new Error("Could not get activity types");
            err.errors = dbres.errors;
            throw err;
        }
        let activityType = dbres.data.activityTypes.find(item => item.name == activity.activityType);

        dbres = await db.query(Q.LOCATIONS.GET_ALL(), {}, jwt);
        if (!dbres.success) {
            let err = new Error("Could not get locations");
            err.errors = dbres.errors;
            throw err;
        }
        let location = dbres.data.locations?.find(item => item.name == activity.locationName);

        dbres = await db.query(Q.TRACKS.GET_ALL(), {}, jwt);
        if (!dbres.success) {
            let err = new Error("Could not get tracks");
            err.errors = dbres.errors;
            throw err;
        }
        let track = dbres.data.tracks?.find(item => item.name == activity.trackName);
        
        if (activity.repeat != "None" && !activity.hasOwnProperty('isRepeater')) {
            let repeatActivities = makeRepeatActivities(activity, event);
            addActivities(repeatActivities, jwt, event);
        }
        else {
            let newActivity = {
                name: activity.name,
                description: activity.description || null,
                notes: activity.notes || null,
                start: activity.start,
                end: activity.end,
                repeat: activity.repeat != 'None',
                visibility: activity.visibility ?? event.visibility, // inherit from event
                activityTypeId: activityType?.id || null,
                eventId: event.id,
                locationId: location?.id || null,
            }
            if (track) newActivity.trackId = track.id;
            dbres = await db.query(
                Q.ACTIVITIES.CREATE(),
                {
                    input: newActivity
                }, 
                jwt
            );
            if (!dbres.success) {
                let err = new Error("add activity error");
                err.errors = dbres.errors;
                throw err;
            }
            let addedActivity = dbres.data.createActivity.activity;
    
            if (activity.roomNames) {
                dbres = await db.query(Q.ROOMS.GET_ALL(), {}, jwt);
                if (!dbres.success) {
                    let err = new Error("Could not get rooms");
                    err.errors = dbres.errors;
                    throw err;
                }
                let rooms = dbres.data.rooms;
                for (var roomName of activity.roomNames) {
                    let room = rooms.find(item => item.name == roomName);
                    if (!room) {
                        let err = new Error(`Room with name=${roomName} does not exist`);
                        throw err;
                    }
                    dbres = await db.query(
                        Q.ACTIVITIES_ROOMS.CREATE(),
                        {
                            input: {
                                roomId: room.id,
                                activityId: addedActivity.id
                            }
                        },
                        jwt
                    );
                }
            }

            // activity roles are given as an array of arrays
            // e.g. [[A and B and C] or [D and E]]
            // add to the database as "A, B, C" and "D, E"
            if (activity.roles) {
                dbres = await db.query(
                    Q.ROLES.GET_ALL(),
                    {},
                    jwt
                );
                if (!dbres.success) {
                    let err = new Error("Could not get roles");
                    err.errors = dbres.errors;
                    throw err;
                }
                for (let roleList of activity.roles) {
                    let roleIds = [];
                    for (let roleName of roleList) {
                        let role = roleList.find(r => r.name == roleName);
                        if (role) {
                            roleIds.push(role.id);
                        }
                        else {
                            winston.log(`Role ${roleName} not found in db`);
                        }
                    }
                    let roleListStr = roleIds.join(", ");
                    dbres = await db.query(
                        Q.ACTIVITIES_ROLES.CREATE(),
                        {
                            input: {
                                activityId: addedActivity.id,
                                roleIds: roleListStr
                            },
                            jwt
                        }
                    );
                }
            }
        }
    }
}

// repeat the activity JSON except with different start/end values
function makeRepeatActivities(activity, event) {
    let activityStart = dayjs(activity.start);
    let activityEnd = dayjs(activity.end);
    let eventEnd = dayjs(event.end);
    let thisDate = activityStart;
    let newActivities = [];
    while (thisDate.isBefore(eventEnd)) {
        if (activity.repeat == 'EVERYDAY' || 
           (activity.repeat == 'WEEKDAYS' && thisDate.day() != 0 && thisDate.day() != 6)) {
            
            let newActivity = {...activity};
            newActivity.start = thisDate.format();
            newActivity.end = thisDate.set('hour', activityEnd.hour()).set('minute', activityEnd.minute()).set('second', activityEnd.second()).format();
            newActivity.isRepeater = true; // flag for the import process
            newActivities.push(newActivity);
        }
        thisDate = thisDate.add(1, 'day');
    }    
    return newActivities;
}


export { addEvents };
