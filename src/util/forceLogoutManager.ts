/**
 * Global state manager for force logout to prevent multiple simultaneous logouts
 */
class ForceLogoutManager {
    private static instance: ForceLogoutManager;
    private isLoggingOut = false;
    private logoutPromise: Promise<void> | null = null;

    private constructor() {}

    static getInstance(): ForceLogoutManager {
        if (!ForceLogoutManager.instance) {
            ForceLogoutManager.instance = new ForceLogoutManager();
        }
        return ForceLogoutManager.instance;
    }

    /**
     * Execute force logout only once, even if called multiple times
     */
    async executeForceLogout(): Promise<void> {
        // If already logging out, return the existing promise
        if (this.isLoggingOut && this.logoutPromise) {
            return this.logoutPromise;
        }

        // If already completed logout recently, don't do it again
        if (this.isLoggingOut) {
            return;
        }

        this.isLoggingOut = true;

        // Create the logout promise
        this.logoutPromise = this.performLogout();

        try {
            await this.logoutPromise;
        } finally {
            // Reset state after a delay to prevent immediate re-triggering
            setTimeout(() => {
                this.isLoggingOut = false;
                this.logoutPromise = null;
            }, 2000);
        }
    }

    private async performLogout(): Promise<void> {
        try {
            console.log('🚪 Executing force logout...');
            
            // Clear API queue first to prevent further requests
            try {
                const { apiQueue } = await import('./apiQueue');
                apiQueue.clear();
            } catch (error) {
                console.error('Error clearing API queue:', error);
            }

            // Execute the actual logout
            const { handleForceLogout } = await import('../../lib/pushNotifications');
            console.log('Calling handleForceLogout...');
            await handleForceLogout();
            
            console.log('✅ Force logout completed');
        } catch (error) {
            console.error('❌ Error during force logout:', error);
            throw error;
        }
    }

    /**
     * Check if currently logging out
     */
    isCurrentlyLoggingOut(): boolean {
        return this.isLoggingOut;
    }

    /**
     * Reset the logout state (useful for testing or manual reset)
     */
    reset(): void {
        this.isLoggingOut = false;
        this.logoutPromise = null;
    }
}

// Export singleton instance
export const forceLogoutManager = ForceLogoutManager.getInstance();
