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

        if (!isProduction) {
            const base = config.baseURL ?? API.defaults.baseURL ?? '';
            const url = `${base}${config.url ?? ''}`;
            const safeBody =
                config.data && typeof config.data === 'object'
                    ? {
                          ...config.data,
                          password: config.data.password ? '***' : config.data.password,
                      }
                    : config.data;

            console.log('\n\n[API REQUEST]', {
                method: config.method,
                url,
                baseURL: base,
                headers: config.headers,
                body: safeBody,
            });
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

API.interceptors.response.use(
    response => {
        if (!isProduction) {
            const base = response.config.baseURL ?? API.defaults.baseURL ?? '';
            const url = `${base}${response.config.url ?? ''}`;

            console.log('\n\n[API RESPONSE]', {
                url,
                status: response.status,
                headers: response.headers,
                data: response.data,
            });
        }

        return response;
    },
    async error => {
        if (!isProduction && error.config) {
            const base = error.config.baseURL ?? API.defaults.baseURL ?? API.defaults.baseURL ?? '';
            const url = `${base}${error.config.url ?? ''}`;

            console.log('\n\n[API ERROR]', {
                url,
                status: error.response?.status,
                headers: error.response?.headers,
                data: error.response?.data,
            });
        }

        // Handle 401 responses globally
        if (error.response?.status === 401) {
            console.log("ERR 401 in API client");

            try {
                const { forceLogoutManager } = await import('../util/forceLogoutManager');
                if (!error.config.url.includes("watchtime/config")) {
                    await forceLogoutManager.executeForceLogout();
                }
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
            console.error(`API Error${statusCode}: ${errorMessage}`);

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
    },
);

function isNetworkError(error: unknown): error is AxiosError {
    if (error instanceof AxiosError) {
        return error.code === 'ERR_NETWORK';
    }
    return false;
}

export {API};
