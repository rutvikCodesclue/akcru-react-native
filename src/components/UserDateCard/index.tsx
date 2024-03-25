import {View, Text, TouchableOpacity, Image, Alert, Modal} from 'react-native';
import React, {useState} from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import imageindex from '../../../assets/images/imageindex';
import moment from 'moment-timezone';
import {getShortenedTimezone} from '../../util/util';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import AkcruButtons from '../akcruButtons';
import {cancelCRUView} from '../../lib/api/cru.lib';
import ComfirmationModal from '../ConfirmationModal';
import DateResultModal from '../MasterResultModal/MasterResultModal';
import {UseTabMenu} from '../../context/TabContext';
import {cancelMIT} from '../../lib/api/mit.lib';
import {API} from '../../clients/api.client';

type UserDatesCardProps = {
    id: string;
    type: 'MITInvite' | 'CRUView';
    cruId?: string;
    userId?: string;
    isHost: boolean;
    movieId: string;
    moviePoster: string;
    movieName: string;
    length: string;
    movieYear: number;
    movieRated: string;
    movieGenre: string;
    movieRating: number;
    scheduleDate: string;
    scheduleTime: string;
    scheduleWith: string;
    onPressin: () => void;
    timezone: string;
    onPress: () => void;
    cru: any;
};

