const GET_ALL = 
`query {
    invitations {
        nodes {
            user {
                id
                name
            }
            dateInvited
        }
    }
}`

const ADD = 
`mutation ($input: CreateInvitationInput!) {
    createInvitation(input: $input) {
        clientMutationId
    }
}`;

export {
    ADD,
    GET_ALL
}