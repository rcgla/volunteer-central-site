import * as Q from "../../src/queries/index.js";
import * as db from "../../src/database/index.js";
import winston from "winston";

async function addUsers(data, jwt, errmgr) {
    winston.info("Adding Users");
    
    for (var user of data) {
        try {
            await addUser(user, jwt);
        }
        catch(err) {
            errmgr.addError(err);
        }
    }
}

async function addUser(user, jwt) {
    let dbres = await db.query(
        Q.LOGINS.CREATE_NEW_LOGIN(),
        {
            username: user.username,
            password: user.password,
            active: true
        }, 
        jwt
    );
    if (!dbres.success) {
        let err = new Error("addUsers error");
        err.errors = dbres.errors;
        throw err;
    }
    let loginId = dbres.data.createNewLogin.integer;
    dbres = await db.query(
        Q.TSHIRT_SIZES.GET_BY_SIZE(user.tShirtSize),
        {},
        jwt
    );
    if (!dbres.success) {
        let err = new Error("addUsers error - tshirt size");
        err.errors = dbres.errors;
        throw err;
    }
    let tShirtSizeId = null;
    if (dbres.data.tShirtSizes.length > 0) {
        tShirtSizeId = dbres.data.tShirtSizes[0].id;
    }

    dbres = await db.query(
        Q.USERS_PRIVATE_INFO.CREATE(),
        {
            input: {
                phone: user.phone,
                bio: user.bio,
                address: user.address,
                email: user.email
            }
        }, 
        jwt
    );
    if (!dbres.success) {
        let err = new Error("addUsers error");
        err.errors = dbres.errors;
        throw err;
    }
    let usersPrivateInfoId = dbres.data.createUsersPrivateInfo.usersPrivateInfo.id;

    dbres = await db.query(
        Q.USERS_PROTECTED_INFO.CREATE(),
        {
            input: {
                tShirtSizeId
                // food allergies
                // medical
                // meal pref
            }
        },
        jwt
    );
    if (!dbres.success) {
        let err = new Error("addUsers error");
        err.errors = dbres.errors;
        throw err;
    }
    let usersProtectedInfoId = dbres.data.createUsersProtectedInfo.usersProtectedInfo.id;
    dbres = await db.query(
        Q.USERS.CREATE(), 
        {
            input: {
                name: user.name,
                userType: user.userType,
                loginId,
                usersPrivateInfoId,
                usersProtectedInfoId
            }
        },
        jwt
    );
    if (!dbres.success) {
        let err = new Error("addUsers error");
        err.errors = dbres.errors;
        throw err;
    }
    let userId = dbres.data.createUser.user.id;
    if (user.emergencyContacts) {
        for (var emergencyContact of user.emergencyContacts) {
            await addEmergencyContact(emergencyContact, jwt, userId);
        }
    }
}

async function addEmergencyContact(emergencyContact, jwt, userId) {
    let dbres = await db.query(
        Q.EMERGENCY_CONTACTS.CREATE(), 
        {
            input: {
                name: emergencyContact.name,
                phone: emergencyContact.phone,
                relation: emergencyContact.relation,
                userId
            }
        },
        jwt
    );
    if (!dbres.success) {
        let err = new Error("emergency contact error");
        err.errors = dbres.errors;
        throw err;
    }
}

export { addUsers };
