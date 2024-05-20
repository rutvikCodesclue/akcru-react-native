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
    terminateRoom: any; 
    _handleTerminateRoom: any; 
    handleCancelRoomTermination: any;
}

const TerminateRoomModal = ({terminateRoom, _handleTerminateRoom, handleCancelRoomTermination}: Props) => {
    return (
        <Modal animationType="fade" transparent={true} visible={terminateRoom}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View
                    style={{
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                        padding: 20,
                        borderRadius: 10,
                        marginHorizontal: '5%',
                    }}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm closing CRU View</Text>
                        <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                            Are you sure you want to end this CRU View session?
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}>
                        <AkcruButtons.SmallButton
                            onPress={_handleTerminateRoom}
                            color={COLORS.PINK}
                            btnname="Terminate"
                        />
                        <AkcruButtons.SmallButton
                            onPress={handleCancelRoomTermination}
                            color={COLORS.PURPLE}
                            btnname="Cancel"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
};

export default TerminateRoomModal;