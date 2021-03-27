import * as db from '../database/index.js';
import * as Q from '../queries/index.js';

// turn activity.roleIds into an array of arrays of role objects
async function resolveActivityRoles(activity, jwt) {
    // activity.roleIds is an array of strings, each representing a list of role IDs
    // e.g. ["1,2,3", "4,5,6"]
    if (activity.roleIds) {
        let roles = [];
        for (let roleIdList of activity.roleIds) {
            let roleIdArray = roleIdList.split(',').map(item => parseInt(item.trim()));
            let rolesList = await roleIdsToRoles(roleIdArray);
            roles.push(rolesList);
        }
    }
}
async function roleIdsToRoles(roleIds, jwt) {
    let dbres = await db.query(Q.EVENTS.GET(), { id: parseInt(req.params.id) }, jwt);    
}

// returns whether the activity is specified for the given set of roles
async function matchRoles(activityId, roles) {

}