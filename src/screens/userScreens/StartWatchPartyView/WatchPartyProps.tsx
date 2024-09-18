import {HMSSDK} from '@100mslive/react-native-hms';
import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {IMovie, IUserProfile} from '../../../../types';
import {MemberInfo} from '.';
import {RealtimeChannel} from '@supabase/supabase-js';
import Video from 'react-native-video';

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
}

export interface UserControlsProps {
    currentRoomHost: string | undefined;
    user: IUserProfile | null;
    roomId: string;
    isStreamHost: boolean;
    currentHmsInstance: HMSSDK | null;
    members: MemberInfo[] | [];
    isUserVideoOn: boolean;
    setIsUserVideoOn: Dispatch<SetStateAction<boolean>>;
    isMicOn: boolean;
    setIsMicOn: Dispatch<SetStateAction<boolean>>;
}

export interface FeedBackModalProps {
    modalType: string;
}

export interface DecisionModalProps {
    modalType: string;
    username: string | undefined;
    showDecisionModal: boolean;
    setShowDecisionModal: Dispatch<SetStateAction<boolean>>;
    handleAccept: () => void;
}
