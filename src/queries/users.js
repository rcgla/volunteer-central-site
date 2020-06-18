const GET_BY_ID = 
`query($id: Int!) {
    user (id: $id) {
        name
        phone
        address
        bio
    }
}`;

const GET_ALL = 
`query {
    users {
        nodes {
            name
            login {
                email
            }
            bio
            phone
            address
            photoUrl
            participationsByUserId {
                nodes {
                    role {
                        name
                        code
                    }
                    session {
                        name
                        id
                    }
                }
            }
        }
    }
}`;

const UPDATE =
`mutation ($id: Int!, $data: UserPatch!) {
    updateUser(input: {
        id: $id,
        patch: $data
    }) {
        clientMutationId
    }
}`;

const GET_EMAIL = 
`query($id: Int!) {
    user (id: $id) {
        login{
            email
        }
    }
}`;
export { 
    GET_ALL,
    GET_BY_ID,
    UPDATE,
    GET_EMAIL
};