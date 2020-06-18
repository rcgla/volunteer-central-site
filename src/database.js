import axios from 'axios';

async function query(queryString, variables, jwt=null) {
    let request = makeRequest(queryString, variables, jwt);
    // return a promise
    let retval = await axios(request);
    return retval;
}
 
// create request object
function makeRequest(queryString, variables, jwt=null) {
    let request = {
        url: process.env.GRAPHQLURL,
        method: 'post',
        data: {
            query: queryString,
            variables: variables
        }
    };
    if (jwt) {
        request.headers = {'Authorization': `bearer ${jwt}`};            
    }
    return request;
}

export {
    query
}