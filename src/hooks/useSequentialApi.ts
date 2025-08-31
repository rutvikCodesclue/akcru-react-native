import { useCallback, useState } from 'react';
import { queueApiCall } from '../util/apiQueue';

/**
 * Hook for managing sequential API calls to prevent multiple 401 responses
 */
export const useSequentialApi = () => {
    const [isLoading, setIsLoading] = useState(false);

    const executeSequentially = useCallback(async (apiCalls: Array<() => Promise<any>>) => {
        if (isLoading) return [];
        
        setIsLoading(true);
        const results: any[] = [];
        
        try {
            for (const apiCall of apiCalls) {
                try {
                    const result = await queueApiCall(apiCall);
                    results.push({ success: true, data: result });
                } catch (error) {
                    results.push({ success: false, error });
                    // If we get a 401, stop executing remaining calls
                    if ((error as any)?.response?.status === 401) {
                        console.log('401 detected, stopping sequential API execution');
                        break;
                    }
                }
            }
        } finally {
            setIsLoading(false);
        }
        
        return results;
    }, [isLoading]);

    const executeSingle = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
        return queueApiCall(apiCall);
    }, []);

    return {
        isLoading,
        executeSequentially,
        executeSingle,
    };
};

/**
 * Utility function to create a batch of API calls with error handling
 */
export const createApiCallBatch = (calls: Record<string, () => Promise<any>>) => {
    return Object.entries(calls).map(([key, apiCall]) => ({
        key,
        call: apiCall,
    }));
};
