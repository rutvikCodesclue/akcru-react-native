import {
    Animated,
    DeviceEventEmitter,
    Easing,
    Image,
    InteractionManager,
    Platform,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from 'react-native';
import React from 'react';
import {AkcruControlBtn} from '../../../assets/svg';
import imageindex from '../../../assets/images/imageindex';
import {Icon} from '@rneui/base';
import {COLORS} from '../../../assets/constants';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {ClientTabsParams} from '../../navigation/ClientTabNavigator';
import {isTablet} from '../../../assets/constants/theme';
import {UseTabMenu} from '../../context/TabContext';
import {HEXAGON_SHAKE_EVENT} from '../../util/hexagonShakeEvent';
import {navigateToUserMITHubScreen} from '../../util/RootNavigation';

const SHAKE_STEPS_MS = 55;

/** Five satellite buttons along the upper semicircle (π → 0): bell left, shop top, globe right. */
function getHalfCircleOffsets(isTabletDevice: boolean): {x: number; y: number}[] {
    const radius = isTabletDevice ? 118 : 92;
    const angles = [Math.PI, (3 * Math.PI) / 4, Math.PI / 2, Math.PI / 4, 0];
    return angles.map(a => ({
        x: radius * Math.cos(a),
        y: -radius * Math.sin(a),
    }));
}

const AkcruCenterButton: React.FC<{opened: any; toggleOpened: () => void}> = ({opened, toggleOpened}) => {
    const animation = React.useRef(new Animated.Value(0)).current;
    const shakeRotation = React.useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<NavigationProp<ClientTabsParams>>();
    const {mitNotificationUnreadCount, msgRcvdNotificationUnreadCount} = UseTabMenu();

    const tablet = isTablet();
    const menuLiftAboveNav = tablet ? -64 : -52;
    const centerButtonLift = tablet ? -40 : -28;
    const centerLiftWhenOpen = centerButtonLift + menuLiftAboveNav;
    const iconSize = tablet ? 32 : 25;

    const runHexagonShake = React.useCallback(() => {
        try {
            Vibration.cancel();
            if (Platform.OS === 'ios') {
                Vibration.vibrate([0, 70, 90, 70]);
            } else {
                Vibration.vibrate([0, 55, 45, 55, 45, 55]);
            }
        } catch {
            // ignore
        }
        shakeRotation.setValue(0);
        // useNativeDriver false: same Animated.View as open/close translateY (also false).
        Animated.sequence([
            Animated.timing(shakeRotation, {
                toValue: 1,
                duration: SHAKE_STEPS_MS,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(shakeRotation, {
                toValue: -1,
                duration: SHAKE_STEPS_MS,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(shakeRotation, {
                toValue: 1,
                duration: SHAKE_STEPS_MS,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(shakeRotation, {
                toValue: -1,
                duration: SHAKE_STEPS_MS,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(shakeRotation, {
                toValue: 0,
                duration: SHAKE_STEPS_MS + 20,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
        ]).start();
    }, [shakeRotation]);

    React.useEffect(() => {
        const sub = DeviceEventEmitter.addListener(HEXAGON_SHAKE_EVENT, runHexagonShake);
        return () => sub.remove();
    }, [runHexagonShake]);

    const handlePressShop = () => {
        navigation.navigate('AkcruButtonStack', {screen: 'PurchaseAdScreen'});
        toggleOpened();
        console.log('handlePressShop');
    };
    // new
    const handlePressWorld = () => {
        navigation.navigate('AkcruButtonStack', {
            screen: 'CrusaderScreen',
        });
        toggleOpened();
    };
    const handlePressCalendar = () => {
        navigation.navigate('AkcruButtonStack', {
            screen: 'VisionaryRooms',
        });
        toggleOpened();
    };

    const handlePressMITChat = () => {
        // Ensure UserProfileScreen is under ChatList so Back / tab reset work (single-route stacks break BackButton).
        navigation.navigate('UserProfileStack', {screen: 'UserProfileScreen'});
        InteractionManager.runAfterInteractions(() => {
            navigation.navigate('UserProfileStack', {screen: 'ChatList'});
            toggleOpened();
        });
    };

    const handlePressNotifications = () => {
        navigateToUserMITHubScreen(navigation, {index: 0});
        toggleOpened();
    };

    const handlePressCenterButton = () => {
        toggleOpened();
        console.log('handlePressCenterButton');
    };

    React.useEffect(() => {
        Animated.timing(animation, {
            toValue: opened ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [opened, animation]);

    const opacity = {
        opacity: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        }),
    };

    const arc = getHalfCircleOffsets(tablet);
    // [0]=left … [4]=right — arc slots: bell, calendar, shop; then chat-slot=Crusader, globe-slot=MIT chat
    const [bell, calendar, shopTop, chatSlot, globeSlot] = arc;
    const liftY = (y: number) => y + menuLiftAboveNav;

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Pressable onPressIn={handlePressCalendar}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, calendar.x],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, liftY(calendar.y)],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="calendar"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={iconSize}
                            style={styles.itemIcon}
                        />
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressShop}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, shopTop.x],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, liftY(shopTop.y)],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="store"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={iconSize}
                            style={styles.itemIcon}
                        />
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressWorld}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, chatSlot.x],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, liftY(chatSlot.y)],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="earth"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={iconSize}
                            style={styles.itemIcon}
                        />
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressMITChat}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, globeSlot.x],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, liftY(globeSlot.y)],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <View style={styles.hexBadgeWrap}>
                            <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                            <Icon
                                name="message-text"
                                type="material-community"
                                color={COLORS.WHITE}
                                size={iconSize}
                                style={styles.itemIcon}
                            />
                            {msgRcvdNotificationUnreadCount > 0 ? (
                                <View style={styles.notificationRedDot} />
                            ) : null}
                        </View>
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressNotifications}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, bell.x],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, liftY(bell.y)],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <View style={styles.hexBadgeWrap}>
                            <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                            <Image
                                source={imageindex.MITticket}
                                resizeMode="contain"
                                style={[styles.itemIcon, styles.mitTicketIcon, {width: iconSize, height: iconSize}]}
                            />
                            {mitNotificationUnreadCount > 0 ? <View style={styles.notificationRedDot} /> : null}
                        </View>
                    </Animated.View>
                </Pressable>
                <TouchableWithoutFeedback onPressIn={handlePressCenterButton}>
                    <Animated.View
                        style={[
                            {
                                zIndex: opened ? 0 : 1,
                                transform: [
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, centerLiftWhenOpen],
                                        }),
                                    },
                                    {
                                        rotate: shakeRotation.interpolate({
                                            inputRange: [-1, 0, 1],
                                            outputRange: ['-13deg', '0deg', '13deg'],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <View style={styles.centerHexWrap}>
                            {tablet ? <AkcruControlBtn width={90} height={90} /> : <AkcruControlBtn />}
                            {mitNotificationUnreadCount > 0 || msgRcvdNotificationUnreadCount > 0 ? (
                                <View style={styles.centerHexRedDot} />
                            ) : null}
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        overflow: 'visible',
    },
    box: {
        position: 'relative',
        width: 70,
        height: 60,
        marginTop: -3,
        overflow: 'visible',
    },
    item: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: isTablet() ? 75 : 60,
        height: isTablet() ? 75 : 60,
    },
    itemIcon: {
        marginBottom: 5,
    },
    mitTicketIcon: {
        marginBottom: 4,
    },
    hexBadgeWrap: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationRedDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E53935',
        borderWidth: 1.5,
        borderColor: COLORS.AKCRUBACKGROUND,
    },
    centerHexWrap: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerHexRedDot: {
        position: 'absolute',
        top: isTablet() ? 6 : 4,
        right: isTablet() ? 8 : 15,
        width: isTablet() ? 12 : 10,
        height: isTablet() ? 12 : 10,
        borderRadius: isTablet() ? 6 : 5,
        backgroundColor: '#E53935',
        borderWidth: 1.5,
        borderColor: COLORS.AKCRUBACKGROUND,
    },
});

export default AkcruCenterButton;
