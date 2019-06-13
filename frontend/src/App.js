// React libraries.
import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

// Css files.
import './App.css';

// Our Context Storage.
import AuthContext from './context/auth-context';

// Exported components.
import AuthPage from './pages/Auth/Auth';
import AppointmentsPage from './pages/Appointments/Appointments';
import MainNav from './components/Navigation/MainNav';

class App extends Component {
  state = {
        userId: null,
        token: null
  };

  login = (userId, token, tokenExpiration) => {
      this.setState({
          userId: userId,
          token: token
      });
  };

  logout = () => {
      this.setState({
          userId: null,
          token: null
      });
  };

  render() {
    return (
            <BrowserRouter>
                <React.Fragment>
                    <AuthContext.Provider 
                        value={ {
                            userId: this.state.userId,
                            token: this.state.token,
                            login: this.login,
                            logout: this.logout
                        } }
                    >
                        <MainNav />
                        <main className="main-content">
                            <Switch>
                                { this.state.token && <Redirect from="/" to="/appointments" exact /> }
                                { this.state.token && <Redirect from="/auth" to="/appointments" exact /> }
                                { 
                                    !this.state.token && (
                                        <Route path="/auth" component={AuthPage} />
                                    )
                                }
                                { 
                                    this.state.token && (
                                        <Route path="/appointments" component={AppointmentsPage} />
                                    )
                                }
                                { !this.state.token && <Redirect to="/auth" exact /> }
                            </Switch>
                        </main>
                    </AuthContext.Provider>
                </React.Fragment>
            </BrowserRouter>
       );
  }
}

export default App;
