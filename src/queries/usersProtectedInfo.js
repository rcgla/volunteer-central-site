import generate from './crudGenerator.js';
import * as tShirtSizes from './tShirtSizes.js';

const FIELDS = () => `
id
foodAllergies
medical
tShirtSize {
    ${tShirtSizes.FIELDS()}   
}
mealPref
`;

export { FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("usersProtectedInfo", "usersProtectedInfos", FIELDS);
