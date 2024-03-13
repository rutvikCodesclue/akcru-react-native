import axios from 'axios';
export const isProduction = process.env.NODE_ENV === 'production';
import {DEV_API_URL} from '@env';
import authStore from '../stores/auth.store';


// console.log('Current ENV for API:', process.env.NODE_ENV);
// console.log('Current ENV for API:', DEV_API_URL);
console.log('DEV_API_URL:', DEV_API_URL);
// console.log('NODE_ENV:', process.env.NODE_ENV);

import Castle from "@castleio/react-native-castle";


const addRequestTokenHeader = async () => {
    const requestTokenHeaderName = await Castle.requestTokenHeaderName();
const requestToken = await Castle.createRequestToken();
return  requestToken

}

const determineBaseURL = (): string => {
    switch (process.env.NODE_ENV) {
        case 'production':
            return DEV_API_URL;
        // case "staging":
        //     return "https://staging.api.akcru.com";
        default:
            return DEV_API_URL ?? 'http://10.0.2.2:3000';
    }
};
console.log('Backend API Client Base URL:', determineBaseURL());


const API = axios.create({
    baseURL: determineBaseURL(),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authStore.getState().getSession()
            ? `Bearer ${authStore.getState().getSession()?.access_token}`
            : undefined,
    },
});


API.interceptors.request.use(
    async config => {
        const session = authStore.getState().getSession();

        if (session) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        if (config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'put') {
            // Adjust this part according to your actual data structure
            const castle_request_token = await addRequestTokenHeader()
            config.data = {
                ...config.data,
                castle_request_token: castle_request_token,
            };
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

console.log('Backend API Client Base URL:', determineBaseURL());

export {API};
