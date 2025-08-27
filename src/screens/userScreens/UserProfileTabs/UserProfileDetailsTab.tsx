import {View, Text, Image, TouchableOpacity, ScrollView, Modal, FlatList, Pressable, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import useAuthStore from '../../../stores/auth.store';
import {ICru, IMovie, IUserProfile} from '../../../../types';

import {getWatchlist} from '../../../lib/api/movies.lib';
import CruMemberPic from '../../../components/CruMemberPic';
import {getMyCRU, removeAUserFromCRU} from '../../../lib/api/cru.lib';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {supabase} from '../../../../lib/supabase';
import {
    deleteUserGalleryImage,
    updateUserGallery,
    fetchUserGallery,
    getGalleryLikeCount,
    getGalleryLikesList,
} from '../../../lib/api/user.lib';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';
import WatchListCategory from '../../../components/WatchlistCategory';
import AkcruButtons from '../../../components/akcruButtons';
import {listCrusForUser} from '../../../lib/api/cru.lib';
import {UseTabMenu} from '../../../context/TabContext';
import ConfirmationModal from '../../../components/ConfirmationModal';
import CruResultModal from '../../../components/CruResultModal/CruResultModal';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import HexAvatar from '../../../components/HexAvatar';
import {selectAvatarBorderColor} from '../../../util/util';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../../util/playMessageSound';
import {getUnread} from '../../../lib/api/rooms.lib';
import {Image as CompressorImage} from 'react-native-compressor';
import PurchasedContent from '../../../components/PurchasedContent';
import {isTablet} from '../../../../assets/constants/theme';

const UserProfileDetailsTab = () => {
    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);

    const [crus, setCrus] = useState<ICru[]>([]);
    const [membercruIds, setMemberCruIds] = useState<string[]>([]);
    const [unreadcruIds, setUnreadCruIds] = useState<string[]>([]);


    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, []),
    );

    const [CRU, setCRU] = useState<ICru | undefined>(undefined);
    const [members, setMembers] = useState<IUserProfile[] | []>([]);
    const cruMembers = (): IUserProfile[] | [] => {
        return members;
    };

    useEffect(() => {}, [unreadcruIds]);
    useEffect(() => {
        if (!membercruIds?.length) return;

        getUnread(membercruIds)
            .then(res => {
                if (res && typeof res === 'object' && 'success' in res && res.success && res.unread != null) {
                    setUnreadCruIds(res.unread);
                }
            })
            .catch(e => {
                console.warn('getUnread failed', e);
            });
    }, [membercruIds]);

    useFocusEffect(
        React.useCallback(() => {
            const channelA = supabase.channel('parent-cru-chat');
            channelA
                .on('broadcast', {event: 'parent-cru-chat'}, payload => messageReceived(payload))
                .subscribe(status => {
                    if (status === 'SUBSCRIBED') {
                        setChannel(channelA);
                    }
                });

            return () => {
                channelA.unsubscribe();
                setChannel(null);
            };
        }, []),
    );

    function messageReceived(payload: any) {
        if (user == null) {
            return;
        }
        if (payload.payload.senderId === user.id) {
            return;
        }

        const cruId = payload.payload.cruId;

        console.log('membercruIds', crus, payload.payload.cruId);
        const cruids = crus.map(cru => cru.id);
        if (CRU) {
            cruids.push(CRU.id);
        }
        console.log('Cruids', cruids, unreadcruIds);

        setUnreadCruIds(prevUnreadCruIds => {
            if (!prevUnreadCruIds.includes(cruId)) {
                const updatedUnreadCruIds = [...prevUnreadCruIds, cruId];
                console.log('RECEIVED MESSAGE Parent', payload, updatedUnreadCruIds);
                playMessageSound();
                return updatedUnreadCruIds;
            }
            return prevUnreadCruIds;
        });
    }

    const [watchlist, setWatchlist] = useState<IMovie[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchWatchlist = async () => {
                try {
                    const watchlistMovies = await getWatchlist(user?.id);
                    setWatchlist(watchlistMovies);
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                }
            };

            fetchWatchlist();
        }, []),
    );

    const updateWatchlist = (updatedWatchlist: IMovie[]) => {
        console.log('updatedWatchlist', updatedWatchlist);
        setWatchlist(updatedWatchlist);
    };

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
    const [showImageCountErrorModal, setShowImageCountErrorModal] = useState(false);

    const [userPics, setUserPics] = useState<string[]>(user?.gallery || []);

    useEffect(() => {
        // only run once we actually have a user object
        if (!user) {
            return;
        }

        // if they already have a non-empty gallery array, use it
        if (user.gallery && user.gallery.length > 0) {
            setUserPics(user.gallery);
            return;
        }

        // otherwise fetch from Supabase by passing the whole user
        fetchUserGallery(user)
            .then(galleryData => {
                setUserPics(galleryData);
            })
            .catch(console.error);
    }, [user]);

    const [likesData, setLikesData] = useState<Record<string, {count: number; likeExists: boolean}>>({});

    useEffect(() => {
        async function loadLikes() {
            const newData: typeof likesData = {};
            await Promise.all(
                userPics.map(async url => {
                    const res = await getGalleryLikeCount(url);
                    if (res?.success) {
                        newData[url] = {
                            count: res.count,
                            likeExists: !!res.likeExists,
                        };
                    }
                }),
            );
            setLikesData(newData);
        }
        if (userPics.length) {
            loadLikes();
        }
    }, [userPics]);

    const compressImage = async image => {
        const compressedImagePath = await CompressorImage.compress(image, {
            compressionMethod: 'auto',
        });

        return compressedImagePath;
    };

    const selectGalleryImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 6 - userPics.length,
        };

        let callbackExecuted = false;

        launchImageLibrary(options, async response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;

                let uploadedImages = [];

                const maxSizeInBytes = 10 * 1024 * 1024;

                for (const asset of response.assets) {
                    const selectedImage = asset.uri;
                    const imageType = asset.type;
                    const imageName = asset.fileName;
                    const compressedImage = await compressImage(selectedImage);

                    if (asset.fileSize > maxSizeInBytes) {
                        setShowSizeErrorModal(true);
                        return;
                    } else {
                        if (compressedImage) {
                            try {
                                const updatedUser = await updateUserGallery({
                                    uri: compressedImage,
                                    type: imageType,
                                    name: imageName,
                                });

                                if (updatedUser) {
                                    uploadedImages = updatedUser.gallery;
                                } else {
                                }
                            } catch (error) {
                                console.error('Error updating gallery:', error);
                            }
                        }
                    }
                }

                if (uploadedImages.length > 0) {
                    setUserPics(uploadedImages);
                }
            }
        });
    };

    const removeFromGallery = async (image: string) => {
        try {
            const updatedUser = await deleteUserGalleryImage(image);
            if (updatedUser) {
                const filteredImages = userPics.filter(url => url !== image);
                setUserPics(filteredImages);
            } else {
            }
        } catch (error) {
            console.error('Error removing image from gallery:', error);
        }
    };

    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageEnlarge = imageUri => {
        setSelectedImage(imageUri);
        setEnlargeModalVisible(true);
    };

    const [enlargeModalVisible, setEnlargeModalVisible] = useState(false);

    const toggleEnlargeModal = () => {
        setEnlargeModalVisible(!enlargeModalVisible);
    };

    const {refetchCrus, setRefetchCrus} = UseTabMenu();

    useFocusEffect(
        React.useCallback(() => {
            const fetchCrus = async () => {
                if (user?.id) {
                    try {
                        const fetchedCrus = await listCrusForUser(user.id);
                        if (fetchedCrus) {
                            setCrus(fetchedCrus);
                            const ids = fetchedCrus.map(cru => cru.id);
                            const mycru = await getMyCRU();
                            setCRU(mycru?.CRU);
                            ids.push(mycru?.CRU.id);
                            if (mycru?.CRU.members) {
                                setMembers(mycru.CRU.members);
                            }
                            setMemberCruIds(ids);
                        } else {
                            Alert.alert('Error', "Could not fetch the user's Cru details.");
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            };

            fetchCrus();
            if (refetchCrus) {
                setRefetchCrus(false);
            }
        }, [user?.id, refetchCrus, setRefetchCrus]),
    );

    const [confirmationModal, setConfirmationModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [cruResultModal, setCruResultModal] = useState(false);

    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [cruResultModalVisible, setCruResultModalVisible] = useState(false);

    const [currentCruId, setCurrentCruId] = useState(null);

    const [cruResultMessage, setCruResultMessage] = useState('');
    const [cruResultType, setCruResultType] = useState('');
    const [cruIconName, setCruIconName] = useState('');
    const [cruIconColor, setCruIconColor] = useState('');

    const handleLeaveCRU = (cruId: string) => {
        setCurrentCruId(cruId);
        setConfirmationModal(true);
    };

    const confirmLeaveCRU = async () => {
        setConfirmationModal(false);
        setIsLeaving(true);
        try {
            const response = await removeAUserFromCRU(user?.id, currentCruId);
            if (response) {
                setCrus(prevCrus => prevCrus.filter(cru => cru.id !== currentCruId));
                setMemberCruIds(prevCrus => prevCrus.filter(cruId => cruId !== currentCruId));
                setUnreadCruIds(prevCrus => prevCrus.filter(cruId => cruId !== currentCruId));
                setCruResultModal(true);
                setCruResultMessage('Successfully left the CRU.');
                setCruResultType('Success');
                setCruIconName('md-checkmark-circle');
                setCruIconColor(COLORS.AKCRUBLUE);
            } else {
                setCruResultModal(true);
                setCruResultMessage('Unable to leave CRU. Please try again later.');
                setCruResultType('Fail');
                setCruIconName('md-alert-circle');
                setCruIconColor('red');
            }
        } catch (error) {
            console.error('Error leaving CRU:', error);
            setCruResultModal(true);
            setCruResultMessage('An error occurred while trying to leave the CRU.');
            setCruResultType('Error');
            setCruIconName('md-error');
            setCruIconColor('red');
        } finally {
            setCruResultModal(true);
            setIsLeaving(false);
            setCruResultModalVisible(true);
        }
    };

    const [likesListModalVisible, setLikesListModalVisible] = useState(false);
    const [likesList, setLikesList] = useState<{id: string; username: string; avatarUrl: string}[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleShowLikes = async (photoUrl: string) => {
        try {
            const res = await getGalleryLikesList(photoUrl);
            if (res?.success) {
                setLikesList(res.users);
                setSelectedPhoto(photoUrl);
                setLikesListModalVisible(true);
            }
        } catch (err) {
            console.error('Failed to load likes list', err);
        }
    };

    return (
        <View>
            <View style={{marginHorizontal: SIZES.marginhorizontal}}>
                <View style={styles.gallerycontainer}>
                    <FlatList
                        data={userPics}
                        numColumns={3}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => (
                            <View>
                                <Pressable onPress={() => handleImageEnlarge(item)}>
                                    <Image source={{uri: item}} style={styles.galleryImage} />
                                </Pressable>
                                {/* only render once we've loaded likes for this URL */}
                                {likesData[item] && (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => handleShowLikes(item)}
                                        style={{
                                            position: 'absolute',
                                            bottom: 6,
                                            right: 6,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            borderRadius: 12,
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                        }}>
                                        <View>
                                            <Icon
                                                name="happy-outline"
                                                type="ionicon"
                                                size={isTablet() ? 40 : 20}
                                                color={COLORS.PINK}
                                            />
                                        </View>
                                        <Text style={{marginLeft: 4, ...FONTS.paragraph2}}>
                                            {likesData[item].count}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        ListHeaderComponent={
                            <View>
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            marginTop: 10,
                                            marginBottom: 20,
                                            textAlign: 'center',

                                            textDecorationLine: 'underline',
                                        }}>
                                        PROFILE DETAILS
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        alignSelf: 'center',
                                        alignItems: 'center',
                                        width: '95%',
                                    }}>
                                    <View style={{alignContent: 'center', width: SIZES.ScreenWidth * 0.5}}>
                                        <View>
                                            <FlatList
                                                data={cruMembers()}
                                                horizontal={true}
                                                showsHorizontalScrollIndicator={false}
                                                scrollEnabled={false}
                                                keyExtractor={item => item.id}
                                                renderItem={({item, index}) => (
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            navigation.navigate('ViewUserScreen', {userID: item.id})
                                                        }>
                                                        <View
                                                            style={{
                                                                marginRight: index < cruMembers().length - 1 ? -16 : 0,
                                                            }}>
                                                            <CruMemberPic
                                                                userPicture={item.profilePicture}
                                                                akcruBadge={item.badge}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('EditCru')}
                                            style={{marginVertical: 15}}>
                                            <View style={{flexDirection: 'row'}}>
                                                <Icon
                                                    name="square-edit-outline"
                                                    type="material-community"
                                                    color={COLORS.PINK}
                                                    size={20}
                                                    style={{marginRight: 5}}
                                                />
                                                <Text
                                                    style={{
                                                        ...FONTS.Title2,
                                                        color: COLORS.PINK,
                                                    }}>
                                                    Edit your CRU
                                                </Text>
                                            </View>
                                        </TouchableOpacity>

                                        <View>
                                            {CRU && unreadcruIds && unreadcruIds.includes(CRU.id) && (
                                                <View
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: COLORS.PINK,
                                                        position: 'absolute',
                                                        zIndex: 100,
                                                        left: '63%',
                                                        top: -3,
                                                    }}
                                                />
                                            )}

                                            <AkcruButtons.SmallButton
                                                disabled={false}
                                                color={COLORS.PURPLE}
                                                btnname="CRU Chat"
                                                onPress={() => {
                                                    const updatedCruids = unreadcruIds.filter(id => id !== CRU.id);
                                                    setUnreadCruIds(updatedCruids);
                                                    navigation.navigate('ViewGroupChat', {
                                                        isMyCruChat: true,
                                                    });
                                                }}
                                            />
                                        </View>
                                    </View>
                                    <View style={{alignItems: 'center', width: SIZES.ScreenWidth * 0.35}}>
                                        <View>
                                            <Text
                                                style={{
                                                    ...FONTS.paragraph1,
                                                    textAlign: 'center',

                                                    color: COLORS.LIGHTGREY,
                                                }}>
                                                Schedule a CRU View through the CRU VIEW scheduler
                                            </Text>
                                        </View>
                                        <View style={{marginTop: 10}}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('CruViewSearchMovieScreen')}>
                                                <Icon
                                                    name="calendar-sharp"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    size={75}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={{marginTop: 10}}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            marginTop: 10,
                                            marginBottom: 15,
                                            textAlign: 'center',

                                            textDecorationLine: 'underline',
                                        }}>
                                        CRU AFFILIATIONS
                                    </Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <FlatList
                                        data={crus}
                                        keyExtractor={item => item.id}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={({item}) => {
                                            const isCurrentUserAMember =
                                                item.members?.some(member => member.id === user?.id) ||
                                                item.creator.id === user?.id;

                                            return (
                                                <View
                                                    style={{
                                                        backgroundColor: COLORS.CATPURPDRK,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                        padding: 15,
                                                        marginBottom: 15,
                                                        marginHorizontal: 10,
                                                        width: isTablet()
                                                            ? SIZES.ScreenWidth * 0.65
                                                            : SIZES.ScreenWidth * 0.75,
                                                    }}>
                                                    <LinearGradient
                                                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                                        style={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            right: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            borderRadius: 5,
                                                        }}
                                                    />
                                                    <TouchableOpacity
                                                        style={{position: 'absolute', left: '8%', top: '5%'}}
                                                        onPress={() => {
                                                            {
                                                                const updatedCruids = unreadcruIds.filter(
                                                                    id => id !== item.id,
                                                                );
                                                                setUnreadCruIds(updatedCruids);
                                                                navigation.navigate('ViewGroupChat', {
                                                                    isMyCruChat: false,
                                                                    cru: item,
                                                                });
                                                            }
                                                        }}>
                                                        <View>
                                                            {unreadcruIds && unreadcruIds.includes(item.id) && (
                                                                <View
                                                                    style={{
                                                                        width: 10,
                                                                        height: 10,
                                                                        borderRadius: 5,
                                                                        backgroundColor: COLORS.CATREDLGT,
                                                                        position: 'absolute',
                                                                        zIndex: 100,
                                                                        right: 0,
                                                                    }}
                                                                />
                                                            )}
                                                        </View>
                                                        <CustomIcon
                                                            name="chatbox-ellipses"
                                                            type="ionicon"
                                                            color={COLORS.PURPLE}
                                                            baseSize={isTablet() ? 35 : 22}
                                                            style={{margin: 0}}
                                                        />
                                                    </TouchableOpacity>
                                                    <Text style={{...FONTS.Title2, paddingBottom: 10}}>
                                                        {item.name}
                                                    </Text>

                                                    <TouchableOpacity
                                                        style={{alignItems: 'center', paddingBottom: 10}}
                                                        onPress={() => {
                                                            navigation.navigate('ViewUserScreen', {
                                                                userID: item.creator.id,
                                                            });
                                                        }}>
                                                        <HexAvatar
                                                            source={{uri: item.creator.profilePicture}}
                                                            size={isTablet() ? 120 : 70}
                                                            bordercolor={selectAvatarBorderColor(
                                                                item.creator.badge ?? 'AKCRUIT',
                                                            )}
                                                        />
                                                        <Text style={{...FONTS.paragraph1, textAlign: 'center'}}>
                                                            Cru Leader
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '100%',
                                                        }}>
                                                        <ScrollView
                                                            horizontal={true}
                                                            showsHorizontalScrollIndicator={false}
                                                            contentContainerStyle={{
                                                                flexGrow: 1,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}>
                                                            {item.members?.map(member => (
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        navigation.navigate('ViewUserScreen', {
                                                                            userID: member.id,
                                                                        })
                                                                    }
                                                                    key={member.id}>
                                                                    <CruMemberPic
                                                                        userPicture={member.profilePicture}
                                                                        akcruBadge={member.badge}
                                                                    />
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    </View>
                                                    <Text
                                                        style={{
                                                            ...FONTS.paragraph1,
                                                            textAlign: 'center',
                                                            paddingBottom: 15,
                                                        }}>
                                                        {'Member(s)'}
                                                    </Text>
                                                    {isCurrentUserAMember && (
                                                        <AkcruButtons.SmallButton
                                                            btnname="Leave CRU"
                                                            onPress={() => handleLeaveCRU(item.id)}
                                                            disabled={false}
                                                            color={COLORS.CATREDLGT}
                                                        />
                                                    )}
                                                </View>
                                            );
                                        }}
                                    />
                                </View>
                                <View style={styles.lineDivider} />
                                {watchlist.length > 0 ? (
                                    <View>
                                        <WatchListCategory
                                            Akcru_Content={{
                                                id: 'YourFavourite',
                                                title: 'Your Favorites',
                                                movies: watchlist,
                                            }}
                                            updateWatchlist={updateWatchlist}
                                        />
                                    </View>
                                ) : (
                                    <View style={{alignItems: 'center', justifyContent: 'center', marginVertical: 10}}>
                                        <Text style={{color: 'gray'}}>Your Favorites will appear here</Text>
                                    </View>
                                )}
                                <View style={styles.lineDivider} />
                                <PurchasedContent />
                                <View style={styles.lineDivider} />
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginVertical: 10,
                                        marginRight: isTablet() ? 25 : 0,
                                    }}>
                                    <AkcruButtons.LrgButton
                                        btnname={'Add to Gallery'}
                                        onPress={selectGalleryImage}
                                        color={COLORS.PINK}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        }
                        ListFooterComponent={
                            <View>
                                <View style={{marginBottom: 75}} />
                                <Modal animationType="fade" transparent={true} visible={!!showImageCountErrorModal}>
                                    <ErrorModal
                                        closeModal={() => setShowImageCountErrorModal(false)}
                                        message={'You cannot upload more than 6 images.'}
                                        iconcolor={COLORS.CATREDLGT}
                                        iconname={'alert-circle'}
                                    />
                                </Modal>
                                <Modal animationType="fade" transparent={true} visible={!!enlargeModalVisible}>
                                    <EnlargeGalleryModal
                                        closeModal={toggleEnlargeModal}
                                        image={selectedImage}
                                        deleteImage={removeFromGallery}
                                    />
                                </Modal>
                                <Modal animationType="fade" transparent={true} visible={!!confirmationModal}>
                                    <ConfirmationModal
                                        confirmationText={'Are you sure you want to leave this CRU?'}
                                        onPressYes={() => confirmLeaveCRU()}
                                        onPressNo={() => setConfirmationModal(false)}
                                    />
                                </Modal>
                                <Modal animationType="fade" transparent={true} visible={!!cruResultModal}>
                                    <CruResultModal
                                        closeModal={() => setCruResultModal(false)}
                                        type={cruResultType}
                                        message={cruResultMessage}
                                        iconname={cruIconName}
                                        iconcolor={cruIconColor}
                                    />
                                </Modal>
                                <Modal
                                    visible={likesListModalVisible}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={() => setLikesListModalVisible(false)}>
                                    <View style={styles.backdrop}>
                                        <View style={styles.container}>
                                            <Text style={styles.title}>Liked by</Text>
                                            <FlatList
                                                data={likesList}
                                                keyExtractor={u => u.id}
                                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                                renderItem={({item}) => (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setLikesListModalVisible(false);
                                                            navigation.navigate('ViewUserScreen', {userID: item.id});
                                                        }}
                                                        style={styles.userRow}>
                                                        <CruMemberPic
                                                            userPicture={item.avatarUrl}
                                                            akcruBadge={item.badge}
                                                        />
                                                        <Text style={styles.username}>{item.username}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setLikesListModalVisible(false)}
                                                style={styles.closeBtn}>
                                                <Text style={styles.closeText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            </View>
                        }
                    />
                </View>
            </View>
        </View>
    );
};

export default UserProfileDetailsTab;
