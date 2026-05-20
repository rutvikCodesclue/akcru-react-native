import React from 'react';
import {Pressable, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS, FONTS} from '../../../assets/constants';
import imageindex from '../../../assets/images/imageindex';
import {IUserProfile} from '../../../types';
import HexAvatar from '../HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';

type UserDiscoveryCardProps = {
    user: IUserProfile;
    subtitle?: string;
    fallbackDescription?: string;
    onPress: () => void;
    onLongPress?: () => void;
};

const UserDiscoveryCard = ({
    user,
    subtitle = 'Archetype Match',
    fallbackDescription = 'Tap to schedule invite',
    onPress,
    onLongPress,
}: UserDiscoveryCardProps) => {
    const description = user.description?.trim() || fallbackDescription;
    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.cardWrap}>
            <LinearGradient
                colors={['#7BE0FF', '#8767FF', '#DF9BFF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBorder}>
                <View style={styles.inner}>
                    <HexAvatar
                        source={user.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder}
                        size={60}
                        borderThickness={5}
                        bordercolor={selectAvatarBorderColor(user.badge ?? '')}
                        rotateFrameDegrees={90}
                    />
                    <View style={styles.meta}>
                        <Text style={styles.name}>{user.username}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                        <Text style={styles.description} numberOfLines={3}>
                            {description}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </Pressable>
    );
};

const styles = {
    cardWrap: {
        borderRadius: 14,
        padding: 1.2,
        marginTop: 12,
        shadowColor: '#9D63FF',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 3,
    },
    gradientBorder: {
        borderRadius: 13,
    },
    inner: {
        borderRadius: 13,
        backgroundColor: COLORS.BLACK,
        paddingVertical: 11,
        paddingHorizontal: 10,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    meta: {
        flex: 1,
        marginHorizontal: 10,
    },
    name: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
    },
    subtitle: {
        ...FONTS.Title2,
        color: '#8AD6FF',
        marginTop: 2,
    },
    description: {
        ...FONTS.paragraph2,
        color: '#D8D7FF',
        marginTop: 2,
    },
};

export default UserDiscoveryCard;
