import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {getAdUnitId, createAdRequestConfig} from '../../utils/adsHelper';

interface ATTBannerAdProps {
  size?: BannerAdSize;
  style?: any;
}

const ATTBannerAd: React.FC<ATTBannerAdProps> = ({
  size = BannerAdSize.BANNER,
  style,
}) => {
  const [adConfig, setAdConfig] = useState<any>(null);
  const [adUnitId, setAdUnitId] = useState<string | null>(null);

  useEffect(() => {
    const initializeAd = async () => {
      try {
        const config = await createAdRequestConfig();
        const unitId = getAdUnitId('BANNER');
        
        setAdConfig(config);
        setAdUnitId(unitId || '');
      } catch (error) {
        console.error('Error initializing banner ad:', error);
      }
    };

    initializeAd();
  }, []);

  if (!adUnitId || !adConfig) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={adConfig}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ATTBannerAd;