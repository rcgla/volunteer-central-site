module.exports = {

    USER_PROFILE: 
    `query($id: Int!) {
        user (id: $id) {
            name
            phone
            address
            bio
        }
    }`,

    ROLEGROUP_ROLES: 
    `query ($name:String!) {
        roleGroups (condition:{name:$name}) {
          nodes {
            rolesInRoleGroupsByRoleGroupId {
              nodes {
                role {
                  name
                }
              }
            }
          }
        }
      }`,

      SESSIONS: 
      `query {
        sessions{
          nodes {
            id
            name
            start
            end
          }
        }
      }`,

      SESSION: 
      `query ($id:Int!) {
        sessions (condition:{id:$id}) {
          nodes {
            id
            name
            start
            end
          }
        }
      }`
};
