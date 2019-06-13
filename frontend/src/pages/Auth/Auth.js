import React, { Component } from "react";

import './Auth.css';

// Our Context Storage.
import AuthContext from '../../context/auth-context';

class AuthPage extends Component {
    state = {
        isLogin: true,
        isError: false,
        errorMsg: null,
        isSuccess: false
    };

    isActiveRequest = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        // using ref api in react.
        this.usernameEl = React.createRef();
        this.passwordEl = React.createRef();
        this.customerNameEl = React.createRef(); // ref for the input of customer name in the signup form.
    }

    switchModeHandler = () => {
        this.setState(prevState => {
            return { isLogin: !prevState.isLogin, isError: false, isSuccess: false };
        });
    };

    // submit function.
    submitHandler = (event) => {
        event.preventDefault(); // preventing from the browser to send the request.

        // get form's input values.
        const username = this.usernameEl.current.value;
        const password = this.passwordEl.current.value;
        let customerName;

        // handling the request body according to the sign up / log in forms.
        let requestBody = {};

        if (!this.state.isLogin) { 
            customerName = this.customerNameEl.current.value;
        }

        // if input isn't valid, both for log in and sign up forms.
        if (this.state.isLogin) {
            if (username.trim().length === 0 ||
                password.trim().length === 0
            ) {
                this.setState({ 
                    isError: true,
                    errorMsg: 'Some of your credentials were incorrect. Please try again.'
                });
                return;
            }
        } else {
            if (username.trim().length === 0 ||
                password.trim().length === 0 ||
                customerName.trim().length === 0
            ) {
                this.setState({
                    isError: true,
                    errorMsg: 'Some of your credentials were incorrect. Please try again.'
                });
                return;
            }
        }

        // assigning the request body's value according to sign up & log in forms.
        if (this.state.isLogin) {
            requestBody = {
                query: `
                    query {
                        login(username: "${username}", password: "${password}"){
                            userId
                            token
                            tokenExpiration
                        }
                    }
                `
            };
        } else {
            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {customerName: "${customerName}", username: "${username}", password: "${password}"}){
                            _id
                            customerName
                        }
                    }
                `
            };
        }
       
        // sending the request to the backend.
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            if (responseData.errors) {
                this.setState({
                    isError: true,
                    errorMsg: responseData.errors[0].message
                });
                throw new Error(responseData.errors[0].message);
            }
            else {
                if (this.state.isLogin) {
                    if (responseData.data.login.token) {
                        this.context.login(
                            responseData.data.login.userId,
                            responseData.data.login.token,
                            responseData.data.login.tokenExpiration
                        );
                    }
                }
                if (this.isActiveRequest) {
                    this.setState({ isSuccess: true, isError: false });
                }
            }
        })
        .catch(err => {
            this.setState(prevState => {
                return { isError: true, errorMsg: prevState.errorMsg };
            });
            console.log(err);
        });
    };

    componentWillUnmount() {
        this.isActiveRequest = false;
    }

    render() {
        let cstmrName,
            isSignup = (!this.state.isLogin) ? true : false;
        if (isSignup) {
            cstmrName = (<div className="form-control">
                            <input type="text"
                                   id="customername"
                                   placeholder="Customer Name"
                                   ref={ this.customerNameEl }
                            /> 
                        </div>);
        }
        return ( 
            <form className="auth-form"
                  onSubmit={ this.submitHandler }
            >
                <h1>{ (isSignup) ? 'Sign Up Now' : 'Get Logged In' }</h1>
                { (isSignup) ? cstmrName : '' }
                <div className="form-control" >
                    <input type="text"
                           id="username"
                           placeholder="Username"
                           ref={ this.usernameEl }
                    /> 
                </div> 
                <div className="form-control" >
                    <input type="password"
                           id="password"
                           placeholder="Password"
                           ref={ this.passwordEl }
                    /> 
                </div>
                {
                    this.state.isError && (
                        <div className="form-error__message">
                            <p>{ this.state.errorMsg }</p>
                        </div>
                    )
                }
                {
                    (this.state.isSuccess && !this.state.isLogin) && (
                        <div className="form-success__message">
                            <p>You have successfully signed up. Start your journey by logging in.</p>
                        </div>
                    )
                }
                <div className="form-actions">
                    <button type="submit">
                        Submit
                    </button>
                    <button className="switch-form-state-btn" type="button" onClick={this.switchModeHandler}>
                        { this.state.isLogin ? 'Signup' : 'Login' }
                    </button>
                </div>
            </form>
        );
    }
}

export default AuthPage;