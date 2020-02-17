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
    `query ($code:String!) {
        roleGroups (condition:{code:$code}) {
          nodes {
            rolesInRoleGroupsByRoleGroupId {
              nodes {
                role {
                  name
                  code
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
