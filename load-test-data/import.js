import * as db from '../src/database.js';
import * as Q from '../src/queries/index.js';

var jwt = null;
async function importIntoDb(key, data, authToken) {
    if (key == "" || !data) {
        return;
    }
    jwt = authToken;
    console.log(`Importing ${key}`);
    await importer['add_'+key](data);
}

const importer = {
    add_locations: async data => {
        for (const location of data) {
            let dbres = await db.query(
                Q.LOCATIONS.CREATE, 
                { 
                    input: {
                        location: {
                            name: location.name
                        }
                    }
                },
                jwt
            );
            if (!dbres.success) {
                console.log(`Could not create location ${location.name}`);
                console.log(dbres.errors);
                continue;
            }
            let locationId = dbres.data.createLocation.location.id;
            for (const room of location.rooms) {
                dbres = await db.query (
                    Q.ROOMS.CREATE,
                    {
                        input: {
                            room: {
                                name: room,
                                locationId
                            }
                        }
                    },
                    jwt    
                );
                if (!dbres.success) {
                    console.log(`Could not create room ${room}`);
                    console.log(dbres.errors);
                }
            }
        }    
    },
    add_roleGroups: async data => {
        
    },
    add_roles: async data => {
        
    },  
    add_sessionTypes: async data => {
        for (const sessionType of data) {
            let dbres = await db.query(
                Q.SESSION_TYPES.CREATE, 
                { 
                    input: {
                        sessionType: {
                            name: sessionType
                        }
                    }
                },
                jwt
            );
            if (!dbres.success) {
                console.log(`Could not create session type ${sessionType}`);
                console.log(dbres.errors);
                continue;
            }
        }
    },
    add_tracks: async data => {
        for (const track of data) {
            let dbres = await db.query(
                Q.TRACKS.CREATE, 
                { 
                    input: {
                        track: {
                            name: track
                        }
                    }
                },
                jwt
            );
            if (!dbres.success) {
                console.log(`Could not create track ${track}`);
                console.log(dbres.errors);
                continue;
            }
        }
    },
    add_tshirtSizes: async data => {
        for (const tshirtSize of data) {
            let dbres = await db.query(
                Q.TSHIRT_SIZES.CREATE, 
                { 
                    input: {
                        tShirtSize: {
                            name: tshirtSize.name,
                            order: tshirtSize.order
                        }
                    }
                },
                jwt
            );
            if (!dbres.success) {
                console.log(`Could not create tshirt size ${tshirtSize.name}`);
                console.log(dbres.errors);
                continue;
            }
        }    
    },
    add_users: async data => {
        
    }
    
    
};


export { importIntoDb };