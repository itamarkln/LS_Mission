import React from 'react';

import './AppointmentItem.css';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa'; // fontawesome from react library.

const appointmentItem = props => {
    return (
        <li className="appoint__list-item" key={ props.appointId }>
            <div>
                <h1>{ new Date(props.appointmentDate).toLocaleString() }</h1>
                <h2>{ "Appointment created by " + props.appointmentCustomerName }</h2>
            </div>
            {
                (props.creatorId === props.userId) ? (
                    <div>
                        <button onClick={ props.onSelectedAppointment.bind(this, props.appointmentId) }>
                            <FaEdit />
                        </button>
                        <button onClick={ props.onDeletedAppointment.bind(this, props.appointmentId) }>
                            <FaRegTrashAlt />
                        </button>
                    </div>
                ) : null
            }
        </li>
    );
};

export default appointmentItem;