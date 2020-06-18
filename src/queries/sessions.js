const GET_ALL_SESSIONS = 
`query {
    sessions{
        nodes {
            id
            name
            start
            end
        }
    }
}`;

const GET_SESSION_BY_ID = 
`query ($id:Int!) {
    sessions (condition:{id:$id}) {
        nodes {
            id
            name
            start
            end
        }
    }
}`;

export {
    GET_SESSION_BY_ID,
    GET_ALL_SESSIONS
};