import {Platform, Alert} from 'react-native';
import {requestTrackingPermission, getTrackingStatus} from 'react-native-tracking-transparency';

export enum TrackingStatus {
  NotDetermined = 'not-determined',
  Restricted = 'restricted',
  Denied = 'denied',
  Authorized = 'authorized',
  Unavailable = 'unavailable',
}

export interface TrackingPermissionResult {
  status: TrackingStatus;
  canTrack: boolean;
}

/**
 * Requests App Tracking Transparency permission on iOS 14.5+
 * Returns the tracking status and whether tracking is allowed
 */
export const requestAppTrackingPermission = async (): Promise<TrackingPermissionResult> => {
  try {
    if (Platform.OS !== 'ios') {
      // Android doesn't require ATT, return authorized
      return {
        status: TrackingStatus.Authorized,
        canTrack: true,
      };
    }

    // Check current status first
    const currentStatus = await getTrackingStatus();
    
    // If already determined, return the current status
    if (currentStatus !== TrackingStatus.NotDetermined) {
      return {
        status: currentStatus as TrackingStatus,
        canTrack: currentStatus === TrackingStatus.Authorized,
      };
    }

    // Request permission if not determined
    const trackingStatus = await requestTrackingPermission();
    
    return {
      status: trackingStatus as TrackingStatus,
      canTrack: trackingStatus === TrackingStatus.Authorized,
    };
  } catch (error) {
    console.error('Error requesting tracking permission:', error);
    return {
      status: TrackingStatus.Unavailable,
      canTrack: false,
    };
  }
};

/**
 * Gets the current App Tracking Transparency status
 */
export const getCurrentTrackingStatus = async (): Promise<TrackingPermissionResult> => {
  try {
    if (Platform.OS !== 'ios') {
      return {
        status: TrackingStatus.Authorized,
        canTrack: true,
      };
    }

    const currentStatus = await getTrackingStatus();
    
    return {
      status: currentStatus as TrackingStatus,
      canTrack: currentStatus === TrackingStatus.Authorized,
    };
  } catch (error) {
    console.error('Error getting tracking status:', error);
    return {
      status: TrackingStatus.Unavailable,
      canTrack: false,
    };
  }
};

/**
 * Shows an educational alert about tracking before requesting permission
 */
export const showTrackingEducationalAlert = (): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Personalized Ads',
      'We use your data to provide you with better ads and app experience. You can change this preference anytime in Settings.',
      [
        {
          text: 'Ask App Not to Track',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Continue',
          style: 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: false }
    );
  });
};

/**
 * Handles the complete ATT flow with educational alert
 */
export const handleAppTrackingFlow = async (): Promise<TrackingPermissionResult> => {
  try {
    // Check if we're on iOS and if permission is already determined
    const currentStatus = await getCurrentTrackingStatus();
    
    if (currentStatus.status !== TrackingStatus.NotDetermined) {
      return currentStatus;
    }

    // Show educational alert first (optional - you can remove this if you prefer the system dialog only)
    const userWantsToContinue = await showTrackingEducationalAlert();
    
    if (!userWantsToContinue) {
      // User chose not to track, but we still need to show the system dialog
      // because Apple requires showing the system ATT dialog
    }

    // Request the actual ATT permission
    return await requestAppTrackingPermission();
  } catch (error) {
    console.error('Error in ATT flow:', error);
    return {
      status: TrackingStatus.Unavailable,
      canTrack: false,
    };
  }
};