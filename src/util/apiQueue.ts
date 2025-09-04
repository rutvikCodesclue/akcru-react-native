/**
 * API Queue utility to handle sequential API calls and prevent multiple 401 responses
 */

type ApiCall<T> = () => Promise<T>;

class ApiQueue {
    private isProcessing = false;
    private queue: Array<() => Promise<any>> = [];

    /**
     * Add an API call to the queue
     */
    async enqueue<T>(apiCall: ApiCall<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await apiCall();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            this.processQueue();
        });
    }

    /**
     * Process the queue sequentially
     */
    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const apiCall = this.queue.shift();
            if (apiCall) {
                try {
                    await apiCall();
                } catch (error: any) {
                    // If we get a 401, clear the remaining queue to prevent more 401s
                    if (error?.response?.status === 401) {
                        console.log('401 detected, clearing API queue to prevent multiple force logouts');
                        this.queue.length = 0; // Clear remaining queue
                        break;
                    }
                    // For other errors, continue processing the queue
                }
            }
        }

        this.isProcessing = false;
    }

    /**
     * Clear the queue (useful when user logs out)
     */
    clear() {
        this.queue.length = 0;
        this.isProcessing = false;
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.queue.length,
        };
    }
}

// Export a singleton instance
export const apiQueue = new ApiQueue();

/**
 * Utility function to wrap API calls with queuing
 */
export const queueApiCall = <T>(apiCall: ApiCall<T>): Promise<T> => {
    return apiQueue.enqueue(apiCall);
};
