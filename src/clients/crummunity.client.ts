import axios from 'axios';
export const isProduction = process.env.NODE_ENV === 'production';
import {CRUMMUNITY_API_URL} from '@env';
import authStore from '../stores/auth.store';
import Castle from '@castleio/react-native-castle';

const addRequestTokenHeader = async () => {
    const requestToken = await Castle.createRequestToken();
    return requestToken;
};

const determineBaseURL = (): string => {
    console.log(CRUMMUNITY_API_URL);
    switch (process.env.NODE_ENV) {
        case 'production':
            return CRUMMUNITY_API_URL;
        default:
            return CRUMMUNITY_API_URL ?? 'http://10.0.2.2:3000';
    }
};

const CRUMMUNITY = axios.create({
    baseURL: determineBaseURL(),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // Remove Authorization header from initial config - it will be set dynamically in the interceptor
    },
});

CRUMMUNITY.interceptors.request.use(
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

// Global flag to prevent multiple simultaneous force logouts
let isForceLoggingOut = false;

// Response interceptor to handle 401 responses
CRUMMUNITY.interceptors.response.use(
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
        
        return Promise.reject(error);
    },
);

export {CRUMMUNITY};
