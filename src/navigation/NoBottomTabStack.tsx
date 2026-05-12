import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ClientTabNavigator from './ClientTabNavigator';
import {ClientStack} from './ClientStack';
import ContentSwipe from '../screens/contentScreens/contentSwipe';
import ContentPlayer from '../screens/contentScreens/PlayContentScreen';
import WatchSoloSessionMovie from '../screens/contentScreens/WatchSoloSessionMovie';
import ContentDetailScreen from '../screens/contentScreens/contentDetailScreen';
import StartMITDate from '../screens/userScreens/StartMITDate';
import StartWatchPartyView from '../screens/userScreens/StartWatchPartyView';
import WatchPartyPreview from '../screens/userScreens/WatchPartyPreview';
import TrailerPlayer from '../screens/contentScreens/PlayTrailerContent';
import PostScreen from '../screens/crummunityScreens/PostScreen';
import {CruChat, CruGroupChat} from '../screens/ChatScreens';
import NewPost from '../screens/crummunityScreens/NewPost';
import NewComment from '../screens/crummunityScreens/NewComment';
import {IComment, ICru, IPoll, IPollComment, IPost} from '../../types';
import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';
import BugReport from '../screens/userScreens/BugReport';
import Help from '../screens/userScreens/Help';
import EditProfile from '../screens/userScreens/EditProfileScreen';
import AccountSettings from '../screens/userScreens/AccountSettings';
import Suggestions from '../screens/userScreens/Suggestions';
import Questions from '../screens/userScreens/Questions';
import ReportUser from '../screens/userScreens/ReportUser';
import UserNotification from '../screens/userScreens/UserNotifications/UserNotification';
import BlockedUsers from '../screens/userScreens/BlockedUsers';
import ContactList from '../screens/userScreens/ContactList/ContactList';
import ResumeDetailScreen from '../screens/contentScreens/ResumeDetailScreen';
import ResumePlayer from '../screens/contentScreens/ResumeContentScreen';
import SearchMovieResultScreen from '../screens/contentScreens/SearchMovieResultScreen';
import UserMITHubScreen from '../screens/userScreens/UserMITHubScreen';
import ViewUserFollowList from '../screens/userScreens/ViewUserFollowList';
import {
    SendMITSchedule,
    SendMITSearchInput,
    SendMITSearchResult,
    SendMITViewUser,
} from '../screens/crummunityScreens/SendViewUserMITScreens';
import MITDateSchedule from '../screens/contentScreens/MovieMITScheduleScreen/MITDateSchedule';
import VisionaryRoomSchedule from '../screens/contentScreens/VisionaryRoomScheduleScreen/VisionaryRoomSchedule'
import SearchMovieScreen from '../screens/contentScreens/SearchMovieScreen';
import SeriesDetailScreen from '../screens/contentScreens/SeriesDetailScreen';
import SeriesTrailerPlayer from '../screens/contentScreens/PlaySeriesTrailer';
import EpisodePlayer from '../screens/contentScreens/PlayEpisode';
import SizzleDetailScreen from '../screens/contentScreens/SizzleDetailScreen';
import SizzlePlayer from '../screens/contentScreens/PlaySizzle';
import EpisodeDetailScreen from '../screens/contentScreens/EpisodeDetailScreen';
import UserProfileScreen from '../screens/userScreens/UserProfileScreen';
import UserProfileHubTabScreen from '../screens/userScreens/UserProfileHubTabScreen';
import ChooseMITScreen from '../screens/userScreens/MITChoice/ChooseMITScreen';
import AcceptMITScreen from '../screens/userScreens/MITAccept';
import DeclineMITScreen from '../screens/userScreens/MITDecline';
import CruViewMovieDetailScreen from '../screens/userScreens/CruViewScreens/CruViewMovieDetailScreen';
import CruViewSearchMovieResultScreen from '../screens/userScreens/CruViewScreens/CruViewSearchMovieResultScreen';
import CruViewSearchMovieScreen from '../screens/userScreens/CruViewScreens/CruViewSearchMovieScreen';
import EditCru from '../screens/userScreens/EditCru';
import FollowList from '../screens/userScreens/FollowList';
import EditPostScreen from '../screens/crummunityScreens/EditPost';
import EditCommentScreen from '../screens/crummunityScreens/EditComment';
import EditPollCommentScreen from '../screens/crummunityScreens/EditPollComment';
import NewPoll from '../screens/crummunityScreens/NewPoll';
import PollScreen from '../screens/crummunityScreens/PollScreen';
import NewPollComment from '../screens/crummunityScreens/NewPollComment';
import {CruInviteAccept, CruInviteDecline} from '../screens/userScreens/CruInviteResponse';
import FlickFlirtPref from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtPref';
import FlickFlirtPrefB from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtPrefB';
import FlickFlirtPrefC from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtPrefC';
import FlickFlirtPrefD from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtPrefD';
import FlickFlirtPrefAll from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtPrefAll';
import FlickFlirtSwipe from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtSwipe';
import FlickFlirtArchetypeResult from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtArchetypeResult';
import FlickFlirtMatches from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtMatches';
import FlickFlirtUnlockMatches from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtUnlockMatches';
import UnlockingMatchesScreen from '../screens/CenterButtonScreens/FlickFlirt/UnlockingMatches';
import PurchaseAdScreen from '../screens/CenterButtonScreens/PurchaseAD';
import FlickFlirtResults from '../screens/CenterButtonScreens/FlickFlirt/FlickFlirtResults';
import DiscoverArchetypeScreen from '../screens/CenterButtonScreens/FlickFlirt/DiscoverArchetypeScreen';
import AdminGrantADScreen from '../screens/adminScreens/grantAD';
import AdminWalletSearch from '../screens/adminScreens/walletSearch';
import AdPurchaseSuccessScreen from '../screens/CenterButtonScreens/PurchaseAD/VerifyPurchase';
import StripeWebCheckout from '../screens/CenterButtonScreens/PurchaseAD/WebCheckout';
import VisionaryRoomRequest from '../screens/contentScreens/VisionaryRoomRequest';
import VisionaryWatchParty from '../screens/userScreens/VisionaryWatchParty';
import { UserProfileStack } from './UserProfileStack';
import {UnlockOption} from '../lib/api/flickflirt.lib';
import CrummunitySendMITScreen, {
    CrummunitySendMITParams,
} from '../screens/crummunityScreens/CrummunitySendMITScreen';

