import {View, Text, Image} from 'react-native';
import React from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
import useAuthStore from '../../stores/auth.store';

const WatchPartyHeader = () => {
    const {user} = useAuthStore();

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
                    <Text style={{...FONTS.Title1}}>{user?.adAmount ?? 0}</Text>
                </View>
            </View>
        </View>
    );
};

export default WatchPartyHeader;
