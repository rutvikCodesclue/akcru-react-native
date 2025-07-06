import {View, Text, Image} from 'react-native';
import React, {useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
import useAuthStore from '../../stores/auth.store';
import {getUserWallet} from '../../lib/api/wallet.lib';
import {useIsFocused} from '@react-navigation/native';

const WatchPartyHeader = () => {
    const isFocused = useIsFocused();
    const walletBalance = useAuthStore(s => s.walletBalance);
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        getUserWallet()
            .then(b => {
                if (b !== undefined) {
                    setWalletBalance(b);
                }
            })
            .catch(e => console.error('wallet fetch failed', e));
    }, [isFocused, setWalletBalance]);

    return (
        <View
            style={{
                width: SIZES.ScreenWidth,
            }}>
            <LinearGradient
                colors={[COLORS.AKCRUBACKGROUND, 'transparent']}
                style={{position: 'absolute', left: 0, right: 0, top: 0, height: 65}}
            />
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: 15,
                }}>
                <View>
                    <Image source={imageindex.AkcruLogo} style={{width: 90, height: 60}} resizeMode="contain" />
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View>
                        <Image
                            source={imageindex.AkcruHexLogo}
                            style={{width: 21, height: 21, marginRight: 8, marginLeft: 20}}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={{...FONTS.Title1}}>{walletBalance ?? '0'}</Text>
                </View>
            </View>
        </View>
    );
};

export default WatchPartyHeader;
