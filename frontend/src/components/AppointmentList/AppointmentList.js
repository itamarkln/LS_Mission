import React from 'react';

import AppointmentItem from './AppointmentItem/AppointmentItem';
import './AppointmentList.css';

const appointmentList = props => {
    const appointmentList = props.appointments.map(appointment => {
        return ( 
           <AppointmentItem 
                appointmentDate={ appointment.date }
                appointmentCustomerName={ appointment.creator.customerName }
                key={ appointment._id }
                appointmentId={ appointment._id }
                userId={ props.authUserId }
                creatorId={ appointment.creator._id }
                onSelectedAppointment={ props.onSelectAppointment }
                onDeletedAppointment={ props.onDeleteAppointment }
            />
        );
    });

    return (
        <ul className="appoint__list">{ appointmentList }</ul>
    );
};

export default appointmentList;