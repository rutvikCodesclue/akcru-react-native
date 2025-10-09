import {Platform, Alert, PlatformIOSStatic} from 'react-native';
import {requestTrackingPermission, getTrackingStatus} from 'react-native-tracking-transparency';

export enum TrackingStatus {
  NotDetermined = 'not-determined',
  Restricted = 'restricted',
  Denied = 'denied',
  Authorized = 'authorized',
  Unavailable = 'unavailable',
}

/**
 * Check if the current iOS version supports ATT (iOS 14.5+)
 */
const isATTSupported = (): boolean => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  
  const iosVersion = (Platform as PlatformIOSStatic).Version;
  
  // ATT is available from iOS 14.5 onwards
  if (typeof iosVersion === 'string') {
    const majorVersion = parseInt(iosVersion.split('.')[0], 10);
    const minorVersion = parseInt(iosVersion.split('.')[1] || '0', 10);
    return majorVersion > 14 || (majorVersion === 14 && minorVersion >= 5);
  }
  
  return iosVersion >= 14.5;
};

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

    // Check if ATT is supported on this iOS version
    if (!isATTSupported()) {
      console.log('ATT not supported on this iOS version, treating as authorized');
      return {
        status: TrackingStatus.Authorized,
        canTrack: true,
      };
    }

    // Check current status first
    const currentStatus = await getTrackingStatus();
    console.log('Current ATT status before request:', currentStatus);
    
    // If already determined, return the current status
    if (currentStatus !== TrackingStatus.NotDetermined) {
      console.log('ATT already determined, status:', currentStatus);
      return {
        status: currentStatus as TrackingStatus,
        canTrack: currentStatus === TrackingStatus.Authorized,
      };
    }

    console.log('Requesting ATT permission...');
    // Request permission if not determined
    const trackingStatus = await requestTrackingPermission();
    console.log('ATT permission result:', trackingStatus);
    
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

    // Check if ATT is supported on this iOS version
    if (!isATTSupported()) {
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
 * Handles the complete ATT flow - directly shows system permission request
 * Complies with Apple's ATT guidelines by not including pre-permission alerts with exit options
 */
export const handleAppTrackingFlow = async (): Promise<TrackingPermissionResult> => {
  try {
    console.log('Starting ATT flow...');
    console.log('Platform:', Platform.OS);
    console.log('iOS Version:', Platform.OS === 'ios' ? (Platform as PlatformIOSStatic).Version : 'N/A');
    console.log('ATT Supported:', isATTSupported());
    
    // Check if we're on iOS and if permission is already determined
    const currentStatus = await getCurrentTrackingStatus();
    console.log('Current status in flow:', currentStatus);
    
    if (currentStatus.status !== TrackingStatus.NotDetermined) {
      console.log('ATT already determined, returning current status');
      return currentStatus;
    }

    console.log('ATT not determined, requesting permission...');
    // Directly request the ATT permission without any pre-permission alert
    // This complies with Apple's requirement that users should always proceed 
    // to the permission request without being able to bypass or delay it
    const result = await requestAppTrackingPermission();
    console.log('ATT flow completed with result:', result);
    return result;
  } catch (error) {
    console.error('Error in ATT flow:', error);
    return {
      status: TrackingStatus.Unavailable,
      canTrack: false,
    };
  }
};

/**
 * Delayed ATT request - waits for app to be fully loaded before requesting permission
 * This helps avoid timing issues on newer iOS versions
 */
export const handleDelayedAppTrackingFlow = async (delayMs: number = 2000): Promise<TrackingPermissionResult> => {
  console.log(`Delaying ATT request by ${delayMs}ms to ensure app is fully loaded...`);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await handleAppTrackingFlow();
      resolve(result);
    }, delayMs);
  });
};