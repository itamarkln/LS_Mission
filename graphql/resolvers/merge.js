// Third-party packages.
// const DataLoader = require('dataloader');

// Models created.
const User = require('../../models/user');
const Appointment = require('../../models/appointment');

// Helpers' functions.
const { dateToString } = require('../../helpers/date'); // object distructoring.

// functions to avoid getting into an infinite loop while requesting appointments and their creator
// over and over again. 
const getUserById = (userId) => {
    return User.findById(userId)
        .then(user => {
            return { 
                _id: user.id,
                ...user._doc,
                bookedAppointments: getAppointmentsByIds.bind(this, user._doc.bookedAppointments),
                password: null
            };
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

// reuseable code to get rid out of the metada that we are getting when mapping array
// of appointments.
const transformAppointment = (appointment) => {
    return { 
        _id: appointment.id,
        ...appointment._doc,
        // date is stored as a date type in mongoDB, but when retrieving it back,
        // we need to convert it again to a readable date string.
        date: dateToString(appointment._doc.date),
        // when accessing this field with a graphql query, we call the func below,
        // and graphql will give us the data returned from this function.
        creator: getUserById.bind(this, appointment._doc.creator)
     };
};

const getAppointmentsByIds = (appointsIds) => {
    return Appointment.find({ _id: { $in: appointsIds } })
        .then(appointments => {
            return appointments.map(appoint => {
                return transformAppointment(appoint);
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getUserById = getUserById;
exports.transformAppointment = transformAppointment;
exports.getAppointmentsByIds = getAppointmentsByIds;