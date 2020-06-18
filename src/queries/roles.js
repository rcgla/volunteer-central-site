const GET_ROLES_FOR_ROLEGROUP = 
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
}`;

export { GET_ROLES_FOR_ROLEGROUP };
