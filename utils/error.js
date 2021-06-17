const UNAUTHORIZED = () => {
    const error = new Error("Unauthorized");
    error.status = 401;
    return error;
};
const INTERNAL_SERVER = (err) => {
    if(err) console.log(err);
    const error = new Error("Internal Server Error");
    error.status = 500;
    return error;
};
const UNPROCESSABLE_ENTITY = (err) => {
    if(err) console.log(err.details);
    const error = new Error("Unprocessable Entity");
    error.status = 422;
    return error;
};
const BAD_REQUEST = (err) => {
    if(err) console.log(err.details);
    const error = new Error("Bad Request");
    error.status = 400;
    return error;
};
const DUPLICATE = (key) => {
    const error = new Error(`${key} already exists.`);
    error.status = 409;
    return error;
};

module.exports = {UNAUTHORIZED,INTERNAL_SERVER,DUPLICATE,BAD_REQUEST,UNPROCESSABLE_ENTITY};