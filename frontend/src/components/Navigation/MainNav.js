import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'; // prevent from reloading the page when clicking on a link, (SPA).

// CSS files.
import './MainNav.css';

// Our Context Storage.
import AuthContext from '../../context/auth-context';

// font-awesome from react library.
import { FaBars } from 'react-icons/fa';

// functional component
class MainNav extends Component {
    state = {
        itemsRevealed: false
    };

    // arrow functions ensures that the keyword "this" will always refer to this component globally.
    changeItemsViewHandler = () => {
        this.setState(prevState => {
            return { 
                itemsRevealed: !prevState.itemsRevealed
            };
        });
    };

    render() {
        let itemsClass = 'main-nav__items blank';

        if (this.state.itemsRevealed) {
            itemsClass = 'main-nav__items';
        }

        return (
            <AuthContext.Consumer>
                { (context) => {
                    return (
                        <header className="main-nav">
                            <div className="wrapper">
                                <div className="main-nav__logo">
                                    <h1> PetCare </h1>
                                </div>
                                <div className="main-nav__toggle-btn"
                                     onClick={this.changeItemsViewHandler}>
                                        <FaBars />
                                </div>
                            </div>
                            <nav className={itemsClass}>
                                <ul>
                                    { 
                                        context.token && (
                                            <React.Fragment>
                                                <li>
                                                    <NavLink to="/appointments">
                                                        Appointments
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <button onClick={context.logout}>
                                                        Logout
                                                    </button>
                                                </li>
                                            </React.Fragment>
                                        )
                                    }
                                    { 
                                        !context.token &&
                                        <li>
                                            <NavLink to="/auth">
                                                Authenticate
                                            </NavLink>
                                        </li>
                                    }
                                </ul>
                            </nav>
                        </header>
                    );
                } }
            </AuthContext.Consumer>
        );
    }
}

export default MainNav;