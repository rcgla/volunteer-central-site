import generate from './crudGenerator.js';

const FIELDS = () => `
id
name
order
`;

export { FIELDS };

const GET_BY_SIZE = size => `
query {
    tShirtSizes(condition: {name: "${size}"}) {
        ${FIELDS()}
    }
}`;

const GET_ALL = () => `
query {
    tShirtSizes(orderBy:ORDER_ASC) {
        ${FIELDS()}
    }
}`;

const {CREATE, DELETE, UPDATE, GET} 
    = generate("tShirtSize", "tShirtSizes", FIELDS);

export {CREATE, DELETE, UPDATE, GET, GET_ALL, GET_BY_SIZE};
