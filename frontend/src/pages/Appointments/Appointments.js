import React, { Component } from 'react';

// CSS files.
import './Appointments.css';

// Created Components.
import Modal from '../../components/Modal/Modal';
import Backdrop from '../../components/Backdrop/Backdrop';
import AppointmentList from '../../components/AppointmentList/AppointmentList';
import Spinner from '../../components/Spinner/Spinner';

// Our Context Storage.
import AuthContext from '../../context/auth-context';

class AppointmentsPage extends Component {
    state = {
        creating: false, // the open/closed modal.
        appointments: [], // the booked appointments.
        isLoading: false, // the spinner effect.
        selectedAppointment: null,
        deleting: false,
        isError: false
    };
    // this will handle the error given when we will try to get another request while waiting for
    // the current response.
    isRequestActive = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.dateElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchAppointmentList();
    }

    fetchAppointmentList = () => {
        // waiting for the appointments to be fetched.
        this.setState({ isLoading: true });

        // getting the value of the token from the user who is logged in.
        const token = this.context.token;

        // the request body for fetching the appointments.
        const reqBody = {
            query: `
                query {
                    appointments{
                        _id
                        date
                        creator{
                            _id
                            customerName
                        }
                    }
                }
            `   
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(reqBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }    
        })
        .then(resp => {
            if (resp.status !== 200 && resp.status !== 201) {
                throw new Error('Loading all appointments has failed..');
            }
            return resp.json();
        })
        .then(respData => {
            // console.log(respData);
            const appointmentListReturned = respData.data.appointments;

            if (this.isRequestActive) {
                this.setState({ appointments: appointmentListReturned, isLoading: false });
            }
        })
        .catch(err => {
            console.log(err);

            if (this.isRequestActive) {
                this.setState({ appointments: [], isLoading: false });
            }
        });
    };

    selectAppointmentHandler = (appointmentId) => {
        this.setState(prevState => {
            const selectedAppointment = prevState.appointments.find(ap => ap._id === appointmentId);
            return { selectedAppointment }; // if key and value are the same, possible to write one only.
        });
    };

    deleteAppointmentHandler = (appointmentId) => {
        // changing the states accordingly.
        this.selectAppointmentHandler(appointmentId);
        this.setState({ deleting: true });

        // retrieving the currently logged in user's token.
        const token = this.context.token;

        const requestBody = {
            query: `
                mutation {
                    cancelAppointment(appointmentId: "${appointmentId}") {
                        _id
                        date
                    }
                }
            `
        };

        // send request to the backend.
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('A deletion of an appointment failed.');
            }
            return res.json(); // function got by the fetch api, which will parse the response body.
        })
        .then(resData => {
            // console.log(resData);
            // after deleting an appointment from the DB, we will re-render the DOM with the new
            // appointment without requesting again the updated appointments from the server's DB.
            this.setState(prevState => {
                let updatedAppointments = [...prevState.appointments];
                updatedAppointments = updatedAppointments.filter(
                    ap => ap._id.toString() !== appointmentId.toString()
                );
                return { appointments: updatedAppointments, selectedAppointment: null, deleting: false };
            });
        })
        .catch(err => {
            this.setState({ selectedAppointment: null, deleting: false });
            console.log(err);
        });
    };

    modalConfirmHandler = (editing) => {
        // getting the date input's value.
        const dateInput = this.dateElRef.current.value;

        // getting the value of the token from the user who is logged in.
        const token = this.context.token;
        
        if (dateInput.trim().length === 0) {
            this.setState({ isError: true });
            return;
        }

        // if not editing, means we are creating an appointment.
        if (!editing) {
            this.setState({ creating: false });
        }

        // the request body for creating / editing an appointment.
        let requestBody = {
            query: `
                mutation {
                    createAppointment(appointmentInput: { date: "${dateInput}" }){
                        _id
                        date
                        creator {
                            _id
                            customerName
                        }
                    }
                }
            `
        };

        if (editing) {
            requestBody = {
                query: `
                    mutation {
                        editAppointment(appointmentId: "${this.state.selectedAppointment._id}", date: "${dateInput}"){
                            _id
                            date
                        }
                    }
                `
            };
        }

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody), // requestBody will be for login / signup depends on isLogin state.
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error(
                    editing ? 'An update of an appointment failed.'
                              : 'A creation of an appointment failed.'
                );
            }
            return res.json(); // function got by the fetch api, which will parse the response body.
        })
        .then(resData => {
            // console.log(resData);
            // after adding an appointment to the DB, we will re-render the DOM with the new appointment
            // without requesting again the updated appointments from the server's DB, same goes for
            // updating an appointment.

            // if creating an appointment.
            if (!editing) {
                this.setState(prevState => {
                    const updatedAppointments = [...prevState.appointments];
                    updatedAppointments.push({
                        _id: resData.data.createAppointment._id,
                        date: resData.data.createAppointment.date,
                        creator: {
                            _id: this.context.userId,
                            customerName: resData.data.createAppointment.creator.customerName
                        }
                    });
                    return { appointments: updatedAppointments, isError: false };
                });
            } 
            // if updating an appointment.
            else {
                this.setState(prevState => {
                    const updatedAppointments = [...prevState.appointments].map(appoint => {
                        if (appoint._id === this.state.selectedAppointment._id) {
                            appoint.date = resData.data.editAppointment.date;
                        }
                        return appoint;
                    });
                    return { appointments: updatedAppointments, selectedAppointment: null };
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    };

    createAppointmentHandler = () => {
        this.setState({ creating: true });
    };

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedAppointment: null, isError: false });
    };

    componentWillUnmount() {
        this.isRequestActive = false;
    }

    render() {
        return (
            <React.Fragment>
                { 
                    this.state.creating &&
                    (
                        <React.Fragment>
                            <Backdrop />
                            <Modal title="Make An Appointment"
                                   canConfirm
                                   canCancel
                                   onCancel={ this.modalCancelHandler }
                                   onConfirm={ this.modalConfirmHandler.bind(this, false) }
                                   confirmText="Confirm"
                            >
                                    <form>
                                        <div className="form-control">
                                        <input type="datetime-local"
                                               id="appoint-date"
                                               placeholder="Appointment Date"
                                               ref={ this.dateElRef }
                                        /> 
                                        </div>
                                        <div>
                                            { 
                                                this.state.isError && (
                                                    <div className="form-error__message">
                                                        <p>Please enter a valid date.</p>
                                                    </div>
                                                )
                                             }
                                        </div>
                                    </form>
                            </Modal>
                        </React.Fragment>
                    )
                }
                {
                    (this.state.selectedAppointment && !this.state.deleting) &&
                    (
                        <React.Fragment>
                            <Backdrop />
                            <Modal title="Edit An Appointment"
                                   canConfirm
                                   canCancel
                                   onCancel={ this.modalCancelHandler }
                                   onConfirm={ this.modalConfirmHandler.bind(this, true) }
                                   confirmText="Update"
                            >
                                    <form>
                                        <div className="form-control">
                                        <input type="datetime-local"
                                               id="appoint-date"
                                               defaultValue={ this.state.selectedAppointment.date }
                                               ref={ this.dateElRef }
                                        /> 
                                        </div>
                                        <div>
                                            { 
                                                this.state.isError && (
                                                    <div className="form-error__message">
                                                        <p>Please enter a valid date.</p>
                                                    </div>
                                                )
                                             }
                                        </div>
                                    </form>
                            </Modal>
                        </React.Fragment>
                    )
                }
                {
                    this.context.token &&
                    (
                        <div className="appoints-control">
                            <p>Book your own appointments now!</p>
                            <button className="btn" onClick={ this.createAppointmentHandler }>
                                Create Appointment
                            </button>
                        </div>
                    )
                }
                { 
                    this.state.isLoading ? <Spinner /> : ( 
                        <AppointmentList
                            appointments={ this.state.appointments }
                            authUserId={ this.context.userId }
                            onSelectAppointment={ this.selectAppointmentHandler }
                            onDeleteAppointment={ this.deleteAppointmentHandler }
                        />
                    )
                }
            </React.Fragment>
        );
    }
}

export default AppointmentsPage;