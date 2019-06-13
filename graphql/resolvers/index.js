const authResolver = require('./auth');
const appointmentsResolver = require('./appointments');

const rootResolver = {
    // spreading all the fields from each resolver piece.
    ...authResolver,
    ...appointmentsResolver
};

module.exports = rootResolver;