export type NoBottomTabStackParams = {
    BlockedUsers: any;
    UserNotification: any;
    ReportUser: any;
    Questions: any;
    Suggestions: any;
    AccountSettings: any;
    EditProfile: any;
    Help: any;
    BugReport: any;
    ContentSwipe: any;
    ClientTabNavigator: any;
    ClientStack: any;
    ContentPlayer: any;
    WatchSoloSessionMovie: any;
    ContentDetailScreen: any;
    StartMITDate: any;
    StartWatchPartyView: any;
    VisionaryWatchParty: any;
    WatchPartyPreview: any;
    Signin: any;
    AkcruButtonStack: any;
    FlickFlirtScreen: any;
    FlickFlirtPref: any;
    FlickFlirtPrefB: any;
    FlickFlirtPrefC: any;
    FlickFlirtPrefD: any;
    FlickFlirtPrefAll: any;
    FlickFlirtSwipe: any;
    FlickFlirtArchetypeResult: {
        name: string;
        image: string;
        description: string;
        genres: string[];
        /** true when opened from OnboardArchetypeStandalone (genre picker) */
        fromOnboardArchetypeStandalone?: boolean;
    };
    FlickFlirtMatches: any;
    FlickFlirtUnlockMatches: {unlockOptions: UnlockOption[]};
    UnlockingMatches: undefined;
    PurchaseAdScreen: {
        passCostAd?: number;
        passDays?: number;
        unlockOptions?: UnlockOption[];
    };
    FlickFlirtResults: {startedAt?: number};
    DiscoverArchetypeScreen: any;
    AkcruNetworkScreen: any;
    PurchaseMITScreen: any;
    TrailerPlayer: any;
    PostScreen: {
        post?: IPost;
        comment?: IComment;
        postId: number;
    };
    ViewChat: {
        userId: string;
        mItInviteId: string;
        profilePicture: string;
        username: string;
        initialMessage?: string;
    };
    ViewGroupChat: {cru: ICru};
    NewPost: any;
    NewComment: any;
    NewPollComment: any;
    ViewUserScreen: {userID: string; imageURL: string};
    UserMITHubScreen: {index: number};
    ContactList: any;
    ResumeDetailScreen: any;
    ResumePlayer: any;
    SearchMovieResultScreen: any;
    ViewUserFollowList: any;
    SendMITViewUser: any;
    CrummunitySendMITScreen: CrummunitySendMITParams;
    SendMITSearchInput: any;
    SendMITSearchResult: any;
    SendMITSchedule: any;
    MITDateSchedule: any;
    VisionaryRoomSchedule: any;
    VisionaryRoomRequest: any;
    SearchMovieScreen: any;
    SeriesDetailScreen: any;
    SeriesTrailerPlayer: any;
    EpisodePlayer: any;
    SizzleDetailScreen: any;
    SizzlePlayer: any;
    EpisodeDetailScreen: any;
    // UserProfileScreen: {index: number};
    ChooseMITScreen: any;
    AcceptMITScreen: any;
    DeclineMITScreen: any;
    CruViewMovieDetailScreen: any;
    CruViewSearchMovieResultScreen: any;
    CruViewSearchMovieScreen: any;
    EditCru: any;
    EditPostScreen: any;
    EditCommentScreen: any;
    EditPollCommentScreen: any;
    NewPoll: any;
    PollScreen: {
        poll?: IPoll;
        comment?: IPollComment;
        pollId: string;
    };
    CruInviteDecline: any;
    CruInviteAccept: any;
    AdminGrantADScreen: any;
    AdminWalletSearch: any;
    AdPurchaseSuccessScreen: any;
    StripeWebCheckout: any;
    UserProfileStack: any;
    UserProfileHubTabScreen: {hubTab: 'details' | 'dates' | 'cru' | 'wallet'};
};

