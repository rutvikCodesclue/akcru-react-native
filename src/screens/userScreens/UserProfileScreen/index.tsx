import * as React from 'react';
import { navigate } from '../../../util/RootNavigation';

import { View, Text, TouchableOpacity, Image, SafeAreaView, Modal, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { UserProfileDetailsTab } from '../UserProfileTabs';
import { hubTabFromProfileRouteParams } from '../UserProfileHubTabScreen';
import { SIZES, COLORS, FONTS } from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../../components/header';
import imageindex from '../../../../assets/images/imageindex';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/auth.store';
import { formatNumber, selectAvatarBorderColor } from '../../../util/util';
import { ICruInvite, ICruView, IMITInvite, IUserProfile } from '../../../../types';
import { getMyMITInvites } from '../../../lib/api/mit.lib';
import { getCRUInvites, getMyCRUViews } from '../../../lib/api/cru.lib';
import { isAfter, isBefore } from 'date-fns';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import { getFollowers, upgradeCRUView } from '../../../lib/api/user.lib';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import ProfileUserBadges from '../../../components/ProfileUserBadges';
import ProfileAdWalletBar from '../../../components/ProfileAdWalletBar';
import { Icon } from '@rneui/base';
import { isTablet, MULTISIZES } from '../../../../assets/constants/theme';
import { newVisitUserProfile, newVisitUserProfileUpdate } from '../../../lib/api/userProfile.lib';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UserProfileScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'UserProfileScreen'>;

type UserProfileScreenRouteProp = RouteProp<UserProfileStackParams, 'UserProfileScreen'>;

type Props = {
    navigation: UserProfileScreenNavigationProp;
    route: UserProfileScreenRouteProp;
};

export default function UserProfileScreen({ navigation, route }: Props) {
    const insets = useSafeAreaInsets();
    const { user, hydrateUser, walletBalance } = useAuthStore();
    /** Wallet API (`/v1/wallet/me`) is hydrated with the user; prefer it over `user.adAmount` for the bar. */
    const profileWalletAdAmount = React.useMemo(() => {
        const parsed = parseFloat(walletBalance ?? '');
        if (Number.isFinite(parsed)) {
            return Math.max(0, Math.floor(parsed));
        }
        if (user?.adAmount != null && Number.isFinite(user.adAmount)) {
            return Math.max(0, Math.floor(user.adAmount));
        }
        return undefined;
    }, [walletBalance, user?.adAmount]);
    const [showMITEntryErr, setshowMITEntryErr] = useState(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [inviteCount, setInviteCount] = React.useState<number>(0);
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite)[]>([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [loadingUpgrade, setLoadingUpgrade] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [upgradeResult, setUpgradeResult] = useState<'success' | 'error' | null>(null);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            getRoomLimitRouteParam();

            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, []),
    );

    const getRoomLimitRouteParam = async () => {
        const isRoomTimeLimitCompleted = await AsyncStorage.getItem('isRoomTimeLimitCompleted');
        if (isRoomTimeLimitCompleted === 'true') {
            setshowMITEntryErr(true);
            AsyncStorage.removeItem('isRoomTimeLimitCompleted');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getMyMITInvites({ pending: true }).then(mitInvites => {
                if (mitInvites) {
                    const mitInviteCount = mitInvites.length;

                    setInvites(
                        mitInvites.sort((a, b) => {
                            if (a.createdAt < b.createdAt) {
                                return 1;
                            }
                            if (a.createdAt > b.createdAt) {
                                return -1;
                            }
                            return 0;
                        }),
                    );

                    setIsLoaded(true);

                    setInviteCount(mitInviteCount);
                } else {
                    setIsLoaded(true);
                    setInviteCount(0);
                }
            });

            return () => { };
        }, []),
    );

    React.useEffect(() => {
        setInviteCount(invites.length);
    }, [invites]);

    const [pendingCRUInviteCount, setPendingCRUInviteCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            getCRUInvites({ pending: true }).then(cruInvites => {
                if (cruInvites) {
                    const pendingCRUInvites = cruInvites.filter(
                        (invite: { status: string }) => invite.status !== 'ACCEPTED' && invite.status !== 'DECLINED',
                    );

                    setPendingCRUInviteCount(pendingCRUInvites.length);

                    setIsLoaded(true);
                }
            });

            return () => { };
        }, []),
    );

    const [eventCount, setEventCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            const fetchMyEvents = async () => {
                try {
                    const myCRUViews = await getMyCRUViews({ upcoming: true });
                    const myMITs = await getMyMITInvites({ accepted: true, me: true });

                    if (myCRUViews && myMITs) {
                        let events = [...myCRUViews, ...myMITs];

                        setEventCount(events.length);

                        setMyEvents(
                            events.sort((a, b) => {
                                let date1 = new Date(a.startDate);
                                let date2 = new Date(b.startDate);

                                if (isAfter(date1, date2)) {
                                    return 1;
                                }
                                if (isBefore(date1, date2)) {
                                    return -1;
                                }
                                return 0;
                            }),
                        );
                    }
                } catch (error) {
                    console.error('Error getting my Events:', error);
                }
            };
            fetchMyEvents();
        }, []),
    );

    const datesIndicatorCount = eventCount;
    const cruInvitesIndicatorCount = pendingCRUInviteCount;

    React.useLayoutEffect(() => {
        const hub = hubTabFromProfileRouteParams(route.params as Record<string, unknown> | undefined);
        if (!hub) {
            return;
        }
        navigation.navigate('UserProfileHubTabScreen', { hubTab: hub });
        navigation.setParams({ tabKey: 'first', index: undefined } as UserProfileScreenRouteProp['params']);
    }, [navigation, route.params]);

    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);
    const [skipped, setSkipped] = useState(false); // ⬅️ moved above returns
    const [firstTimeVisit, setFirstTimeVisit] = useState<any>(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                if (user?.id) {
                    try {
                        const result = await getFollowers(user.id);
                        if (result && result.followers && Array.isArray(result.followers)) {
                            setFollowersData(result.followers);
                        }
                    } catch (error) {
                        console.error('Error fetching followers:', error);
                    }
                }
            };

            fetchData();

            return () => { };
        }, [user?.id]),
    );

    const followersCount = formatNumber(followersData.length);

    useEffect(() => {
        const loadData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false); // Data has loaded, set loading to false
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        async function checkFirstTimeVisit() {
            try {
                const isNewVisit = await newVisitUserProfile();
                setFirstTimeVisit(!!isNewVisit);
            } catch {
                setFirstTimeVisit(false);
            }
        }
        checkFirstTimeVisit();
    }, []);

    const handleNewVisitVideoEnd = React.useCallback(async () => {
        try {
            const updateResponse = await newVisitUserProfileUpdate();
            if (updateResponse.success) setFirstTimeVisit(false);
        } catch { }
    }, []);

    const showSpinner = loading || firstTimeVisit === null;
    const showIntro = !showSpinner && firstTimeVisit && !skipped;

    if (showSpinner) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (showIntro) {
        return (
            <TabContainer>
                <SafeAreaView>
                    <Video
                        source={{ uri: 'https://d17ybuhl825fg.cloudfront.net/HelpVideo/Profile+Hub+Intro.mp4' }}
                        style={{ height: '100%', width: '100%' }}
                        paused={false}
                        repeat={false}
                        resizeMode="cover"
                        onEnd={handleNewVisitVideoEnd}
                    />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 30,
                            right: 20,
                            backgroundColor: '#ffffff',
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 20,
                        }}
                        onPress={() => {
                            setSkipped(true);
                            handleNewVisitVideoEnd();
                        }}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Skip</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </TabContainer>
        );
    }


    const handleUpgrade = async () => {
        try {
            setLoadingUpgrade(true);

            const res = await upgradeCRUView();

            if (res) {
                setUpgradeResult('success');
            } else {
                setUpgradeResult('error');
            }

            setShowUpgradeModal(false);
            setShowResultModal(true);
            hydrateUser();

            setTimeout(() => setShowResultModal(false), 2000);
        } catch (err) {
            setUpgradeResult('error');
            setShowUpgradeModal(false);
            setShowResultModal(true);
            setTimeout(() => setShowResultModal(false), 2000);
        } finally {
            setLoadingUpgrade(false);
        }
    };

    const avatarSize = MULTISIZES.Xlarge80;
    const profileHandleRaw = (user?.username ?? 'Guest').trim() || 'Guest';
    const profileHandleDisplay = profileHandleRaw.startsWith('@')
        ? profileHandleRaw
        : `@${profileHandleRaw}`;

    return (
        <TabContainer>
            <View style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View>
                        <View style={profileScreenStyles.profileTopSection}>
                            <View style={{ zIndex: 20 }}>
                                <Header />
                            </View>
                            <LinearGradient
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.BLACK]}
                                style={profileScreenStyles.profileTopGradient}
                            />
                            <View style={{ marginHorizontal: 15 }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ViewUserScreen', { userID: user?.id })}>
                                        <HexAvatar
                                            source={{ uri: user?.profilePicture }}
                                            size={avatarSize}
                                            bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                            rotateFrameDegrees={90}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ViewUserFollowList', {userID: user?.id, tabKey: 'first'})}
                                        style={{
                                            alignItems: 'center',
                                            paddingHorizontal: 4,
                                        }}>
                                        <Text style={{ ...FONTS.Title2, color: COLORS.AKCRUBLUE }}>{followersCount}</Text>
                                        <Text style={{ ...FONTS.Title2, color: COLORS.AKCRUBLUE }}>Followers</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setProfileMenuVisible(true)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        accessibilityLabel="Open profile actions menu"
                                        style={{
                                            width: isTablet() ? 44 : 36,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <CustomIcon
                                            name="ellipsis-vertical"
                                            type="ionicon"
                                            color={COLORS.AKCRUBLUE}
                                            baseSize={isTablet() ? 22 : 18}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={{
                                        marginTop: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        justifyContent: 'flex-start',
                                        alignSelf: 'stretch',
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.Title1,
                                            flexShrink: 1,
                                            minWidth: 0,
                                            marginRight: 6,
                                            textAlign: 'left',
                                        }}
                                        numberOfLines={1}
                                        ellipsizeMode="tail">
                                        {profileHandleDisplay}
                                    </Text>
                                    <ProfileUserBadges user={user} variant="inline" style={{ flexShrink: 0 }} />
                                </View>
                            </View>
                            {/* User description (bio)
                            <View style={{marginTop: '3%', marginHorizontal: 15}}>
                                <Text
                                    style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}
                                    numberOfLines={2}
                                    ellipsizeMode="tail">
                                    {user?.description ??
                                        (user
                                            ? 'Click Edit Profile to add a description'
                                            : 'Create an account and get started today')}
                                </Text>
                            </View>
                            */}
                            <View style={profileScreenStyles.adWalletSection}>
                                <View style={profileScreenStyles.adWalletBarWrap}>
                                    <ProfileAdWalletBar
                                        adAmount={profileWalletAdAmount}
                                        onPressPurchase={() =>
                                            navigate('NoBottomStack', {
                                                screen: 'PurchaseAdScreen',
                                            })
                                        }
                                    />
                                </View>
                                <View style={profileScreenStyles.editProfileGlow}>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => navigate('NoBottomStack', { screen: 'EditProfile' })}
                                        accessibilityRole="button"
                                        accessibilityLabel="Edit profile"
                                        style={profileScreenStyles.editProfileTouchable}>
                                        <LinearGradient
                                            colors={['#172554', '#3730a3', '#7c3aed', '#c026d3']}
                                            start={{ x: 0, y: 0.5 }}
                                            end={{ x: 1, y: 0.5 }}
                                            style={profileScreenStyles.editProfileGradient}>
                                            <Icon
                                                name="brush-outline"
                                                type="ionicon"
                                                color="#c4b5fd"
                                                size={isTablet() ? 22 : 19}
                                                style={profileScreenStyles.editProfileIcon}
                                            />
                                            <Text style={profileScreenStyles.editProfileLabel}>Edit Profile</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 4 }} />
                    <View style={{ flex: 1, minHeight: 0 }}>
                        <UserProfileDetailsTab hideProfileDetailsSection hideCruAffiliationsSection />
                    </View>
                </SafeAreaView>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={profileMenuVisible}
                    onRequestClose={() => setProfileMenuVisible(false)}>
                    <View style={{ flex: 1 }}>
                        <Pressable
                            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.45)' }]}
                            onPress={() => setProfileMenuVisible(false)}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                top: insets.top + 52,
                                right: 12,
                                backgroundColor: COLORS.BLACK,
                                borderRadius: 12,
                                paddingVertical: 6,
                                minWidth: 216,
                                borderWidth: 1,
                                borderColor: COLORS.LIGHTGREY,
                            }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                }}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigate('NoBottomStack', {
                                        screen: 'UserMITHubScreen',
                                        params: { index: 0 },
                                    });
                                }}>
                                <View style={{ position: 'relative' }}>
                                    <Image
                                        source={imageindex.LrgMIT}
                                        style={{ width: isTablet() ? 56 : 44, height: isTablet() ? 28 : 22 }}
                                        resizeMode="contain"
                                    />
                                    <View
                                        style={{
                                            position: 'absolute',
                                            right: -6,
                                            top: -6,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: COLORS.PURPLE,
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
                                        }}>
                                        <Text style={{ ...FONTS.Title2, color: COLORS.WHITE, fontSize: 11 }}>
                                            {inviteCount}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={{ ...FONTS.Title2, color: COLORS.WHITE, marginLeft: 10 }}>MIT Hub</Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            {/*
                            <TouchableOpacity
                                style={{paddingHorizontal: 14, paddingVertical: 12}}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigate('NoBottomStack', {screen: 'EditProfile'});
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.PINK}}>Edit Profile</Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{paddingHorizontal: 14, paddingVertical: 12}}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigation.navigate('UserMatchModesScreen');
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>Match modes</Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{paddingHorizontal: 14, paddingVertical: 12}}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigate('OnboardArchetypeStandalone', {
                                        fromOnboardArchetypeStandalone: true,
                                    });
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.PURPLE}}>Archetype Standalone</Text>
                            </TouchableOpacity>
                            */}
                            {/*
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    marginTop: 4,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                }}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigation.navigate('UserProfileHubTabScreen', {hubTab: 'details'});
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.WHITE}}>Details</Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                }}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigation.navigate('UserProfileHubTabScreen', {hubTab: 'dates'});
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.WHITE}}>Dates</Text>
                                {datesIndicatorCount > 0 ? (
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: COLORS.AKCRUBLUE,
                                        }}
                                    />
                                ) : null}
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                }}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigation.navigate('UserProfileHubTabScreen', {hubTab: 'cru'});
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.WHITE}}>Cru Inv</Text>
                                {cruInvitesIndicatorCount > 0 ? (
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: COLORS.AKCRUBLUE,
                                        }}
                                    />
                                ) : null}
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{paddingHorizontal: 14, paddingVertical: 12}}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigation.navigate('UserProfileHubTabScreen', {hubTab: 'wallet'});
                                }}>
                                <Text style={{...FONTS.Title2, color: COLORS.WHITE}}>Wallet</Text>
                            </TouchableOpacity>
                            */}
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{ paddingHorizontal: 14, paddingVertical: 12 }}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    navigate('NoBottomStack', { screen: 'CruSoloTabsScreen' });
                                }}>
                                <Text style={{ ...FONTS.Title2, color: COLORS.WHITE }}>Crummunity + Solo</Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: StyleSheet.hairlineWidth,
                                    backgroundColor: COLORS.LIGHTGREY,
                                    marginHorizontal: 10,
                                    opacity: 0.35,
                                }}
                            />
                            <TouchableOpacity
                                style={{ paddingHorizontal: 14, paddingVertical: 12 }}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    if (user?.id) {
                                        navigation.navigate('ViewUserScreen', { userID: user.id, tabKey: 'second' });
                                    }
                                }}>
                                <Text style={{ ...FONTS.Title2, color: COLORS.WHITE }}>My activity</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal animationType="fade" transparent={true} visible={showMITEntryErr}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                backgroundColor: COLORS.BLACK,
                                padding: 20,
                                borderRadius: 10,
                                alignItems: 'center',
                                marginHorizontal: 15,
                            }}>
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    marginBottom: 10,
                                    textAlign: 'center',
                                }}>
                                {'Your party room time limit is over, I hope you enjoy your movie.'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setshowMITEntryErr(false);
                                }}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        marginBottom: 10,
                                        textAlign: 'center',
                                        color: COLORS.MIDORANGE,
                                    }}>
                                    {'Close'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Upgrade Confirmation Modal */}
                <Modal animationType="fade" transparent={true} visible={showUpgradeModal}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                backgroundColor: COLORS.BLACK,
                                padding: 20,
                                borderRadius: 10,
                                alignItems: 'center',
                                marginHorizontal: 15,
                            }}>
                            <Text style={{ ...FONTS.Title3, marginBottom: 20, textAlign: 'center' }}>
                                {'Upgrade your audio CRU view to '}
                                <Text style={{ color: COLORS.AKCRUBLUE }}>{'video'}</Text>
                                {' for 100 '}
                                <Image
                                    source={imageindex.AkcruHexLogo}
                                    style={{
                                        width: FONTS.Title3.fontSize,
                                        height: FONTS.Title3.fontSize,
                                        marginBottom: -3,
                                    }}
                                    resizeMode="contain"
                                />
                                {'? (This action is irreversible)'}
                            </Text>

                            {/* Buttons Row */}
                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                <TouchableOpacity onPress={() => setShowUpgradeModal(false)} disabled={loadingUpgrade}>
                                    <Text style={{ ...FONTS.Title2, color: COLORS.LIGHTGREY }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleUpgrade} disabled={loadingUpgrade}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            color: loadingUpgrade ? COLORS.MIDORANGE : COLORS.GREEN,
                                        }}>
                                        {loadingUpgrade ? 'Loading...' : 'Confirm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Upgrade Result Modal */}
                <Modal animationType="fade" transparent={true} visible={showResultModal}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                backgroundColor: COLORS.BLACK,
                                padding: 20,
                                borderRadius: 10,
                                alignItems: 'center',
                                marginHorizontal: 15,
                            }}>
                            <Text style={{ ...FONTS.Title3, marginBottom: 10, textAlign: 'center' }}>
                                {upgradeResult === 'success'
                                    ? 'Upgrade successful!'
                                    : 'Upgrade failed. Please try again.'}
                            </Text>
                        </View>
                    </View>
                </Modal>
            </View>
        </TabContainer>
    );
}

const profileScreenStyles = StyleSheet.create({
    profileTopSection: {
        minHeight: SIZES.ScreenHeight / 3.02,
        paddingBottom: 3,
    },
    profileTopGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    adWalletSection: {
        marginTop: '3%',
        marginHorizontal: 15,
        alignItems: 'center',
        marginBottom: 8,
    },
    adWalletBarWrap: {
        width: '100%',
        alignSelf: 'stretch',
    },
    editProfileGlow: {
        marginTop: 10,
        marginBottom: 6,
        alignSelf: 'center',
        width: '64%',
        maxWidth: 320,
        borderRadius: 14,
    },
    editProfileTouchable: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    editProfileGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 18,
    },
    editProfileIcon: {
        marginRight: 10,
    },
    editProfileLabel: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
});