const UserDatesCard = ({
    id,
    cruId,
    cru,
    userId,
    isHost,
    movieId,
    moviePoster,
    movieName,
    length,
    movieYear,
    movieRated,
    movieGenre,
    movieRating,
    scheduleDate,
    scheduleTime,
    scheduleWith,
    type,
    onPressin,
    timezone,
    onPress,
    creator,
    invitee

}: UserDatesCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [showMITEntryErr, setshowMITEntryErr] = useState(false);
    const [confirmCancelModal, setConfirmCancelModal] = useState(false);
    const [dateMessage, setDateMessage] = useState('');
    const [dateIcon, setDateIcon] = useState('');
    const [dateIconColor, setDateIconColor] = useState('');
    const [dateType, setDateType] = useState('');
    const [dateResultModal, setDateResultModal] = useState(false);
    const {setRefetchDates} = UseTabMenu();

    const [dateMITResultModal, setDateMITResultModal] = useState(false);
    const [confirmCancelMITModal, setConfirmCancelMITModal] = useState(false);
    const [dateMITMessage, setDateMITMessage] = useState('');
    const [dateMITIcon, setDateMITIcon] = useState('');
    const [dateMITIconColor, setDateMITIconColor] = useState('');
    const [dateMITType, setDateMITType] = useState('');

    const handleCancelCruView = async () => {
        try {
            const response = await cancelCRUView(id); // Use the CRU View ID
            if (response.success) {
                setRefetchDates(true);
                setConfirmCancelModal(false);
                setDateType('Success');
                setDateResultModal(true);
                setDateMessage('CRU View cancelled successfully');
                setDateIcon('md-checkmark-circle');
                setDateIconColor('green');
            } else {
                setRefetchDates(true);
                setConfirmCancelModal(false);
                setDateType('Fail');
                setDateResultModal(true);
                setDateMessage('Failed to cancel CRU View');
                setDateIcon('md-alert-circle');
                setDateIconColor('red');
            }
        } catch (error) {
            setRefetchDates(true);
            setConfirmCancelModal(false);
            setDateType('Error');
            setDateResultModal(true);
            setDateMessage('An error occurred while cancelling the CRU View');
            setDateIcon('md-alert-circle');
            setDateIconColor('red');
            console.error('Error cancelling CRU View:', error);
        }
    };

    const handleCancelMIT = async (mitInviteId: string) => {
        try {
            const response = await cancelMIT(mitInviteId); // Use the CRU View ID
            if (response.success) {
                setRefetchDates(true);
                setConfirmCancelMITModal(false);
                setDateMITType('Success');
                setDateMITResultModal(true);
                setDateMITMessage('MIT cancelled successfully');
                setDateMITIcon('md-checkmark-circle');
                setDateMITIconColor('green');
            } else {
                setRefetchDates(true);
                setConfirmCancelMITModal(false);
                setDateMITType('Fail');
                setDateMITResultModal(true);
                setDateMITMessage('Failed to cancel MIT');
                setDateMITIcon('md-alert-circle');
                setDateMITIconColor('red');
            }
        } catch (error) {
            setRefetchDates(true);
            setConfirmCancelMITModal(false);
            setDateMITType('Error');
            setDateMITResultModal(true);
            setDateMITMessage('An error occurred while cancelling the MIT');
            setDateMITIcon('md-alert-circle');
            setDateMITIconColor('red');
            console.error('Error cancelling MIT:', error);
        }
    };

    const checkTimeGate = async (type: string, scheduleTime: string, timezone: string, scheduleDate: string) => {
        try {
            const movieTime =
                moment(scheduleTime, 'h:mm A').tz(timezone).format('h:mm A') + getShortenedTimezone(timezone);

            const res: any = await API.get(
                `/v1/user/checkUserPartyTimeZone?scheduleDate=${scheduleDate}&movietime=${movieTime}&movie_timezone=${timezone}`,
            );
            console.log(res.data.success)
            res.data.success === false // to enter hard code bypass the timegate
            if (res.data.success === false) {

                if (res.data) {
                    if ((type == 'MITInvite')) {
                        navigation.navigate('WatchPartyPreview', {
                            id,
                            type,
                            userId,
                            movieId,
                            isHost,
                            scheduleTime,
                            timezone,
                            creator,
                            invitee
                        });
                    } else if ((type == 'CRUView')) {
                        navigation.navigate('WatchPartyPreview', {
                            id,
                            type,
                            movieId,
                            isHost,
                            cruId,
                            scheduleTime,
                            timezone,
                            creator,
                            invitee, 
                            cru
                        });
                    }
                }
            } else {
                if ((type == 'MITInvite')) {
                    navigation.navigate('WatchPartyPreview', {
                        id,
                        type,
                        userId,
                        movieId,
                        isHost,
                        scheduleTime,
                        timezone,
                        creator,
                        invitee
                    });
                } else if ((type == 'CRUView')) {
                    navigation.navigate('WatchPartyPreview', {
                        id,
                        type,
                        movieId,
                        isHost,
                        cruId,
                        scheduleTime,
                        timezone,
                        creator,
                        invitee,
                        cru
                    });
                }

                // setshowMITEntryErr(true);
            }
        } catch (error) {
            if ((type == 'MITInvite')) {
                navigation.navigate('WatchPartyPreview', {
                    id,
                    type,
                    userId,
                    movieId,
                    isHost,
                    scheduleTime,
                    timezone,
                    creator,
                    invitee
                });
            } else if ((type == 'CRUView')) {
                navigation.navigate('WatchPartyPreview', {
                    id,
                    type,
                    movieId,
                    isHost,
                    cruId,
                    scheduleTime,
                    timezone,
                    creator,
                    invitee,
                    cru
                });
            }

            // setshowMITEntryErr(true);
        }
    };

    return (
        <View
            style={{
                backgroundColor: '#1C202A',
                borderRadius: 5,
                justifyContent: 'center',
            }}>
            <LinearGradient
                // Background Linear Gradient
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
            <View style={{margin: 10}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginRight: 10}}>
                        <TouchableOpacity onPress={onPressin}>
                            <Image source={{uri: moviePoster}} style={styles.posterstyle} />
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '50%'}}>
                        <Text style={{...FONTS.Title2}}>{movieName}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginBottom: 5,
                                alignItems: 'center',
                            }}>
                            <Text style={{...FONTS.Title2, fontSize: 12}}>{movieYear}</Text>
                            <Text style={{...FONTS.Title2, fontSize: 12, marginHorizontal: 10}}>{length}</Text>
                        </View>
                        <View style={{flexDirection: 'row', marginVertical: 5}}>
                            <Text style={styles.drawfonttag}>{movieRated}</Text>
                            <Text style={styles.drawfonttag}>{movieGenre}</Text>

                            <Text style={styles.drawfonttag}>{movieRating}/10</Text>
                        </View>
                    </View>
                    <View style={{flex: 1}}>
                        {type === 'MITInvite' && (
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                <Image source={imageindex.LrgMIT} style={{width: '60%', height: '35%'}} />
                            </View>
                        )}

                        {type === 'CRUView' && (
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                <Image source={imageindex.NewCru} style={{width: '70%', height: '62%'}} />
                            </View>
                        )}
                    </View>
                </View>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
                    <Text style={styles.paragraphText}>You have a</Text>

                    {type === 'MITInvite' && (
                        <View style={{marginHorizontal: 5}}>
                            <Text style={styles.paragraphText2}>MIT</Text>
                        </View>
                    )}

                    {type === 'CRUView' && (
                        <View style={{marginHorizontal: 5}}>
                            <Text style={styles.paragraphText3}>CRU View</Text>
                        </View>
                    )}

                    <Text style={styles.paragraphText}>scheduled for</Text>
                    {/* DATE */}
                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText2}>
                            {moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}
                        </Text>
                    </View>

                    <Text style={styles.paragraphText}>at </Text>
                    {/* TIME */}
                    <View style={{marginRight: 5}}>
                        <Text style={styles.paragraphText2}>
                            {/* render UTC Time w/ moment */}
                            {moment(scheduleTime).tz(timezone).format('h:mm A')} {getShortenedTimezone(timezone)}
                        </Text>
                    </View>

                    <Text style={styles.paragraphText}>to watch</Text>
                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText}>"{movieName}"</Text>
                    </View>

                    <Text style={styles.paragraphText}>with </Text>

                    {type === 'MITInvite' && (
                        <TouchableOpacity onPress={onPress}>
                            <View>
                                <Text style={styles.paragraphText2}> {scheduleWith}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {type === 'CRUView' && (
                        <TouchableOpacity onPress={onPress}>
                            <View>
                                <Text style={styles.paragraphText3}> {scheduleWith}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}>
                    {type === 'MITInvite' && (
                        <AkcruButtons.SmallButton

  
                            onPress={() => checkTimeGate(type, scheduleTime, timezone, scheduleDate)}
                            btnname="Start MIT Date"
                            color={COLORS.AKCRUBLUE}
                            disabled={false}
                        />
                    )}

                    {type === 'CRUView' && (
                        <AkcruButtons.SmallButton
                  onPress={() =>
                                checkTimeGate(type, scheduleTime, timezone, scheduleDate)
                            }
                            btnname="Start Cru View"
                            color={COLORS.MIDORANGE}
                            disabled={false}
                        />
                    )}
                    {type === 'CRUView' && isHost && (
                        <AkcruButtons.SmallButton
                            onPress={() => setConfirmCancelModal(true)}
                            btnname="Cancel"
                            color={COLORS.CATREDLGT}
                            disabled={false}
                        />
                    )}
                    {type === 'MITInvite' && (
                        <AkcruButtons.SmallButton
                            onPress={() => setConfirmCancelMITModal(true)}
                            btnname="Cancel"
                            color={COLORS.CATREDLGT}
                            disabled={false}
                        />
                    )}
                </View>
            </View>
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
                            {`Movie hasn't started yet! Please join at scheduled time`}
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
                                {`Close`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
            <Modal visible={confirmCancelModal} transparent={true} animationType="fade">
                <ComfirmationModal
                    confirmationText="Are you sure you want to cancel this Cru View?"
                    onPressNo={() => setConfirmCancelModal(false)}
                    onPressYes={handleCancelCruView}
                />
            </Modal>
            <Modal visible={confirmCancelMITModal} transparent={true} animationType="fade">
                <ComfirmationModal
                    confirmationText="Are you sure you want to cancel this MIT date?"
                    onPressNo={() => setConfirmCancelMITModal(false)}
                    onPressYes={() => handleCancelMIT(id)}
                />
            </Modal>
            <Modal visible={dateResultModal} transparent={true} animationType="fade">
                <DateResultModal
                    iconname={dateIcon}
                    iconcolor={dateIconColor}
                    type={dateType}
                    message={dateMessage}
                    closeModal={() => setDateResultModal(false)}
                />
            </Modal>
            <Modal visible={dateMITResultModal} transparent={true} animationType="fade">
                <DateResultModal
                    iconname={dateMITIcon}
                    iconcolor={dateMITIconColor}
                    type={dateMITType}
                    message={dateMITMessage}
                    closeModal={() => setDateMITResultModal(false)}
                />

            </Modal>
        </View>
    );
};

export default UserDatesCard;
