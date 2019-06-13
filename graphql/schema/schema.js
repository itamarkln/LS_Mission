const { buildSchema } = require('graphql'); // importing a property func from graphql library.

// exporting all schemas we built.
// query key commands: to fetch data, mutation key commands: to change data, type: to define models.
module.exports = buildSchema(`
    type User {
        _id: ID!
        customerName: String!
        username: String!
        password: String
        bookedAppointments: [Appointment!]
    }
    type Appointment {
        _id: ID!
        date: String!
        creator: User!
    }
    type AuthData {
        userId: ID!
        token: String!
        tokenExpiration: Int!
    }

    input UserInput {
        customerName: String!
        username: String!
        password: String!
    }
    input AppointmentInput {
        date: String!
    }

    type RootQuery {
        appointments: [Appointment!]!
        login(username: String!, password: String!): AuthData!
    }
    type RootMutation {
        createUser(userInput: UserInput): User
        createAppointment(appointmentInput: AppointmentInput): Appointment
        editAppointment(appointmentId: ID!, date: String!): Appointment!
        cancelAppointment(appointmentId: ID!): Appointment!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);