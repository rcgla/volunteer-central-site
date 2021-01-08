import generate from './crudGenerator.js';

const FIELDS = () => `
id
username
lastSeen
active
`;

export { FIELDS };

export const {DELETE, UPDATE, GET, GET_ALL} 
    = generate("login", "logins", FIELDS);

// custom CREATE instead of using crudGenerator's
// this uses our custom pgsql function, which hashes the password
export const CREATE_NEW_LOGIN = () => `
mutation ($username: String!, $password: String!, $active: Boolean = true){
    createNewLogin(input:{
      username: $username
      pwd: $password
      active: $active
    }) {
      clientMutationId
      integer
    }
  }
`;
