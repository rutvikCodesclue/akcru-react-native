import {useState, useEffect} from 'react';
import {getCurrentTrackingStatus, TrackingPermissionResult, TrackingStatus} from '../../lib/appTrackingTransparency';

export const useAppTrackingTransparency = () => {
  const [trackingPermission, setTrackingPermission] = useState<TrackingPermissionResult>({
    status: TrackingStatus.NotDetermined,
    canTrack: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTrackingStatus = async () => {
      try {
        setIsLoading(true);
        const result = await getCurrentTrackingStatus();
        setTrackingPermission(result);
      } catch (error) {
        console.error('Error getting tracking status:', error);
        setTrackingPermission({
          status: TrackingStatus.Unavailable,
          canTrack: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getTrackingStatus();
  }, []);

  const refreshTrackingStatus = async () => {
    const result = await getCurrentTrackingStatus();
    setTrackingPermission(result);
    return result;
  };

  return {
    trackingPermission,
    isLoading,
    refreshTrackingStatus,
    canTrack: trackingPermission.canTrack,
    trackingStatus: trackingPermission.status,
  };
};