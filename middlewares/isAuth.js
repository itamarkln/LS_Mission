const jwtObj = require('jsonwebtoken');

module.exports = (request, response, next) => {
    // check for an authorization field in the incoming request.
    const authHeader = request.get('Authorization');

    // not authenticated.
    if (!authHeader) {
        // adding an "on the fly" field to the request.
        request.isAuth = false;
        return next();
    }

    // extracting the token from the Authorization field in the request.
    const token = authHeader.split(' ')[1]; // token structure => (Bearer TOKEN_VALUE), Bearer: A common convention.

    if (!token || token === '') {
        request.isAuth = false;
        return next();
    }

    let decodedToken;

    try {
        // token exists, needs to be validated.
        decodedToken = jwtObj.verify(token, 'somesupersecretsecret');
    }
    catch (err) {
        request.isAuth = false;
        return next();
    }

    // check if decodedToken is really set.
    if (!decodedToken) {
        request.isAuth = false;
        return next();
    }

    // we have a valid token.
    request.isAuth = true;
    request.userId = decodedToken.userId; // the userId field from the token we created on the login resolver.

    return next();
};