import * as Users from "./users.js";
import generate from './crudGenerator.js';

const FIELDS = () => `
id
user {
    ${Users.FIELDS()}
}
dateInvited
`;

export { FIELDS };
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("invitation", "invitations", FIELDS);


