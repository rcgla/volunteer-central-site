import * as helpers from './helpers.js';

export default function generateUsers(config) {
    let users = [];

    for (var i=0; i < config.campers; i++) {
        let camper = helpers.user('CLIENT');
        users.push(camper);
    }
    
    for (i=0; i<config.staff; i++) {
        let staff = helpers.user('STAFF');
        users.push(staff);
    }
    
    // always have 2 additional admins (they'll be directors)
    for (i=0; i<2; i++) {
        let admin = helpers.user('ADMIN');
        users.push(admin);
    }
    
    // we have one fixed admin so that whether the db has just been reset or the test/load-data script 
    // is being run many times in a row, one of the admin users is always the same
    let fixedAdminUser = helpers.user('ADMIN');
    let adminData = {
        name: "Mayor of Awesometown",
        username: "mayor",
        password: "dancingpaint",
        email: "mayor@example.com",
        address: "Mayor's Mansion, 1234 Center Street, Los Angeles, CA  90210"
    };
    fixedAdminUser = {
        ...fixedAdminUser,
        ...adminData  
    };
    
    users.push(fixedAdminUser);

    return users;
}