const NoBottom = createStackNavigator<NoBottomTabStackParams>();

export default function NoBottomStack() {
    return (
        <NoBottom.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
            }}>
            <NoBottom.Screen
                name="ClientTabNavigator"
                component={ClientTabNavigator}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ContentSwipe"
                component={ContentSwipe}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="Signin"
                component={Signin}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ContentPlayer"
                component={ContentPlayer}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="WatchSoloSessionMovie"
                component={WatchSoloSessionMovie}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="EpisodePlayer"
                component={EpisodePlayer}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ResumePlayer"
                component={ResumePlayer}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="TrailerPlayer"
                component={TrailerPlayer}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SizzlePlayer"
                component={SizzlePlayer}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SeriesTrailerPlayer"
                component={SeriesTrailerPlayer}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ContentDetailScreen"
                component={ContentDetailScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SeriesDetailScreen"
                component={SeriesDetailScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ResumeDetailScreen"
                component={ResumeDetailScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SizzleDetailScreen"
                component={SizzleDetailScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="EpisodeDetailScreen"
                component={EpisodeDetailScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ClientStack"
                component={ClientStack}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SearchMovieResultScreen"
                component={SearchMovieResultScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SearchMovieScreen"
                component={SearchMovieScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="StartMITDate"
                component={StartMITDate}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="WatchPartyPreview"
                component={WatchPartyPreview}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="StartWatchPartyView"
                component={StartWatchPartyView}
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
            <NoBottom.Screen
                name="VisionaryWatchParty"
                component={VisionaryWatchParty}
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
            <NoBottom.Screen
                name="PostScreen"
                component={PostScreen}
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
            <NoBottom.Screen
                name="ViewChat"
                component={CruChat}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ViewGroupChat"
                component={CruGroupChat}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="NewPost"
                component={NewPost}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ContactList"
                component={ContactList}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="NewComment"
                component={NewComment}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="NewPollComment"
                component={NewPollComment}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ViewUserScreen"
                component={ViewUserScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SendMITViewUser"
                component={SendMITViewUser}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="CrummunitySendMITScreen"
                component={CrummunitySendMITScreen}
                options={{
                    headerShown: false,
                    /** Use default `card` — `modal` uses iOS sheet-style margins (gap at top). */
                    gestureDirection: 'horizontal',
                    cardStyle: {flex: 1},
                }}
            />
            <NoBottom.Screen
                name="SendMITSearchInput"
                component={SendMITSearchInput}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SendMITSearchResult"
                component={SendMITSearchResult}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="SendMITSchedule"
                component={SendMITSchedule}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="BugReport"
                component={BugReport}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="Help"
                component={Help}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="EditProfile"
                component={EditProfile}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="AccountSettings"
                component={AccountSettings}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="Suggestions"
                component={Suggestions}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="Questions"
                component={Questions}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="UserMITHubScreen"
                component={UserMITHubScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ReportUser"
                component={ReportUser}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="UserNotification"
                component={UserNotification}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="BlockedUsers"
                component={BlockedUsers}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="ViewUserFollowList"
                component={ViewUserFollowList}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="MITDateSchedule"
                component={MITDateSchedule}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="VisionaryRoomSchedule"
                component={VisionaryRoomSchedule}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="VisionaryRoomRequest"
                component={VisionaryRoomRequest}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="UserProfileScreen"
                component={UserProfileScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="UserProfileHubTabScreen"
                component={UserProfileHubTabScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="ChooseMITScreen"
                component={ChooseMITScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="AcceptMITScreen"
                component={AcceptMITScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="DeclineMITScreen"
                component={DeclineMITScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="CruViewMovieDetailScreen"
                component={CruViewMovieDetailScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="CruViewSearchMovieResultScreen"
                component={CruViewSearchMovieResultScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="CruViewSearchMovieScreen"
                component={CruViewSearchMovieScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="EditCru"
                component={EditCru}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FollowList"
                component={FollowList}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="EditPostScreen"
                component={EditPostScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="EditCommentScreen"
                component={EditCommentScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="EditPollCommentScreen"
                component={EditPollCommentScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="NewPoll"
                component={NewPoll}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <NoBottom.Screen
                name="PollScreen"
                component={PollScreen}
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
            <NoBottom.Screen
                name="CruInviteAccept"
                component={CruInviteAccept}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="CruInviteDecline"
                component={CruInviteDecline}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtPref"
                component={FlickFlirtPref}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtPrefB"
                component={FlickFlirtPrefB}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtPrefC"
                component={FlickFlirtPrefC}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtPrefD"
                component={FlickFlirtPrefD}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtPrefAll"
                component={FlickFlirtPrefAll}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtSwipe"
                component={FlickFlirtSwipe}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtArchetypeResult"
                component={FlickFlirtArchetypeResult}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtMatches"
                component={FlickFlirtMatches}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtUnlockMatches"
                component={FlickFlirtUnlockMatches}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="UnlockingMatches"
                component={UnlockingMatchesScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="PurchaseAdScreen"
                component={PurchaseAdScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="FlickFlirtResults"
                component={FlickFlirtResults}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="DiscoverArchetypeScreen"
                component={DiscoverArchetypeScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="AdminGrantADScreen"
                component={AdminGrantADScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <NoBottom.Screen
                name="AdminWalletSearch"
                component={AdminWalletSearch}
                options={() => ({headerShown: false})}
            />
            <NoBottom.Screen
                name="AdPurchaseSuccessScreen"
                component={AdPurchaseSuccessScreen}
                options={() => ({headerShown: false})}
            />
            <NoBottom.Screen
                name="StripeWebCheckout"
                component={StripeWebCheckout}
                options={() => ({headerShown: false})}
            />
            <NoBottom.Screen
                name="UserProfileStack"
                component={UserProfileStack}
                options={() => ({headerShown: false})}
            />
        </NoBottom.Navigator>
    );
}
