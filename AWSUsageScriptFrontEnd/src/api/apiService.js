import { getAuthToken, setAuthToken, clearAuthToken } from "../JWT/jwtService"


let API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

console.log('📍 Final API_BASE_URL:', API_BASE_URL);

const findURL = async () => {
    let check = false;
    try {
        const response = await apiCall('/health');

        if (response.data && response.data.success) {
            check = true;
            return {
                data: response.data,
                error: null,
            }
        } else if (response.error) {
            throw new Error();
        }
    } catch (err) {
        console.log(`Failed to connect to ${API_BASE_URL}, continue to the next URL`);
    }
    if (!check) {
        console.log(`CANNOT find backend URL, check the initiation of backend`);

        return {
            data: null,
            error: "CANNOT find backend URL, check the initiation of backend",
        }
    }
}

const apiCall = async (endpoint, options = {}) => {
    try {
        const token = getAuthToken();

        const headers = {
            // Ensures the request specifies it is sending/expecting JSON data.
            'Content-Type': 'application/json',

            // Allows the caller to add or override headers via the options.headers object.
            ...options.headers,
        };

        // Add token to the headers
        if (token && endpoint !== '/health' && endpoint !== '/configure') {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            ...options,
        })

        if (response.status === 401) {
            clearAuthToken();
            // Trigger re-authentication in your app
            window.dispatchEvent(new CustomEvent('tokenExpired'));
            throw new Error('Authentication expired');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Debug    
        // console.log(data);

        return {
            data,
            error: null,
        }
    } catch (error) {
        console.log(`API call failed for ${endpoint}:`, error);

        return {
            data: null,
            error: error.message
        };
    }
}

const awsResourceApi = {
    // configure AWS credentials
    configureAWS: async (credentials) => {
        // Map the passed credentials with the new specified attributes
        const { access_key, secret_access_key, region } = credentials;

        // Validate the credentials
        if (!access_key || !secret_access_key || !region) {
            return {
                data: null,
                // raise error
                error: 'Missing required credentials: access_key, secret_access_key, and region are all required'
            }
        }

        // Pass the endpoint and mapped credentials to apiCall(), then wait and return its repsonse
        const response = await apiCall('/configure', {
            method: 'POST',
            body: JSON.stringify({
                access_key,
                secret_access_key,
                region
            })
        });

        // Store the JWT Token
        if (response.data && response.data.token.access_token) {
            console.log('----- Configure AWS SUCCESSFULLY, setting the token...')
            setAuthToken(response.data.token.access_token)
        } else if (!response.data) {
            console.warn('---- There is NO desponse from configure AWS!')
        }

        return response;
    },


    // get current region
    getAWSRegion: async () => {
        return await apiCall('/region')
    },

    // get AWS Cost
    getAWSCosts: async () => {
        return await apiCall('/costs')
    },

    // Get EC2 instances
    getRDS: async () => {
        return await apiCall('/rds');
    },

    // Get RDS
    getS3: async () => {
        return await apiCall('/s3');
    },

    // Get Lambda
    getLambda: async () => {
        return await apiCall('/lambda');
    },

    // Get load balancers
    getELB: async () => {
        return await apiCall('/elb');
    },

    // Get EC2
    getEC2: async () => {
        return await apiCall('/ec2');
    },

    // Get EBS
    getEBS: async () => {
        return await apiCall('/ebs');
    },

    // Get Elastic IPs
    getEIP: async () => {
        return await apiCall('/eip');
    }
}
export { findURL };
export default awsResourceApi;