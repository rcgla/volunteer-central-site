import generate from './crudGenerator.js';

// TODO finish fields list
// test inclusion of UserProtected fields
export const fragments = {
    FIELDS:`
    name
    `,
};

export const GET_EMAIL = 
`query($id: Int!) {
    user (id: $id) {
        login{
            email
        }
    }
}`;

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("user", "users", fragments.FIELDS);
