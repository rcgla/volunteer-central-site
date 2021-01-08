import winston from 'winston';
let errors = [];

let addError = err => {
    winston.error(err.message);
    errors.push(err);
}

let addErrors = errs => {
    for (var err of errs) {
        addError(err);
    }
}

let getErrors = () => {
    return errors;
};

export { addError, addErrors, getErrors };