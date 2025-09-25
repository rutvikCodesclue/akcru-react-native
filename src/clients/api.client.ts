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
        // Remove Authorization header from initial config - it will be set dynamically in the interceptor
    },
});

API.interceptors.request.use(
    async config => {
        const state = authStore.getState();
        
        // If store hasn't hydrated yet, wait for it
        if (!state._hasHydrated) {
            // Wait for hydration to complete
            let attempts = 0;
            while (!authStore.getState()._hasHydrated && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
            }
        }
        
        const session = authStore.getState().getSession();

        if (session?.access_token) {
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
    async error => {
        // Handle 401 responses globally
        if (error.response?.status === 401) {
            try {
                const { forceLogoutManager } = await import('../util/forceLogoutManager');
                await forceLogoutManager.executeForceLogout();
            } catch (logoutError) {
                console.error('Error during force logout:', logoutError);
            }
        }
        
        if (isNetworkError(error)) {
            // console.log("ERR_NETWORK N");
            Alert.alert('Please check your internet connection and Try Again');
        }

        if (error.response) {
        // Server responded with a status code out of 2xx range
            const statusCode = error.response.status;
            const errorMessage = error.response.data.message || 'An error occurred';

            // Handle different status codes accordingly
            if (statusCode === 500) {
                // Handle server errors
                console.error('Server error - try again later');
            } else {
                // Handle other types of errors
                console.error(`Error ${statusCode}: ${errorMessage}`);
            }
        }

        return Promise.reject(error);
    }
    );

function isNetworkError(error: unknown): error is AxiosError {
    if (error instanceof AxiosError) {
        return error.code === 'ERR_NETWORK';
    }
    return false;
}

export {API};
