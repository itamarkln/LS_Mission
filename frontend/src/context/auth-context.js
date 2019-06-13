// central storage to bypass the components tree and pass properties between components
// where we want to.
import React from 'react';
export default React.createContext({
    token: null,
    userId: null,
    login: (userId, token, tokenExpiration) => {},
    logout: () => {}
});