import {HMSPeer, HMSSDK, HMSTrack} from '@100mslive/react-native-hms';
import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {IMovie, IUserProfile} from '../../../../types';
import {RealtimeChannel} from '@supabase/supabase-js';
import Video from 'react-native-video';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';

type StartWatchPartyViewNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'StartWatchPartyView'>;

type StartWatchPartyViewRouteProp = RouteProp<NoBottomTabStackParams, 'StartWatchPartyView'>;

export interface WatchPartyViewProps {
    navigation: StartWatchPartyViewNavigationProp;
    route: StartWatchPartyViewRouteProp;
    movieName: string;
    movieId: string;
    roomId: string;
    roomAuthToken: string;
    micInitialState: boolean;
    cameraInitialState: boolean;
    isHost: boolean;
    inviteId: any;
    creator: any;
    invitee: any;
    Timezone: string;
    Movietime: string;
    cru: any;
    type: any;
}

export interface TopContainerProps {
    currentRoomHost: string | undefined;
    user: IUserProfile | null;
    members: MemberInfo[] | [];
    handleRoomLeaving: () => void;
    handleEndRoom: () => void;
    handleChangeHost: (newHostId: string | undefined) => Promise<void>;
    handleHandMic: () => void;
    participantMicAccess: boolean;
}

export interface ChangeHostProps {
    currentRoomHost: string | undefined;
    members: MemberInfo[] | [];
    showChangeHost: boolean;
    setShowChangeHost: Dispatch<SetStateAction<boolean>>;
    handleChangeHost: (newHostId: string | undefined) => Promise<void>;
}

export interface MovieScreenProps {
    currentRoomHost: string | undefined;
    user: IUserProfile | null;
    movie: IMovie | null;
    isStreamOpen: boolean;
    isSyncedWithHost: MutableRefObject<boolean | null>;
    isFullscreen: boolean;
    setIsFullscreen: Dispatch<SetStateAction<boolean>>;
    isMoviePlaying: boolean;
    setIsMoviePlaying: Dispatch<SetStateAction<boolean>>;
    hasLottieFirstLoopCompleted: boolean;
    setHasLottieFirstLoopCompleted: Dispatch<SetStateAction<boolean>>;
    setCurrentTime: Dispatch<SetStateAction<number | undefined>>;
    roomChannelRef: MutableRefObject<RealtimeChannel | null>;
    syncChannelRef: MutableRefObject<RealtimeChannel | null>;
    videoPlayerRef: MutableRefObject<Video | null>;
    videoRoomPrivileges: boolean;
}

export interface UserVideosProps {
    currentHmsInstance: HMSSDK | null;
    peerTrackNodes: PeerTrackNode[] | [];
    expandedVideo: PeerTrackNode | null;
    setExpandedVideo: Dispatch<SetStateAction<PeerTrackNode | null>>;
    peersMuteStatus: {[key: string]: boolean | undefined};
    currentRoomHost: string | undefined;
    members: MemberInfo[] | [];
    videoRoomPrivileges: boolean;
}

export interface UserControlsProps {
    channel: RealtimeChannel | null;
    currentRoomHost: string | undefined;
    user: IUserProfile | null;
    currentHmsInstance: HMSSDK | null;
    members: MemberInfo[] | [];
    requestingUser: IUserProfile | undefined;
    showUnmuteModal: boolean;
    setShowUnmuteModal: Dispatch<SetStateAction<boolean>>;
    isUserVideoOn: boolean;
    setIsUserVideoOn: Dispatch<SetStateAction<boolean>>;
    isMicOn: boolean;
    setIsMicOn: Dispatch<SetStateAction<boolean>>;
    videoRoomPrivileges: boolean;
    micGiven: boolean;
}

export interface FeedBackModalProps {
    modalType: string;
}

export interface DecisionModalProps {
    modalType: string;
    username: string | undefined;
    setShowDecisionModal: Dispatch<SetStateAction<boolean>>;
    handleAccept: () => void;
}

export type PeerTrackNode = {
    id: string;
    peer: HMSPeer;
    track: HMSTrack | undefined;
};

export type MemberInfo = {
    peerID: string | undefined;
    role: string | undefined;
    name: string | undefined;
    isLocal: boolean | undefined;
    user: IUserProfile;
};
