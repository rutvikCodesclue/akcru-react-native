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
            return "http://52.55.157.223:3000";
// return AUTH_API_URL;
        default:
            return "http://52.55.157.223:3000";
//return AUTH_API_URL ?? 'http://10.0.2.2:3000';
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
        if (!state._hasHydrated && config.url && !config.url.includes('/auth/')) {
            // Wait for hydration to complete
            let attempts = 0;
            while (!authStore.getState()._hasHydrated && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
            }
        }

        const session = authStore.getState().getSession();

        // Always set Authorization header if session exists
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        const endpoints = ['/v1/auth/signup', '/v1/auth/login', '/v1/auth/check-pre-session'];

        if (
            (config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'put') &&
            config.url && endpoints.includes(config.url)
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

            console.log('\n\n[AUTH API REQUEST]', {
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

// Response interceptor to handle token expiry
API.interceptors.response.use(
    response => {
        if (!isProduction) {
            const base = response.config.baseURL ?? API.defaults.baseURL ?? '';
            const url = `${base}${response.config.url ?? ''}`;

            console.log('\n\n[AUTH API RESPONSE]', {
                url,
                status: response.status,
                headers: response.headers,
                data: response.data,
            });
        }

        return response;
    },
    async error => {
        const originalRequest = error.config;

        if (!isProduction && originalRequest) {
            const base = originalRequest.baseURL ?? API.defaults.baseURL ?? '';
            const url = `${base}${originalRequest.url ?? ''}`;

            console.log('[AUTH API ERROR]', {
                url,
                status: error.response?.status,
                headers: error.response?.headers,
                data: error.response?.data,
            });
        }

        if (error.response?.status === 401) {
            // Handle 401 responses globally first
            try {
                const { forceLogoutManager } = await import('../util/forceLogoutManager');
                await forceLogoutManager.executeForceLogout();
            } catch (logoutError) {
                console.error('Error during force logout:', logoutError);
            }

            // If it's not a retry attempt and not currently logging out, try to refresh the session
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const { forceLogoutManager } = await import('../util/forceLogoutManager');

                    // Only attempt refresh if not currently logging out
                    if (!forceLogoutManager.isCurrentlyLoggingOut()) {
                        // Trigger session refresh through the auth store
                        await authStore.getState().hydrateAuth();

                        // Get the updated session
                        const refreshedSession = authStore.getState().getSession();

                        if (refreshedSession?.access_token) {
                            originalRequest.headers.Authorization = `Bearer ${refreshedSession.access_token}`;
                            return API(originalRequest);
                        }
                    }
                } catch (refreshError) {
                    console.error('Failed to refresh session:', refreshError);
                }
            }
        }

        return Promise.reject(error);
    },
);

export {API};
