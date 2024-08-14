import axios from 'axios';
export const isProduction = process.env.NODE_ENV === 'production';
import {AUTH_API_URL} from '@env';
import authStore from '../stores/auth.store';
import Castle from '@castleio/react-native-castle';
console.log('AUTH_API_URL:', AUTH_API_URL);

const addRequestTokenHeader = async () => {
    const requestToken = await Castle.createRequestToken();
    return requestToken;
};

const determineBaseURL = (): string => {
    switch (process.env.NODE_ENV) {
        case 'production':
            return AUTH_API_URL;
        default:
            return AUTH_API_URL ?? 'http://10.0.2.2:3000';
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
        const endpoints = ['/v1/auth/signup', '/v1/auth/login', undefined];

        if (
            (config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'put') &&
            endpoints.includes(config.url)
        ) {
            const castle_request_token = await addRequestTokenHeader();
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

export {API};
