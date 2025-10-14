import React from 'react';
import {Platform} from 'react-native';
import {InterstitialAd, BannerAd, RewardedAd, TestIds, AdEventType} from 'react-native-google-mobile-ads';
import {getCurrentTrackingStatus} from '../../lib/appTrackingTransparency';

// Your production ad unit IDs
export const AD_UNIT_IDS = {
  INTERSTITIAL: {
    android: 'ca-app-pub-8264001768347242/2150819252',
    ios: 'ca-app-pub-8264001768347242/1708251538',
  },
  BANNER: {
    android: 'ca-app-pub-8264001768347242/6300978111', // Add your banner ad unit IDs
    ios: 'ca-app-pub-8264001768347242/6300978111',
  },
  REWARDED: {
    android: 'ca-app-pub-8264001768347242/5563571167', // Add your rewarded ad unit IDs
    ios: 'ca-app-pub-8264001768347242/5563571167',
  },
};

export type AdType = 'INTERSTITIAL' | 'BANNER' | 'REWARDED';

/**
 * Gets the appropriate ad unit ID based on platform and debug mode
 */
export const getAdUnitId = (adType: AdType): string | undefined => {
  if (__DEV__) {
    switch (adType) {
      case 'INTERSTITIAL':
        return TestIds.INTERSTITIAL;
      case 'BANNER':
        return TestIds.BANNER;
      case 'REWARDED':
        return TestIds.REWARDED;
      default:
        return TestIds.INTERSTITIAL;
    }
  }

  const platformIds = AD_UNIT_IDS[adType];
  return Platform.select(platformIds);
};

/**
 * Creates ad request configuration based on App Tracking Transparency status
 */
export const createAdRequestConfig = async () => {
  try {
    const trackingResult = await getCurrentTrackingStatus();
    
    return {
      requestNonPersonalizedAdsOnly: !trackingResult.canTrack,
      // Add other ad configuration options as needed
      keywords: [], // You can add relevant keywords
    };
  } catch (error) {
    console.error('Error getting tracking status for ads:', error);
    // Fallback to non-personalized ads if there's an error
    return {
      requestNonPersonalizedAdsOnly: true,
    };
  }
};

/**
 * Creates an interstitial ad with proper ATT configuration
 */
export const createInterstitialAd = async (): Promise<InterstitialAd | null> => {
  try {
    const adUnitId = getAdUnitId('INTERSTITIAL');
    if (!adUnitId) {
      console.error('No interstitial ad unit ID available');
      return null;
    }

    const adConfig = await createAdRequestConfig();
    return InterstitialAd.createForAdRequest(adUnitId, adConfig);
  } catch (error) {
    console.error('Error creating interstitial ad:', error);
    return null;
  }
};

/**
 * Creates a rewarded ad with proper ATT configuration
 */
export const createRewardedAd = async (): Promise<RewardedAd | null> => {
  try {
    const adUnitId = getAdUnitId('REWARDED');
    if (!adUnitId) {
      console.error('No rewarded ad unit ID available');
      return null;
    }

    const adConfig = await createAdRequestConfig();
    return RewardedAd.createForAdRequest(adUnitId, adConfig);
  } catch (error) {
    console.error('Error creating rewarded ad:', error);
    return null;
  }
};

/**
 * Hook for managing interstitial ads with ATT support
 */
export const useInterstitialAd = () => {
  const [ad, setAd] = React.useState<InterstitialAd | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadAd = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const newAd = await createInterstitialAd();
      
      if (newAd) {
        setAd(newAd);
        
        const unsubscribeLoaded = newAd.addAdEventListener(AdEventType.LOADED, () => {
          setIsLoaded(true);
          setIsLoading(false);
        });
        
        const unsubscribeError = newAd.addAdEventListener(AdEventType.ERROR, (error) => {
          console.error('Interstitial ad error:', error);
          setIsLoaded(false);
          setIsLoading(false);
        });
        
        const unsubscribeClosed = newAd.addAdEventListener(AdEventType.CLOSED, () => {
          setIsLoaded(false);
          // Preload next ad
          loadAd();
        });

        newAd.load();
        
        return () => {
          unsubscribeLoaded();
          unsubscribeError();
          unsubscribeClosed();
        };
      }
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
      setIsLoading(false);
    }
  }, []);

  const showAd = React.useCallback(() => {
    if (ad && isLoaded) {
      ad.show();
    } else {
      console.warn('Interstitial ad not loaded yet');
    }
  }, [ad, isLoaded]);

  React.useEffect(() => {
    loadAd();
  }, [loadAd]);

  return {
    showAd,
    isLoaded,
    isLoading,
    loadAd,
  };
};