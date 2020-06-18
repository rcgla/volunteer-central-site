import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envpath = path.join(__dirname, '../.env');
dotenv.config({path: envpath});

import jwt from 'jsonwebtoken';
import * as db from './database.js';
import * as Q from './queries/index.js';

function parseToken (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.expires > Date.now().valueOf() / 1000) {
            return {
                accessLevel: decoded.role === 'rcglavc_user_role' ? 'user' 
                : 
                decoded.role === 'rcglavc_admin_role' ? 'admin' : 'public',
                userId: decoded.user_id,
                expires: decoded.expires
            }
        }
        else {
            return null;
        }
    }
    catch(err) {
        console.log("Error decoding token", err);
        return null;
    }
}

// this should prob be a postgres function
// just doing it in js for now... 
// TODO: filter for whether a user has dropped or not
async function getUsersBySessionAndRoleGroup(sessionId, roleGroupName, jwt) {
    let dbres = await db.query(Q.USERS.GET_ALL, {}, jwt);
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
        u.participationsByUserId.nodes
        .map(n => n.session.id === sessionId));
    
    let usersInGroup = usersForSession.filter( u => {
        let usersRoles = u.participationsByUserId.nodes.map(n => n.role.code);
        let applicableRoles = usersRoles.filter(r => roles.includes(r));
        return applicableRoles.length > 0;
    });
    
    return {success: true, errors: [], users: usersInGroup};
}

export {
    parseToken,
    getUsersBySessionAndRoleGroup
};
