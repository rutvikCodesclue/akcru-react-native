import axios from 'axios';
export const isProduction = process.env.NODE_ENV === 'production';
import {DEV_API_URL} from '@env';
import authStore from '../stores/auth.store';

console.log('Current ENV for API:', process.env.NODE_ENV);
console.log('Current ENV for API:', DEV_API_URL);

const determineBaseURL = (): string => {
    switch (process.env.NODE_ENV) {
        case 'production':
            return 'https://akcru-api.fly.dev/';
        // case "staging":
        //     return "https://staging.api.akcru.com";
        default:
            return 'http://localhost:3000/' ?? 'http://10.0.2.2:3000';
    }
};

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

        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

console.log('Backend API Client Base URL:', determineBaseURL());

export {API};
