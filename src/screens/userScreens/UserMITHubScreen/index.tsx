import {
    Text,
    View,
    ScrollView,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StyleProp,
    ViewStyle,
    TextStyle,
    PressableAndroidRippleConfig,
    useWindowDimensions,
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {Icon, color} from '@rneui/base';
import {Route, RouteProp, useFocusEffect} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import useAuthStore from '../../../stores/auth.store';

import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import MITReceived from '../UserMITHubTabs/MITReceived';
import MITSent from '../UserMITHubTabs/MITSent';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import {IChatUser} from '../../../../types';
import {getUsers} from '../../../lib/api/rooms.lib';
import {getMitTiers, MitTier, purchaseMIT} from '../../../lib/api/mit.lib';
import {isTablet} from '../../../../assets/constants/theme';
import {batchMarkNotificationsRead, getNotifyMePayload} from '../../../lib/api/notify.lib';
import {getUnreadMitNotificationIds} from '../../../util/notificationUnreadCount';
import {UseTabMenu} from '../../../context/TabContext';

type UserMITHubScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'UserMITHubScreen'>;

type UserMITHubScreenRouteProp = RouteProp<UserProfileStackParams, 'UserMITHubScreen'>;

type Props = {
    navigation: UserMITHubScreenNavigationProp;
    route: UserMITHubScreenRouteProp;
};

const FirstRoute = () => <MITReceived />;

const SecondRoute = () => <MITSent />;

const UserMITHubScreen = ({navigation, route}: Props) => {
    const {user, hydrateUser} = useAuthStore();
    const {syncNotificationBadgeCounts} = UseTabMenu();

    const [chatUsersData, setChatUsersData] = useState<IChatUser[]>([]);
    const [isListLoaded, setIsListLoaded] = useState(false);

    useEffect(() => {
        getTextMessage();
    }, []);

    const getTextMessage = async () => {
        const response = await getUsers();
        setChatUsersData(response!);
        setIsListLoaded(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            hydrateUser();
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                hydrateUser();
            };
        }, []),
    );

    /** When popping the hub (not when pushing e.g. ChooseMIT), mark MIT push notifications read so the hex dot clears. */
    useEffect(() => {
        const markMitNotificationsSeenOnLeave = () => {
            void (async () => {
                try {
                    const payload = await getNotifyMePayload();
                    const list = payload?.notifications ?? [];
                    const ids = getUnreadMitNotificationIds(list);
                    if (ids.length === 0) {
                        return;
                    }
                    const res = await batchMarkNotificationsRead(ids);
                    if (!res.success) {
                        return;
                    }
                    const fresh = await getNotifyMePayload();
                    syncNotificationBadgeCounts(fresh?.notifications);
                } catch {
                    // ignore
                }
            })();
        };
        const unsub = navigation.addListener('beforeRemove', markMitNotificationsSeenOnLeave);
        return unsub;
    }, [navigation, syncNotificationBadgeCounts]);

    // MIT purchase flow
    const [tiers, setTiers] = useState<MitTier[]>([]);
    const [tierModalVisible, setTierModalVis] = useState(false);
    const [confirmVisible, setConfirmVis] = useState(false);
    const [successVisible, setSuccessVis] = useState(false);
    const [selectedTier, setSelectedTier] = useState<MitTier | null>(null);

    // load MIT tiers on mount
    useEffect(() => {
        getMitTiers().then(setTiers);
    }, []);

    // tap “Buy Movie Invite Tickets”
    const onBuyPress = () => {
        if (tiers.length === 0) {
            return Alert.alert('No bundles available');
        }
        setSelectedTier(tiers[0]);
        setTierModalVis(true);
    };

    const onConfirmTier = () => {
        setTierModalVis(false);
        setConfirmVis(true);
    };

    const onPurchase = async () => {
        setConfirmVis(false);
        if (!selectedTier) {
            return;
        }
        const resp = await purchaseMIT(selectedTier.quantity);
        if (!resp.success) {
            return Alert.alert('Purchase failed', resp.message || '');
        }
        await hydrateUser();
        setSuccessVis(true);
        setTimeout(() => setSuccessVis(false), 2500);
    };

    const renderTabBar = (
        props: JSX.IntrinsicAttributes &
            SceneRendererProps & {
                navigationState: NavigationState<Route>;
                scrollEnabled?: boolean | undefined;
                bounces?: boolean | undefined;
                activeColor?: string | undefined;
                inactiveColor?: string | undefined;
                pressColor?: string | undefined;
                pressOpacity?: number | undefined;
                getLabelText?: ((scene: Scene<Route>) => string | undefined) | undefined;
                getAccessible?: ((scene: Scene<Route>) => boolean | undefined) | undefined;
                getAccessibilityLabel?: ((scene: Scene<Route>) => string | undefined) | undefined;
                getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined;
                renderLabel?:
                    | ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode)
                    | undefined;
                renderIcon?: ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode) | undefined;
                renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined;
                renderIndicator?: ((props: TabBarIndicatorProps<Route>) => React.ReactNode) | undefined;
                renderTabBarItem?:
                    | ((
                          props: TabBarItemProps<Route> & {key: string},
                      ) => React.ReactElement<any, string | React.JSXElementConstructor<any>>)
                    | undefined;
                onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined;
                onTabLongPress?: ((scene: Scene<Route>) => void) | undefined;
                tabStyle?: StyleProp<ViewStyle>;
                indicatorStyle?: StyleProp<ViewStyle>;
                indicatorContainerStyle?: StyleProp<ViewStyle>;
                labelStyle?: StyleProp<TextStyle>;
                contentContainerStyle?: StyleProp<ViewStyle>;
                style?: StyleProp<ViewStyle>;
                gap?: number | undefined;
                testID?: string | undefined;
                android_ripple?: PressableAndroidRippleConfig | undefined;
            },
    ) => (
        <TabBar
            {...props}
            indicatorStyle={{backgroundColor: COLORS.PURPLE}}
            scrollEnabled={false}
            tabStyle={{width: SIZES.ScreenWidth / 2}}
            labelStyle={{...FONTS.Title2, color: COLORS.LIGHTGREY}}
            style={{
                backgroundColor: COLORS.AKCRUBACKGROUND,
                justifyContent: 'space-between',
            }}
            contentContainerStyle={{
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
            }}
            activeColor={COLORS.PURPLE}
        />
    );

    const layout = useWindowDimensions();

    const [index, setIndex] = useState(route.params?.index || 0);
    const [routes] = useState([
        {key: 'first', title: `RECEIVED`},
        {key: 'second', title: `SENT`},
    ]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    const isIOS = Platform.OS === 'ios';
    const heroHeight = SIZES.ScreenHeight * (isIOS ? 0.3 : 0.25);
    const heroMargin = isIOS ? '-22%' : '-18%';

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View>
                        <Header />
                    </View>
                    <View style={{height: heroHeight, marginTop: heroMargin}}>
                        <LinearGradient
                            // Background Linear Gradient
                            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: heroHeight,
                            }}
                        />
                        <View style={styles.topcontainer}>
                            <BackButton navigation={navigation} />
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={styles.screenTitle}>Movie Invite Ticket Hub</Text>
                                    <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                                </View>
                                {isListLoaded ? (
                                    chatUsersData.length > 0 && (
                                        <View style={{marginRight: 20}}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    navigation.navigate('ChatList');
                                                }}>
                                                <Icon
                                                    name="chatbox-ellipses"
                                                    type="ionicon"
                                                    size={30}
                                                    color={COLORS.AKCRUBLUE}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                ) : (
                                    <View style={{marginRight: 20}}>
                                        <ActivityIndicator size="small" color={COLORS.CATPURPLGT} />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={{alignItems: 'center'}}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    navigation.navigate('UserSearchResultScreen');
                                }}>
                                <View style={styles.searchinput}>
                                    <Icon
                                        name="magnify"
                                        type="material-community"
                                        color={COLORS.AKCRUBLUE}
                                        size={25}
                                        style={{marginRight: 10}}
                                    />
                                    <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Find Users to Invite</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                    <View>
                        <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center'}}>
                            You have {user?.MITCount} Movie Invites Tickets left
                        </Text>
                        <TouchableOpacity
                            onPress={onBuyPress}
                            style={{alignItems: 'center', marginTop: 10, marginBottom: 10}}>
                            <View style={styles.MITbutton}>
                                <Image source={imageindex.MITticket} style={{marginRight: 10}} />
                                <Text style={styles.buttonText}>Get Movie Invite Tickets</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{flex: 1}}>
                            <TabView
                                navigationState={{index, routes}}
                                renderScene={renderScene}
                                onIndexChange={setIndex}
                                initialLayout={{width: layout.width}}
                                swipeEnabled={true}
                                renderTabBar={renderTabBar}
                            />
                        </View>
                        <View>
                            {index == 0 && <MITReceived />}
                            {index == 1 && (
                                <View>
                                    <MITSent />
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            {/* Tier Selection Modal */}
            <Modal transparent visible={tierModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginBottom: 12,
                            }}>
                            <Text style={{...FONTS.Title2}}>Select MIT bundle</Text>
                            <Image source={imageindex.MITticket} style={{marginLeft: 10}} />
                        </View>

                        {tiers.map(t => (
                            <TouchableOpacity
                                key={t.quantity}
                                style={[
                                    styles.optionRow,
                                    selectedTier?.quantity === t.quantity && styles.optionRowSelected,
                                ]}
                                onPress={() => setSelectedTier(t)}>
                                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={styles.optionText}>
                                        {t.quantity} MIT(s) for {t.cost} AD
                                    </Text>
                                    <Image
                                        source={imageindex.AkcruHexLogo}
                                        style={{
                                            width: isTablet() ? 28 : 21,
                                            height: isTablet() ? 28 : 21,
                                            marginLeft: 5,
                                        }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                onPress={() => setTierModalVis(false)}
                                style={[styles.modalBtn, styles.cancelBtn]}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onConfirmTier} style={[styles.modalBtn, styles.confirmBtn]}>
                                <Text style={styles.modalBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirm Purchase Modal */}
            <Modal transparent visible={confirmVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Purchase {selectedTier?.quantity} Ticket(s) for {selectedTier?.cost} AD?
                        </Text>
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                onPress={() => setConfirmVis(false)}
                                style={[styles.modalBtn, styles.cancelBtn]}>
                                <Text style={styles.modalBtnText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onPurchase} style={[styles.modalBtn, styles.confirmBtn]}>
                                <Text style={styles.modalBtnText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Overlay */}
            <Modal transparent visible={successVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🎉 Purchased!</Text>
                    </View>
                </View>
            </Modal>
        </TabContainer>
    );
};

export default UserMITHubScreen;
