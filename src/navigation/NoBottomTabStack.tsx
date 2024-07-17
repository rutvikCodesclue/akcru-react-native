import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ClientTabNavigator from './ClientTabNavigator';
import {ClientStack} from './ClientStack';
import ContentSwipe from '../screens/contentScreens/contentSwipe';
import ContentPlayer from '../screens/contentScreens/PlayContentScreen';
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
import MITDateSchedule from '../screens/contentScreens/MovieMITScheduleScreen/MITDateSchedule';
import SearchMovieScreen from '../screens/contentScreens/SearchMovieScreen';
import SeriesDetailScreen from '../screens/contentScreens/SeriesDetailScreen';
import SeriesTrailerPlayer from '../screens/contentScreens/PlaySeriesTrailer';
import EpisodePlayer from '../screens/contentScreens/PlayEpisode';
import SizzleDetailScreen from '../screens/contentScreens/SizzleDetailScreen';
import SizzlePlayer from '../screens/contentScreens/PlaySizzle';
import EpisodeDetailScreen from '../screens/contentScreens/EpisodeDetailScreen';
import UserProfileScreen from '../screens/userScreens/UserProfileScreen';
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
import NewPoll from '../screens/crummunityScreens/NewPoll';
import PollScreen from '../screens/crummunityScreens/PollScreen';

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
    ContentDetailScreen: any;
    StartMITDate: any;
    StartWatchPartyView: any;
    WatchPartyPreview: any;
    Signin: any;
    AkcruButtonStack: any;
    FlickFlirtScreen: any;
    AkcruNetworkScreen: any;
    PurchaseMITScreen: any;
    TrailerPlayer: any;
    PostScreen: {
        post?: IPost;
        comment?: IComment;
        postId: number;
    };
    ViewChat: {userId: string; mItInviteId: string; profilePicture: string; username: string};
    ViewGroupChat: {cru: ICru};
    NewPost: any;
    NewComment: any;
    ViewUserScreen: {userID: string; imageURL: string};
    UserMITHubScreen: {index: number};
    ContactList: any;
    ResumeDetailScreen: any;
    ResumePlayer: any;
    SearchMovieResultScreen: any;
    ViewUserFollowList: any;
    MITDateSchedule: any;
    SearchMovieScreen: any;
    SeriesDetailScreen: any;
    SeriesTrailerPlayer: any;
    EpisodePlayer: any;
    SizzleDetailScreen: any;
    SizzlePlayer: any;
    EpisodeDetailScreen: any;
    UserProfileScreen: {index: number};
    ChooseMITScreen: any;
    AcceptMITScreen: any;
    DeclineMITScreen: any;
    CruViewMovieDetailScreen: any;
    CruViewSearchMovieResultScreen: any;
    CruViewSearchMovieScreen: any;
    EditCru: any;
    EditPostScreen: any;
    EditCommentScreen: any;
    NewPoll: any;
    PollScreen: {
        poll?: IPoll;
        comment?: IPollComment;
        pollId: string;
    };
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
                name="ClientTabNavigator"
                component={ClientTabNavigator}
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
                name="ViewUserScreen"
                component={ViewUserScreen}
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
                name="UserProfileScreen"
                component={UserProfileScreen}
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
        </NoBottom.Navigator>
    );
}
