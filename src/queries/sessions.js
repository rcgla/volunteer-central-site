const GET_ALL = 
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

const GET_BY_ID = 
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
    GET_BY_ID,
    GET_ALL
};