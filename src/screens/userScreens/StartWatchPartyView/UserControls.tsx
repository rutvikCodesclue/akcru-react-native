import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback,
    Pressable,
    FlatList,
    ActivityIndicator,
    Modal,
    StatusBar,
} from 'react-native';
import React from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {RouteProp, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useState, useRef, useEffect, useCallback} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {StackNavigationProp} from '@react-navigation/stack';
import VideoPlayer from 'react-native-media-console';
import {findMovieById} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {capitalizeFirstLetterOfString, formatMovieDuration, selectAvatarBorderColor} from '../../../util/util';
import {supabaseRealtime} from '../../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import {
    HMSConfig,
    HMSException,
    HMSPeer,
    HMSPeerUpdate,
    HMSRoom,
    HMSRoomUpdate,
    HMSSDK,
    HMSTrack,
    HMSTrackSource,
    HMSTrackType,
    HMSTrackUpdate,
    HMSUpdateListenerActions,
    HMSVideoViewMode,
    HMSSpeaker,
    HMSMessage,
    HMSTrackSettings,
    HMSAudioTrackSettings,
    HMSVideoTrackSettings,
    HMSTrackSettingsInitState,
} from '@100mslive/react-native-hms';
import useAuthStore from '../../../stores/auth.store';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video, {LoadError, OnBufferData, OnProgressData, OnSeekData} from 'react-native-video';
import {IUserProfile} from '../../../../types';
import SmlMemberCard from '../../../components/SmlMemberCard';
import {findAUser} from '../../../lib/api/user.lib';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {checkRoomTime} from '../../../util/checkRoomTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import {supabase} from '../../../../lib/supabase';
import UnmutePermissionPopup from './unmutepermpopup';
import ErrorModal from './ErrorModal';
import WatchPartyDocker from '../../../components/WatchPartyDocker';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';

interface Props {
    toggleVideo: any; 
    isUserVideoOn: any; 
    toggleMic: any; 
    isMicOn: any; 
    isHost: any; 
    muteAllPeers: any; 
    sayhi: any; 
}

const UserControls = ({toggleVideo, isUserVideoOn, toggleMic, isMicOn, isHost, muteAllPeers, sayhi}: Props) => {
    return (
        <View style={styles.bottombtn}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}>
                        <Pressable onPress={toggleVideo}>
                            {isUserVideoOn ? (
                                <Icon name="video" type="material-community" size={40} color={COLORS.CATPURPLGT} />
                            ) : (
                                <Icon name="video-off" type="material-community" size={40} color={COLORS.CATREDLGT} />
                            )}
                        </Pressable>
                        <Pressable onPress={() => sayhi()}>
                            <Icon name="chatbox-ellipses" type="ionicon" size={40} color={COLORS.CATPURPLGT} />
                        </Pressable>
                        <Pressable onPress={toggleMic}>
                            {isMicOn ? (
                                <Icon name="mic-circle" type="ionicon" size={40} color={COLORS.GREEN} />
                            ) : (
                                <Icon name="mic-off-circle" type="ionicon" size={40} color={COLORS.CATREDLGT} />
                            )}
                        </Pressable>
                        {isHost ? (
                            <Pressable onPress={muteAllPeers} style={styles.button}>
                                <Text style={styles.buttonText}>Mute All</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>
    )
};

export default UserControls;

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.CATREDLGT,
        width: 80,
        height: 40,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
    bottombtn: {
        paddingTop: 10,
        position: 'relative',
    },
});
