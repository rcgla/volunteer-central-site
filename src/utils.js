var jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./database');
const Q = require('./queries/queries');
const QADMIN = require('./queries/admin');

require('dotenv').config({path: path.join(__dirname, '../.env')});

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
async function getUsersBySessionAndRoleGroup(sessionId, roleGroupName, jwt) {
    let result = await db.query(QADMIN.USERS, {}, jwt);
    let session = await db.query(Q.SESSION, {id: sessionId}, jwt);
    let roles = await db.query(Q.ROLEGROUP_ROLES, {name: roleGroupName}, jwt);
    roles = roles.data.data.roleGroups.nodes[0].rolesInRoleGroupsByRoleGroupId.nodes.map(n => n.role.name);
    
    let users = result.data.data.users.nodes;
    
    usersForSession = users.filter(u => 
        u.participationsByUserId.nodes
        .map(n => n.session.id === sessionId));
    
    let usersInGroup = usersForSession.filter( u => {
        let usersRoles = u.participationsByUserId.nodes.map(n => n.role.name);
        let applicableRoles = usersRoles.filter(r => roles.includes(r));
        return applicableRoles.length > 0;
    });
    
    return usersInGroup;
}

module.exports = {
    parseToken,
    getUsersBySessionAndRoleGroup
}
