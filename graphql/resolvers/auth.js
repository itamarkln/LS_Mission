// Models' components
const User = require('../../models/user');
const bcrypt = require('bcryptjs'); // hash encryption of users' passwords.
const jwt = require('jsonwebtoken'); // helps us generate JWT token which will be sent to the client. 

module.exports = {
    createUser: (args, req) => {
        return User.findOne({ customerName: args.userInput.customerName })
        .then(userDoc => {
            if (userDoc) {
                const error = new Error('The user\'s customer name is already exist.');
                error.status = 500;
                throw error;
            }

            return User.findOne({ username: args.userInput.username });
        })
        .then(user => {
            if (user) {
                const error = new Error('The user\'s account name is already exist.');
                error.status = 500;
                throw error;
            }

            // second argument is sault: defines the security of the generated hash by rounds of saulting.
            return bcrypt.hash(args.userInput.password, 12);
        })
        .then(hashedUserPass => {
            const user = new User({
                customerName: args.userInput.customerName,
                username: args.userInput.username,
                password: hashedUserPass
            });
            return user.save();
        })
        .then(result => {
            console.log(result._doc.username + ' was created.');

            // _id is not converted to a string by default, needs to do it manually.
            // result.id => virtual getter of mongoose.
            // setting password=null is to handle security issues,
            // doing so after saving the original value of the password

            // mapping the returned data to get rid of all the metadata that comes with it.
            return { ...result._doc, password: null, _id: result.id };
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    },
    login: (args, req) => {
        // getting input values.
        const username = args.username;
        const password = args.password;
        
        let loggedUser;

        return User.findOne({ username: username })
        .then(user => {
            if (!user) {
                const error = new Error('Username is incorrect.');
                error.status = 500;
                throw error;
            }

            loggedUser = user;

            return bcrypt.compare(password, loggedUser.password);
        })
        .then(doMatch => {
            if (!doMatch) {
                const error = new Error('Password is incorrect.');
                error.status = 500;
                throw error;
            }

            const token = jwt.sign(
                { userId: loggedUser, username: loggedUser.username },
                'somesupersecretsecret',
                { expiresIn: '1h' }
            );

            return { userId: loggedUser._id.toString(), token: token, tokenExpiration: 1 };
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }
};