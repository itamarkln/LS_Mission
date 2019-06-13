// configuring the environment variables and loading them into this file.
const dotenv = require('dotenv');
dotenv.config();

// Third-party packages.
const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

// Schemas and Resolvers we exported from this file.
const graphqlSchema = require('./graphql/schema/schema');
const graphqlResolver = require('./graphql/resolvers/index');

// Helpers and Middlewares.
const isAuth = require('./middlewares/isAuth');

// Creating the app object.
const app = express();

// Initialized constants.
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
process.env.MONGO_PASSWORD
}@dogs-barber-shop-aeqkz.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

console.log(MONGODB_URI);

// Using the middlewares.
app.use(bodyParser.urlencoded({extended: false})); // parsing text data / plain text data.
app.use(bodyParser.json());

// adding headers to every response that is sent back by the server.
// because our backend server is different from our frontend server, we need to allow
// CORS headers in order that our client could send requests to our server.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // if the request method is 'OPTIONS' that means that we have the default request type that
    // the browser sends to the server to check whether it can send request.
    // We won't handle this request.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    return next();
});

// now for every resolver, we have the isAuth field we added to the request,
// and by that we can grant / denay access to users according to this middleware field (isAuth) we set.
app.use(isAuth);

// The app routes / end-points.
app.use('/graphql', graphqlHttp({ // configuring the graphql api.
    // points to a graphql schema sticked to the graphql specifications.
    schema: graphqlSchema,

    // points to a JS object that has all the Resolvers functions
    rootValue: graphqlResolver,

    // built-in debugging and developing tool which express-graphql gives.
    graphiql: true
}));

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
.then(result => {
    // Listening for incoming requests.
    app.listen(8000, () => console.log('listens on port 8000'));
}).catch(err => {
    console.log(err);
});