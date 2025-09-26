let authToken = null;

// Token Management
const setAuthToken = (token) => {
    authToken = token;
    localStorage.setItem('aws_auth_token', token)
}

const getAuthToken = () => {
    if(!authToken){
        authToken = localStorage.getItem('aws_auth_token');
    }
    return authToken;
}

const clearAuthToken = () => {
    authToken = null;
    localStorage.removeItem('aws_auth_token');
}

export {
    getAuthToken,
    setAuthToken,
    clearAuthToken
}

