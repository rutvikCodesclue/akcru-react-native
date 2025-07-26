import axios, {AxiosError} from 'axios';
export const isProduction = process.env.NODE_ENV === 'production';
import {DEV_API_URL} from '@env';
import authStore from '../stores/auth.store';
import Castle from '@castleio/react-native-castle';
import {Alert} from 'react-native';

const addRequestTokenHeader = async () => {
    const requestToken = await Castle.createRequestToken();
    return requestToken;
};

const determineBaseURL = (): string => {
    switch (process.env.NODE_ENV) {
        case 'production':
            return DEV_API_URL;
        default:
            return DEV_API_URL ?? 'http://10.0.2.2:3000';
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
        const endpoints = [
            '/v1/user',
            // '/v1/auth/signup',
            // '/v1/auth/login',
            '/v1/wallet/purchase/mit',
            '/v1/wallet/send-ad',
            '/v1/user/resetPassword',
            undefined,
        ];

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

API.interceptors.response.use(
    response => response,
    error => {
        if (isNetworkError(error)) {
            // console.log("ERR_NETWORK N");
            Alert.alert('Please check your internet connection and Try Again');
        }
        return error;
    },
);

function isNetworkError(error: unknown): error is AxiosError {
    if (error instanceof AxiosError) {
        return error.code === 'ERR_NETWORK';
    }
    return false;
}

export {API};
