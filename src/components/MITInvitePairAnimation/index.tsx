import React, {useEffect, useRef} from 'react';
import {
    Animated,
    Image,
    ImageSourcePropType,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {FONTS} from '../../../assets/constants';
import {MULTISIZES} from '../../../assets/constants/theme';
import HexAvatar from '../HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';
import imageindex from '../../../assets/images/imageindex';
import {COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';

type PairUser = {
    username?: string;
    profilePicture?: string;
    badge?: string;
};

type Props = {
    sender: PairUser;
    receiver: PairUser;
    containerStyle?: StyleProp<ViewStyle>;
    ticketIconSource?: ImageSourcePropType;
    compact?: boolean;
};

const renderBadge = (badge?: string) => {
    switch (badge) {
        case 'AKCRUIT':
            return <AkcruLevels.AkcruBadgeAkcruit />;
        case 'GUARDIAN':
            return <AkcruLevels.AkcruBadgeGuardian />;
        case 'HERO':
            return <AkcruLevels.AkcruBadgeHero />;
        case 'SUPERHERO':
            return <AkcruLevels.AkcruBadgeSuperHero />;
        default:
            return null;
    }
};

export default function MITInvitePairAnimation({
    sender,
    receiver,
    containerStyle,
    ticketIconSource = imageindex.mitTicketImage,
    compact = false,
}: Props) {
    const HEXAGON_FRAME_ROTATION_DEG = 0;
    const lightTravelAnim = useRef(new Animated.Value(0)).current;
    const [leftHexCenterX, setLeftHexCenterX] = React.useState(42);
    const [rightHexCenterX, setRightHexCenterX] = React.useState(250);
    const [leftHexCenterY, setLeftHexCenterY] = React.useState(34);
    const [rightHexCenterY, setRightHexCenterY] = React.useState(34);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(lightTravelAnim, {
                toValue: 1,
                duration: 1700,
                useNativeDriver: true,
            }),
        );
        loop.start();
        return () => {
            loop.stop();
            lightTravelAnim.stopAnimation();
            lightTravelAnim.setValue(0);
        };
    }, [lightTravelAnim]);

    const lightTranslateX = lightTravelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [leftHexCenterX - 50, rightHexCenterX - 50],
    });
    const lightTranslateY = lightTravelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [leftHexCenterY - 35, rightHexCenterY - 35],
    });
    const lightOpacity = lightTravelAnim.interpolate({
        inputRange: [0, 0.08, 0.88, 1],
        outputRange: [0.15, 1, 1, 0.15],
    });
    const sparkScale = lightTravelAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.85, 1.25, 0.85],
    });
    const sparkRotate = lightTravelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <LinearGradient
            colors={['#6DE5FF', '#965CFF', '#FF75E4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.outer, containerStyle]}>
            <LinearGradient
                colors={[COLORS.TRANSPARENT, '#5EDBFF', '#D883FF', COLORS.TRANSPARENT]}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={styles.pairBeam}
            />
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.travelGlow,
                    {
                        transform: [
                            {translateX: lightTranslateX},
                            {translateY: lightTranslateY},
                            {scale: sparkScale},
                            {rotate: sparkRotate},
                        ],
                        opacity: lightOpacity,
                    },
                ]}>
                <Image source={ticketIconSource} style={styles.travelIcon} />
            </Animated.View>
            <View style={styles.inner}>
                <View
                    style={styles.userCol}
                    onLayout={event => {
                        const {x, width} = event.nativeEvent.layout;
                        setLeftHexCenterX(x + width / 2);
                    }}>
                    <View
                        onLayout={event => {
                            const {y, height} = event.nativeEvent.layout;
                            setLeftHexCenterY(y + height / 2);
                        }}>
                        <HexAvatar
                            source={
                                sender.profilePicture ? {uri: sender.profilePicture} : imageindex.Akcruplaceholder
                            }
                            size={compact ? MULTISIZES.Xlarge43 : MULTISIZES.Xlarge60 + 6}
                            borderThickness={3}
                            imageZoom={1.1}
                            rotateFrameDegrees={HEXAGON_FRAME_ROTATION_DEG}
                            bordercolor={selectAvatarBorderColor(sender.badge ?? 'AKCRUIT')}
                        />
                    </View>
                    <Text style={[styles.userName, compact && styles.userNameCompact]}>{sender.username || 'You'}</Text>
                    <View style={[styles.badgeWrap, compact && styles.badgeWrapCompact]}>{renderBadge(sender.badge)}</View>
                </View>
                <View
                    style={styles.userCol}
                    onLayout={event => {
                        const {x, width} = event.nativeEvent.layout;
                        setRightHexCenterX(x + width / 2);
                    }}>
                    <View
                        onLayout={event => {
                            const {y, height} = event.nativeEvent.layout;
                            setRightHexCenterY(y + height / 2);
                        }}>
                        <HexAvatar
                            source={
                                receiver.profilePicture ? {uri: receiver.profilePicture} : imageindex.Akcruplaceholder
                            }
                            size={compact ? MULTISIZES.Xlarge43 : MULTISIZES.Xlarge60 + 6}
                            borderThickness={3}
                            imageZoom={1.1}
                            rotateFrameDegrees={HEXAGON_FRAME_ROTATION_DEG}
                            bordercolor={selectAvatarBorderColor(receiver.badge ?? 'AKCRUIT')}
                        />
                    </View>
                    <Text style={[styles.userName, compact && styles.userNameCompact]}>{receiver.username || ''}</Text>
                    <View style={[styles.badgeWrap, compact && styles.badgeWrapCompact]}>{renderBadge(receiver.badge)}</View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    outer: {
        borderRadius: 18,
        padding: 1.2,
        overflow: 'hidden',
        shadowColor: '#C15DFF',
        shadowOpacity: 0.55,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 0},
        elevation: 8,
    },
    travelGlow: {
        position: 'absolute',
        top: 0,
        width: 100,
        height: 100,
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    travelIcon: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    inner: {
        borderRadius: 17,
        backgroundColor: 'rgba(10, 6, 33, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pairBeam: {
        position: 'absolute',
        left: 14,
        right: 14,
        top: 46,
        height: 3,
        borderRadius: 3,
    },
    userCol: {
        width: '42%',
        alignItems: 'center',
    },
    userName: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginTop: 8,
        textAlign: 'center',
    },
    userNameCompact: {
        ...FONTS.Title3,
        marginTop: 4,
    },
    badgeWrap: {
        marginTop: 4,
        minHeight: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeWrapCompact: {
        marginTop: 2,
        minHeight: 14,
    },
});
