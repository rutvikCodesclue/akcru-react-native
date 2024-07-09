import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    ActivityIndicator,
    Platform,
    StyleSheet,
    Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import AkcruButtons from '../../../components/akcruButtons';
import useAuthStore from '../../../stores/auth.store';
import {API} from '../../../clients/api.client';
import {selectAvatarBorderColor} from '../../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import Contacts from 'react-native-contacts';

import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import HexAvatar from '../../../components/HexAvatar';

const OnboardContactList = () => {
    const [contactsData, setContacts] = useState<any>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [OpenInvitedModal, setOpenInvitedModal] = useState<boolean>(false);
    const [isBtnLoading, setBtnLoading] = useState<boolean>(false);
    const [knowContacts, setKnowContacts] = useState<any>([]);
    const [isContactPermission, setIsContactPermission] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const user = useAuthStore(state => state.user);

    const getContactList = async () => {
        try {
            setLoading(true);
            const contacts = await Contacts.getAll();
            console.log('Total contacts on phone:', contacts.length);

            let allPhoneNumbers: any[] = [];

            contacts.forEach(contact => {
                const phoneNumbers = contact.phoneNumbers.map(phone => phone.number);
                allPhoneNumbers = allPhoneNumbers.concat(phoneNumbers);
            });

            const cleanedPhoneNumbers = await cleanPhoneNumbersAsync(allPhoneNumbers);
            console.log('Cleaned phone numbers:', cleanedPhoneNumbers);

            setContacts(cleanedPhoneNumbers);
            await getKnownUsers(cleanedPhoneNumbers);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };


    async function cleanPhoneNumbersAsync(phoneNumbers) {
        const cleanedNumbers = [];

        for (const phoneNumber of phoneNumbers) {
            let cleanedNumber = '';

            for (let i = 0; i < phoneNumber.length; i++) {
                const char = phoneNumber.charAt(i);
                if (!isNaN(char) && char !== ' ') {
                    cleanedNumber += char;
                }
            }

            const finalNumber = cleanedNumber.slice(-11);
            if (finalNumber.length === 11) {
                cleanedNumbers.push(finalNumber);
            }
        }

        return cleanedNumbers;
    }

    const getKnownUsers = async (allPhoneNumbers: string[]) => {
        try {
            const user_known_contacts = await API.post('/v1/user/find-known-users', {
                phoneNumbers: allPhoneNumbers,
            });
            if (user_known_contacts.data.success) {
                console.log('Known users from API:', user_known_contacts.data.users);

                const clonedArray = user_known_contacts.data.users.map((obj: any) => ({
                    ...obj,
                    isFollowed: false,
                    isSendInvite: false,
                }));

                setKnowContacts(clonedArray);
            } else {
                console.log('No known users found.');
            }
        } catch (error) {
            console.error('Error fetching known users:', error);
        }
    };

    const sections = React.useMemo(() => {
        const sectionsMap = knowContacts.reduce((acc, contact) => {
            if (contact.username !== null) {
                const firstLetter = contact.username?.trim().charAt(0).toUpperCase();
                return {
                    ...acc,
                    [firstLetter]: [...(acc[firstLetter] || []), contact],
                };
            } else if (contact.firstName !== null) {
                const firstLetter = contact.firstName?.trim().charAt(0).toUpperCase();
                return {
                    ...acc,
                    [firstLetter]: [...(acc[firstLetter] || []), contact],
                };
            } else {
                const firstLetter = 'U';
                return {
                    ...acc,
                    [firstLetter]: [...(acc[firstLetter] || []), contact],
                };
            }
        }, {});

        const sortedSections = Object.entries(sectionsMap)
            .sort(([letterA], [letterB]) => letterA.localeCompare(letterB))
            .map(([letter, items]) => ({letter, items}));
        return sortedSections;
    }, [knowContacts]);

    const checkContactPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                let contactResult = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
                if (contactResult === RESULTS.GRANTED) {
                    setIsContactPermission(true);
                    await getContactList();
                } else if (contactResult === RESULTS.DENIED) {
                    setIsContactPermission(false);
                    const requestResult = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
                    if (requestResult === RESULTS.GRANTED) {
                        setIsContactPermission(true);
                        await getContactList();
                    } else {
                        console.log('Contact permission denied');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking or requesting contact permission:', error);
        }
    };


    const FollowContact = async (contact_id: string) => {
        try {
            setBtnLoading(true);
            const isContactAlreadyFollowed: any = checkAlreadyFollow(contact_id);
            if (!isContactAlreadyFollowed._j) {
                const follow_contact = await API.post('v1/user/toggle-follow', {user, targetUserId: contact_id});
                if (follow_contact.data.success) {
                    setBtnLoading(false);
                    handleFollow(contact_id);
                }
            } else {
                setOpenModal(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkAlreadyFollow = async (contact_id: string) => {
        const selectedObject = knowContacts.find(obj => obj.id === contact_id);
        if (selectedObject.isFollowed) {
            return true;
        } else {
            return false;
        }
    };

    const handleFollow = (contact_id: string) => {
        const updatedArray = knowContacts.map(obj => (obj.id === contact_id ? {...obj, isFollowed: true} : obj));

        setKnowContacts(updatedArray);
    };

    const sendCRUInvite = async (sender_id: string, sender_username: string) => {
        try {
            setBtnLoading(true);
            const isContactAlreadyInvited: any = checkAlreadySendInvite(sender_id);
            if (!isContactAlreadyInvited._j) {
                const follow_contact = await API.post('v1/cru/invite/create', {
                    user,
                    username: sender_username,
                    senderId: sender_id,
                });
                if (follow_contact.data.success) {
                    setBtnLoading(false);
                    handleInvite(sender_id);
                }
            } else {
                setOpenInvitedModal(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleInvite = (contact_id: string) => {
        const updatedArray = knowContacts.map(obj => (obj.id === contact_id ? {...obj, isSendInvite: true} : obj));

        setKnowContacts(updatedArray);
    };

    const checkAlreadySendInvite = async (contact_id: string) => {
        const selectedObject = knowContacts.find(obj => obj.id === contact_id);
        if (selectedObject.isSendInvite) {
            return true;
        } else {
            return false;
        }
    };

    useEffect(() => {
        checkContactPermission();
    }, []);

    return (
        <SafeAreaView>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <LinearGradient
                    colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: SIZES.ScreenHeight,
                    }}
                />

                {isContactPermission === true ? (
                    <>
                        <>
                            {isLoading === true && sections.length == 0 ? (
                                <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '45%'}}>
                                    <ActivityIndicator size="large" color={COLORS.PURPLE} />
                                </View>
                            ) : (
                                <>
                                    {sections.length >= 1 && isLoading === true ? (
                                        <ScrollView contentContainerStyle={style.container}>
                                            {sections.map(({letter, items}) => (
                                                <View style={style.section} key={letter}>
                                                    <Text style={style.sectionTitle}>{letter}</Text>
                                                    <View style={style.sectionItems}>
                                                        {items.map(
                                                            (
                                                                {
                                                                    firstName,
                                                                    username,
                                                                    profilePicture,
                                                                    badge,
                                                                    description,
                                                                    isFollowed,
                                                                    id,
                                                                    isSendInvite,
                                                                },
                                                                index,
                                                            ) => {
                                                                return (
                                                                    <View key={index} style={style.cardWrapper}>
                                                                        <View>
                                                                            <View style={style.card}>
                                                                                {profilePicture ? (
                                                                                    <HexAvatar
                                                                                        source={{uri: profilePicture}}
                                                                                        size={40}
                                                                                        bordercolor={selectAvatarBorderColor(
                                                                                            badge ?? 'AKCRUIT',
                                                                                        )}
                                                                                    />
                                                                                ) : (
                                                                                    <View
                                                                                        style={[
                                                                                            style.cardImg,
                                                                                            style.cardAvatar,
                                                                                        ]}>
                                                                                        <Text
                                                                                            style={
                                                                                                style.cardAvatarText
                                                                                            }>
                                                                                            {username !== null ? (
                                                                                                username[0]
                                                                                            ) : (
                                                                                                <>
                                                                                                    {firstName !== null
                                                                                                        ? firstName[0].toUpperCase()
                                                                                                        : 'U'}
                                                                                                </>
                                                                                            )}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}

                                                                                <View style={style.cardBody}>
                                                                                    <Text style={style.cardTitle}>
                                                                                        <Text
                                                                                            style={
                                                                                                style.cardAvatarText
                                                                                            }>
                                                                                            {username !== null ? (
                                                                                                username
                                                                                            ) : (
                                                                                                <>
                                                                                                    {firstName !== null
                                                                                                        ? firstName
                                                                                                        : 'U'}
                                                                                                </>
                                                                                            )}
                                                                                        </Text>
                                                                                    </Text>

                                                                                    <Text
                                                                                        style={{
                                                                                            ...FONTS.paragraph2,
                                                                                            width: '45%',
                                                                                        }}>
                                                                                        {description}
                                                                                    </Text>
                                                                                </View>

                                                                                <View style={style.cardAction}>
                                                                                    <View style={{marginBottom: 10}}>
                                                                                        <AkcruButtons.AutoButton
                                                                                            color={
                                                                                                isFollowed
                                                                                                    ? COLORS.MIDORANGE
                                                                                                    : COLORS.AKCRUBLUE
                                                                                            }
                                                                                            disabled={isBtnLoading}
                                                                                            btnname={
                                                                                                isFollowed
                                                                                                    ? 'Followed'
                                                                                                    : 'Follow'
                                                                                            }
                                                                                            onPress={() =>
                                                                                                FollowContact(id)
                                                                                            }
                                                                                            width={90}
                                                                                            // style={{marginTop: 10}}
                                                                                        />
                                                                                    </View>

                                                                                    <AkcruButtons.AutoButton
                                                                                        color={
                                                                                            isSendInvite
                                                                                                ? COLORS.MIDORANGE
                                                                                                : COLORS.AKCRUBLUE
                                                                                        }
                                                                                        disabled={isBtnLoading}
                                                                                        btnname={
                                                                                            isSendInvite
                                                                                                ? 'Invited'
                                                                                                : 'CRU Invite'
                                                                                        }
                                                                                        onPress={() =>
                                                                                            sendCRUInvite(id, username)
                                                                                        }
                                                                                        width={90}
                                                                                    />
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                );
                                                            },
                                                        )}
                                                    </View>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '35%'}}>
                                            <Text style={{...FONTS.Title1, color: COLORS.DARKGREY}}>
                                                No Records Found
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    </>
                ) : (
                    <View style={style.noContactContainer}>
                        <View style={style.noContactDetailContainer}>
                            <Text style={style.noContactHeading}>Need Contact Access</Text>
                            <Text style={style.noContactPara}>
                                Uh Oh! seems like you didn't given the access of your contacts{' '}
                            </Text>
                        </View>
                        <View style={style.skipBtnContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate('OnboardName')}>
                                <Text style={style.skipBtn}> Skip </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ImageBackground>

            <Modal animationType="fade" transparent={true} visible={openModal}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: COLORS.AKCRUBACKGROUND,
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
                            {'You already followed this person.'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setOpenModal(false);
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

            <Modal animationType="fade" transparent={true} visible={OpenInvitedModal}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: COLORS.AKCRUBACKGROUND,
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
                            {'You already send the CRU invitation to this person.'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setOpenInvitedModal(false);
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
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    container: {
        paddingTop: 10,
        paddingBottom: 60,
        paddingHorizontal: 0,
    },
    header: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        marginTop: 10,
    },

    section: {
        marginTop: 12,
        paddingLeft: 24,
    },
    sectionTitle: {
        ...FONTS.ContentTitle,
        marginTop: 10,
    },
    sectionItems: {
        marginTop: 8,
    },

    card: {
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    cardWrapper: {
        borderBottomWidth: 1,
        borderColor: '#d6d6d6',
        marginRight: 18,
    },
    cardImg: {
        width: 42,
        height: 42,
        borderRadius: 12,
    },
    cardAvatar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9ca1ac',
    },
    cardAvatarText: {
        ...FONTS.Title2,
    },
    cardBody: {
        marginRight: 'auto',
        marginLeft: 15,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    cardPhone: {
        ...FONTS.paragraph1,
        marginTop: 3,
        width: '20%',
    },
    cardAction: {
        paddingRight: 5,
    },
    noContactContainer: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noContactDetailContainer: {
        height: '83%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: COLORS.DARKORANGE,
    },
    skipTopBtn: {
        paddingHorizontal: 20,
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: COLORS.AKCRUBLUE,
        marginTop: 15,
        marginRight: 10,
    },
    noContactHeading: {
        fontSize: 30,
        fontWeight: '700',
        color: '#fff',
        paddingTop: 40,
    },
    noContactPara: {
        fontSize: 15,
        fontWeight: '400',
        color: '#fff',
        width: '90%',
        textAlign: 'center',
        marginTop: 10,
    },
    skipBtnContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'auto',
        width: '100%',
    },
});

export default OnboardContactList;
