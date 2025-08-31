import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Modal,
    Pressable,
} from 'react-native';
import styles from './styles';
import React, {useEffect, useRef, useState} from 'react';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/index';
import {Icon} from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import {findAUser} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import {selectAvatarBorderColor} from '../../../util/util';
import imageindex from '../../../../assets/images/imageindex';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import BackButton from '../../../components/General/backbutton';

import {getUserWallet} from '../../../lib/api/wallet.lib';
import useAuthStore from '../../../stores/auth.store';
import {useIsFocused} from '@react-navigation/native';
import {queueApiCall} from '../../../util/apiQueue';

type ViewUserDetailScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'ViewUserDetailScreen'>;

type ViewUserDetailScreenRouteProp = RouteProp<UserProfileStackParams, 'ViewUserDetailScreen'>;

type Props = {
    navigation: ViewUserDetailScreenNavigationProp;
    route: ViewUserDetailScreenRouteProp;
};

const ViewUserDetailScreen = ({route, navigation}: Props) => {
    const userID: string | undefined = route.params?.userID ?? null;
    const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

    const isFocused = useIsFocused();
    const [balance, setBalance] = useState<number>(0);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Sequential API loading to prevent multiple 401s
    const loadUserData = async () => {
        if (isLoadingData) return; // Prevent multiple simultaneous loads
        
        setIsLoadingData(true);
        try {
            // Queue API calls to execute sequentially
            const userData = await queueApiCall(() => findAUser({id: userID}));
            
            if (userData) {
                if (userData.gallery && userData.gallery.length > 6) {
                    userData.gallery = userData.gallery.slice(0, 6);
                }
                setUser(userData);

                // Only load wallet if user data was successful
                try {
                    const walletBalance = await queueApiCall(() => getUserWallet());
                    const balanceNumber = walletBalance != null ? Number(walletBalance) : 0;
                    setBalance(balanceNumber);
                } catch (walletError) {
                    console.error('Failed to load wallet balance:', walletError);
                    // Don't set balance on error, keep previous value
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const toggleAvatarModal = () => {
        setAvatarModalVisible(!isAvatarModalVisible);
    };

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        loadUserData();
    }, [isFocused]);

    useFocusEffect(
        React.useCallback(() => {
            loadUserData();
            return () => {};
        }, [userID]),
    );

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);

    const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
    const selectedPhotoAnimatedOpacity = useRef(new Animated.Value(0)).current;

    const openPhoto = (photoUri: string) => {
        setSelectedPhotoUri(photoUri);
        Animated.timing(selectedPhotoAnimatedOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closePhoto = () => {
        Animated.timing(selectedPhotoAnimatedOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedPhotoUri(null));
    };

    return (
        <TabContainer>
            <View>
                <ScrollView>
                    <View>
                        <ImageBackground
                            source={{uri: undefined}}
                            resizeMode="cover"
                            style={{height: SIZES.ScreenHeight / 5}}>
                            <LinearGradient
                                colors={['transparent', 'transparent', COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight / 5,
                                }}
                            />
                            <Header />
                            <BackButton navigation={navigation} />
                        </ImageBackground>
                        <Pressable style={{alignItems: 'center', marginTop: -50}} onPress={toggleAvatarModal}>
                            <HexAvatar
                                source={{uri: user?.profilePicture}}
                                size={260}
                                bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                            />
                        </Pressable>

                        <Modal visible={isAvatarModalVisible} animationType="fade" transparent={true}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                }}>
                                <Image
                                    source={
                                        user?.profilePicture ? {uri: user?.profilePicture} : imageindex.Akcruplaceholder
                                    }
                                    style={{width: '95%', height: '95%'}}
                                    resizeMode="contain"
                                />
                                <TouchableOpacity onPress={toggleAvatarModal}>
                                    <Text style={{color: COLORS.MIDORANGE, fontSize: 14, marginTop: 20}}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            {user?.badge === 'AKCRUIT' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeAkcruit />
                                </View>
                            )}
                            {user?.badge === 'GUARDIAN' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeGuardian />
                                </View>
                            )}
                            {user?.badge === 'HERO' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeHero />
                                </View>
                            )}
                            {user?.badge === 'SUPERHERO' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeSuperHero />
                                </View>
                            )}
                        </View>
                        <View style={{marginHorizontal: 15, marginVertical: 10}}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Name: </Text>
                                <Text style={{...FONTS.Title2}}>{user?.username}</Text>
                            </View>
                            <View style={{flexDirection: 'row', marginVertical: 5}}>
                                <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Akcru Dollars Earned: </Text>
                                <Text style={{...FONTS.Title2}}>{balance}</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>CRU Name: </Text>
                                <Text style={{...FONTS.Title2}}>{user?.Cru?.name}</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: 10,
                            }}>
                            <Text style={{...FONTS.Title3}}>Gallery</Text>
                            <Icon
                                name="images"
                                type="ionicon"
                                color={COLORS.LIGHTGREY}
                                size={20}
                                style={{marginLeft: 5}}
                            />
                        </View>
                        <View style={styles.gallerycontainer}>
                            <View style={styles.galleryImagesContainer}>
                                {user?.gallery &&
                                    user.gallery.map((imageUri, index) => {
                                        return (
                                            <TouchableOpacity
                                                key={index.toString()}
                                                onPress={() => openPhoto(imageUri)}
                                                activeOpacity={0.8}>
                                                <Image source={{uri: imageUri}} style={styles.galleryImage} />
                                            </TouchableOpacity>
                                        );
                                    })}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                {selectedPhotoUri && (
                    <TouchableOpacity style={styles.selectedPhotoContainer} onPress={closePhoto} activeOpacity={1}>
                        <Animated.Image
                            source={{uri: selectedPhotoUri}}
                            resizeMode="contain"
                            style={[styles.selectedPhoto, {opacity: selectedPhotoAnimatedOpacity}]}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </TabContainer>
    );
};

export default ViewUserDetailScreen;
