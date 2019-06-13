// Models created.
const Appointment = require('../../models/appointment');
const User = require('../../models/user');
const { transformAppointment } = require('./merge'); // object distructuring.


module.exports = {
    appointments: (args, request) => {
        // checking for an authenticated user.
        if (!(request.isAuth)) {
            throw new Error('User is not authenticated.');
        }

        return Appointment.find()
        .then(appointments => {
            // mapping the returned data to get rid of all the metadata that comes with it.
            return appointments.map(appointment => {
                return transformAppointment(appointment);
            });
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    },
    createAppointment: (args, request) => {
        const reqUserId = request.userId;

        // checking for an authenticated user.
        if (!(request.isAuth)) {
            throw new Error('User is not authenticated.');
        }

        // user is now authenticated => we can get his id from the request field userId that we set.
        const appointment = new Appointment({
            date: new Date(args.appointmentInput.date),
            creator: reqUserId // mongoose will convert this string to an object id. 
        });

        let createdAppointment; // the appointment in which we will return at the end of the resolver.

        return appointment
            .save() // saving the appointment.
            .then(result => {
                // saving the appointment's data before losing it.
                createdAppointment = transformAppointment(result);
                return User.findById(reqUserId); // finding the user created it.
            })
            .then(user => { // found user.
                if (!user) {
                    throw new Error('User was not found.');
                }
                user.bookedAppointments.push(appointment._id); // updating the creator user's bookedAppointments.
                return user.save(); // saving in the db the update.
            })
            .then(result => {
                //console.log(result);
                // mapping the returned data to get rid of all the metadata that comes with it.
                return createdAppointment;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    cancelAppointment: async (args, req) => {
        try {
            const requestUserId = req.userId;

            if (!(req.isAuth)) {
                throw new Error('User is not authenticated.');
            }

            // getting the appointment's id to delete.
            const appointmentId = args.appointmentId;
            
            // first, delete the appointment from the user's appointments list.
            const user = await User.findById(requestUserId);
            const updatedBookedAppointments = user.bookedAppointments.filter(
                ap => ap._id.toString() !== appointmentId.toString()
            );
            user.bookedAppointments = [...updatedBookedAppointments];
            await user.save();

            // now, delete the appointment from the appointments collection.
            const appointment = await Appointment.findById(appointmentId);
            await Appointment.deleteOne({ _id: appointment._id });

            const deletedAppointment = transformAppointment(appointment);

            return deletedAppointment;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    editAppointment: async (args, req) => {
        try {
            if (!(req.isAuth)) {
                throw new Error('User is not authenticated.');
            }

            // getting the appointment's id and date to edit.
            const appointmentId = args.appointmentId,
                  appointmentDate = args.date;

            // the appointment in which we will return at the end of the resolver.
            let updatedAppointment;

            // now, update the appointment from the appointments collection.
            // no need to update anything in the users collection because each user,
            // holds only a reference of the appointment (id), nothing else.
            let appointment = await Appointment.findById(appointmentId);
            appointment.date = new Date(appointmentDate); // updating the appointment.

            const result = await appointment.save(); // saving the changes in the DB.

            // transforming the updated appointment in order to get the creator's data too.
            updatedAppointment = transformAppointment(result);

            // returning the newly updated and transformed appointment.
            return updatedAppointment;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
};