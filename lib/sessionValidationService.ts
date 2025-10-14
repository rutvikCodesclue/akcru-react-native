import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { API } from '../src/clients/auth.client';
import useAuthStore from '../src/stores/auth.store';
import * as RootNavigation from '../src/util/RootNavigation';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { logger } from '@100mslive/react-native-hms';

/**
 * Service to handle session validation and automatic logout
 * Optimized to reduce server load
 */
class SessionValidationService {
  private loginTimestamp: number | null = null;
  private isChecking = false;

  /**
   * Initialize session validation service
   */
  async initialize() {
    // Record login timestamp
    this.loginTimestamp = Date.now();

    // Check session on app focus only (no periodic checks)
    this.setupAppStateListener();

    // Wait for auth store to be hydrated before initial validation
    await this.waitForStoreHydration();

    // Initial check when service starts (only if user is logged in)
    const user = useAuthStore.getState().user;
    if (user) {
      await this.validateSession();
    }
  }

  /**
   * Wait for the auth store to be hydrated from persistence
   */
  private async waitForStoreHydration() {
    let attempts = 0;
    while (!useAuthStore.getState()._hasHydrated && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  /**
   * Setup app state listener to check session when app comes to foreground
   */
  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, validate session
        this.validateSession();
      }
    });
  }

  /**
   * Validate current session by checking session count instead of individual token
   * This is more efficient as it reuses existing logic
   */
  async validateSession() {
    if (this.isChecking) return; // Prevent multiple simultaneous checks

    try {
      this.isChecking = true;

      const user = useAuthStore.getState().user;
      const jwt = useAuthStore.getState().session?.access_token
      const session = useAuthStore.getState().session;
      
      // Only validate if user is logged in and has a session
      if (!user || !session) {
        console.log('No user or session found, skipping validation');
        return;
      }


      // Use the new validate-session endpoint which checks both JWT and device token
      try {
        const sessionTestResponse = await API.post('/v1/auth/validate-session', {
          jwt: jwt
        });
        if (!sessionTestResponse.data.success || !sessionTestResponse.data.sessionValid) {
          console.log('Session invalid according to server response:', sessionTestResponse.data);
          await this.handleForceLogout();
          return;
        }
      } catch (error: any) {
        // If we get a 401, SESSION_INVALIDATED, or DEVICE_TOKEN_REVOKED error, force logout
        if (error.response?.status === 401 || 
            error.response?.data?.code === 'SESSION_INVALIDATED' ||
            error.response?.data?.code === 'DEVICE_TOKEN_REVOKED') {
          console.log('Session invalidated by server:', error.response?.data);
          await this.handleForceLogout();
          return;
        }
        
        // For other errors (network issues), don't force logout
        console.log('Session validation failed (network issue):', error);
      }
    } catch (error) {
      // If API call fails, we don't force logout (could be network issue)
      console.log('Session validation failed (network issue):', error);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Handle forced logout when session is invalidated
   */
  private async handleForceLogout() {
    try {
      console.log('Session invalidated - forcing logout');

      // Clear all stored authentication data
      await AsyncStorage.multiRemove(['access_token', 'deviceToken']);

      // Clear auth store
      const { logout } = useAuthStore.getState();
      await logout();

      // Show alert and navigate to login
      Alert.alert(
        'Session Expired',
        'Your session has been terminated because you logged in from another device.',
        [
          {
            text: 'OK',
            onPress: () => {
              RootNavigation.navigate('Signin', {});
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error during force logout:', error);
      // Force navigate to signin even if cleanup fails
      // RootNavigation.navigate('Signin', {});
    }
  }

  /**
   * Cleanup when service is destroyed
   */
  destroy() {
    // No periodic checks to clean up anymore
    this.loginTimestamp = null;
  }
}

// Export singleton instance
export const sessionValidationService = new SessionValidationService();

// Export for manual validation
export const validateCurrentSession = () => sessionValidationService.validateSession();
