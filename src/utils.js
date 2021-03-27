import jwt from 'jsonwebtoken';
import * as db from './database/index.js';
import * as Q from './queries/index.js';
import winston from 'winston';

function parseToken (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.expires > Date.now().valueOf() / 1000) {
            let accessLevel = 'public';
            if (decoded.role == 'rcglavc_admin_role') {
                accessLevel = 'admin';
            }
            else if (decoded.role == 'rcglavc_staff_role') {
                accessLevel = 'staff';
            }
            else if (decoded.role == 'rcglavc_client_role') {
                accessLevel = 'client';
            }
            return {
                accessLevel,
                userId: decoded.user_id,
                expires: decoded.expires
            }
        }
        else {
            return null;
        }
    }
    catch(err) {
        winston.error("Error decoding token", err);
        return null;
    }
}

// this should prob be a postgres function
// just doing it in js for now... 
// TODO: filter for whether a user has dropped or not
async function getUsersBySessionAndRoleGroup(sessionId, roleGroupName, jwt) {
    let dbres = await db.query(Q.USERS.GET_ALL(), {}, jwt);
    if (!dbres.success) {
        let err = new Error("Could not get users");
        return {success: false, errors: [err], users: []};
    }
    let users = dbres.data.users.nodes;

    dbres = await db.query(Q.ROLES.GET_ROLES_FOR_ROLEGROUP, {code: roleGroupName}, jwt);
    if (!dbres.success) {
        let err = new Error(`Could not get roles for rolegroup ${roleGroupName}`);
        return {success: false, errors: [err], users: []};
    }
    let roles = dbres.data.roleGroups.nodes[0].rolesInRoleGroupsByRoleGroupId.nodes.map(n => n.role.code);
    
    let usersForSession = users.filter(u => 
        u.placements.nodes
        .map(n => n.session.id === sessionId));
    
    let usersInGroup = usersForSession.filter( u => {
        let usersRoles = u.placementsByUserId.nodes.map(n => n.role.code);
        let applicableRoles = usersRoles.filter(r => roles.includes(r));
        return applicableRoles.length > 0;
    });
    
    return {success: true, errors: [], users: usersInGroup};
}

// format message from an error object (which could have many different forms)
function formatErrorMessage(error) {

    // it's probably a validator message from the form validator
    if (error.hasOwnProperty('msg') && error.hasOwnProperty("value")) {
        return `${error.msg} "${error.value}" for parameter "${error.param}"`;
    }
    // it's probably a database error
    // TODO check this more thoroughly
    else {
        return error.message;
    }
}
// make these fields a little easier to use
function simplifyUserObject(user) {
    let user_;
    if (user.usersProtectedInfo) {
        user_ = {...user, ...user.usersProtectedInfo};
        delete user_.usersProtectedInfo;
    }
    if (user.usersPrivateInfo) {
        user_ = {...user_, ...user.usersPrivateInfo};
        delete user_.usersPrivateInfo;
    }
    return user_;
}
export {
    parseToken,
    getUsersBySessionAndRoleGroup,
    formatErrorMessage,
    simplifyUserObject
};
