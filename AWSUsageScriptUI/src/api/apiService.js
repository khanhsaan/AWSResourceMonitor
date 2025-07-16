import { useEffect } from "react";

let API_BASE_URL = "";

const possibleURLs = [
    "http://localhost:8000/api",
    "http://0.0.0.0:8000/api",
]

const findURL = async () => {
    let check = false;

    for(const url of possibleURLs){
        try {
            const response = await apiCall(url, '/health');

            if(response.data && response.data.success){
                console.log(`FOUND right URL: ${url}`);
                API_BASE_URL = url;
                check = true;

                return {
                    data: response.data,
                    error: null,
                }
            } else if (response.error) {
                throw new Error();
            }
        } catch (err) {
            console.log(`Failed to connect to ${url}, continue to the next URL`);
        }
    }
    if(!check) {
        console.log(`CANNOT find backend URL, check the initiation of backend`);

        return {
            data: null,
            error: "CANNOT find backend URL, check the initiation of backend",
        }
    }
}

const apiCall = async(baseURL = API_BASE_URL, endpoint, options = {}) => {
    try{
        const response = await fetch(`${baseURL}${endpoint}`, {
            headers: {
                // Ensures the request specifies it is sending/expecting JSON data.
                'Content-Type': 'application/json',

                // Allows the caller to add or override headers via the options.headers object.
                ...options.headers,
            },
            // Spreads any other custom request configurations (like method, body, credentials, etc.) into the fetch call.
            ...options,
        });

        if(!response.ok) {
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

const authcall = async(endpoint, credentials) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        // Specify the method: POST
        method: 'POST', 
        // JSON format the passed credentials
        body: JSON.stringify(credentials)
    };

    // Pass the endpoint and option to apiCall()
    return await apiCall(API_BASE_URL, endpoint, options);
}

const awsResourceApi = {
    // configure AWS credentials
    configureAWS: async (credentials) => {
        // Map the passed credentials with the new specified attributes
        const {access_key, secret_access_key, region} = credentials;

        // Validate the credentials
        if(!access_key || !secret_access_key || !region) {
            return {
                data: null,
                // raise error
                error: 'Missing required credentials: access_key, secret_access_key, and region are all required'
            }
        }
        
        // Pass the endpoint and mapped credentials to apiCall(), then wait and return its repsonse
        return await authcall('/configure', {
            access_key,
            secret_access_key,
            region
        });
    },


    // get current region
    getAWSRegion: async () => {
        return await apiCall(API_BASE_URL, '/region')
    },

    // get AWS Cost
    getAWSCosts: async () => {
        return await apiCall(API_BASE_URL,'/costs')
    },

    // Get EC2 instances
    getRDS: async () => {
        return await apiCall(API_BASE_URL,'/rds');
    },

    // Get RDS
    getS3: async () => {
        return await apiCall(API_BASE_URL,'/s3');
    },

    // Get Lambda
    getLambda: async () => {
        return await apiCall(API_BASE_URL,'/lambda');
    },

    // Get load balancers
    getELB: async () => {
        return await apiCall(API_BASE_URL,'/elb');
    },

    // Get EC2
    getEC2: async () => {
        return await apiCall(API_BASE_URL,'/ec2');
    },

    // Get EBS
    getEBS: async () => {
        return await apiCall(API_BASE_URL,'/ebs');
    },

    // Get Elastic IPs
    getEIP: async () => {
        return await apiCall(API_BASE_URL,'/eip');
    }
}   
export { findURL };
export default awsResourceApi;