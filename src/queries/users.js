const GET_USER_PROFILE = 
`query($id: Int!) {
    user (id: $id) {
        name
        phone
        address
        bio
    }
}`;

const GET_ALL_USERS = 
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
                    }
                }
            }
        }
    }
}`;

export { 
    GET_ALL_USERS,
    GET_USER_PROFILE
};